const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50
const MAX_CHECKIN_PHOTOS = 9

exports.main = async (event = {}) => {
  const { action, data = {} } = event
  const { OPENID } = cloud.getWXContext()

  try {
    switch (action) {
      case 'getActivities':
        return await getActivities(data, OPENID)
      case 'getActivityById':
        return await getActivityById(data.id, OPENID)
      case 'publishActivity':
        return await publishActivity(data, OPENID)

      case 'signup':
        return await signup(data.activityId, OPENID)
      case 'cancelSignup':
        return await cancelSignup(data.activityId, OPENID)
      case 'getMySignups':
        return await getMySignups(OPENID)

      case 'submitCheckin':
        return await submitCheckin(data, OPENID)
      case 'getMyRecords':
        return await getMyRecords(data, OPENID)

      case 'getStatistics':
        return await getStatistics(OPENID)
      case 'exportReport':
        return await exportReport(data, OPENID)

      default:
        return { code: 400, message: '未定义的业务动作' }
    }
  } catch (err) {
    console.error(`[Action ${action}] Error:`, err)
    return { code: 500, message: err.message || '内部服务器错误' }
  }
}

function normalizePagination(page, pageSize) {
  const safePage = Math.max(parseInt(page, 10) || 1, 1)
  const safePageSize = Math.min(
    Math.max(parseInt(pageSize, 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  )

  return {
    page: safePage,
    pageSize: safePageSize,
    skip: (safePage - 1) * safePageSize
  }
}

function toBoundaryISO(input, endOfDay = false) {
  if (!input) return ''

  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return endOfDay
      ? `${input}T23:59:59.999Z`
      : `${input}T00:00:00.000Z`
  }

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return ''

  if (endOfDay) {
    date.setHours(23, 59, 59, 999)
  } else {
    date.setHours(0, 0, 0, 0)
  }

  return date.toISOString()
}

function resolveQueryWindow(params = {}) {
  const { timeRange, startDate, endDate } = params

  let startAt = toBoundaryISO(startDate, false)
  let endAt = toBoundaryISO(endDate, true)

  if (startAt || endAt) {
    return { startAt, endAt }
  }

  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  if (timeRange === 'today') {
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { startAt: start.toISOString(), endAt: end.toISOString() }
  }

  if (timeRange === 'week') {
    start.setHours(0, 0, 0, 0)
    start.setDate(start.getDate() - 6)
    end.setHours(23, 59, 59, 999)
    return { startAt: start.toISOString(), endAt: end.toISOString() }
  }

  if (timeRange === 'month') {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return { startAt: start.toISOString(), endAt: end.toISOString() }
  }

  return { startAt: '', endAt: '' }
}

async function safeRollback(transaction) {
  try {
    await transaction.rollback()
  } catch (rollbackErr) {
    console.warn('[transaction] rollback skipped:', rollbackErr && rollbackErr.message)
  }
}


function chunkArray(values, size = 20) {
  const chunks = []
  const list = Array.isArray(values) ? values : []

  for (let i = 0; i < list.length; i += size) {
    chunks.push(list.slice(i, i + size))
  }

  return chunks
}

async function fetchByFieldIn(collectionName, field, values, extraWhere = {}) {
  const uniqueValues = Array.from(new Set((values || []).filter(Boolean)))
  if (uniqueValues.length === 0) {
    return []
  }

  const chunks = chunkArray(uniqueValues, 20)
  const result = []

  for (const chunk of chunks) {
    const whereQuery = Object.assign({}, extraWhere, {
      [field]: _.in(chunk)
    })

    const res = await db.collection(collectionName)
      .where(whereQuery)
      .limit(100)
      .get()

    result.push(...(res.data || []))
  }

  return result
}

async function fetchAllByWhere(collectionName, whereQuery = {}, options = {}) {
  const pageSize = Math.min(Math.max(Number(options.pageSize) || 100, 1), 100)
  const orderByField = options.orderByField
  const orderDirection = options.orderDirection || 'desc'
  const result = []
  let skip = 0

  while (true) {
    let query = db.collection(collectionName).where(whereQuery)

    if (orderByField) {
      query = query.orderBy(orderByField, orderDirection)
    }

    const res = await query.skip(skip).limit(pageSize).get()
    const batch = res.data || []

    result.push(...batch)

    if (batch.length < pageSize) {
      break
    }

    skip += batch.length
  }

  return result
}

async function getUserRole(openid) {
  try {
    const res = await db.collection('users').where({ _openid: openid }).limit(1).get()
    if (res.data && res.data.length > 0) {
      return String(res.data[0].role || 'member')
    }
  } catch (err) {
    // 在未创建 users 集合时兜底为普通成员
    console.warn('[getUserRole] fallback to member:', err && err.message)
  }

  return 'member'
}

async function ensureAdmin(openid) {
  const role = await getUserRole(openid)
  if (role !== 'admin') {
    return { code: 403, message: '仅管理员可执行该操作' }
  }

  return null
}

async function getActivities(params = {}, openid) {
  const { page, pageSize, skip } = normalizePagination(params.page, params.pageSize)
  const { keyword, location } = params
  const { startAt, endAt } = resolveQueryWindow(params)

  const matchQuery = {}

  if (keyword) {
    matchQuery.name = db.RegExp({ regexp: keyword, options: 'i' })
  }

  if (location) {
    matchQuery.location = db.RegExp({ regexp: location, options: 'i' })
  }

  if (startAt) {
    matchQuery.endTime = _.gte(startAt)
  }
  if (endAt) {
    matchQuery.startTime = _.lte(endAt)
  }

  const countRes = await db.collection('activities').where(matchQuery).count()

  const activityRes = await db.collection('activities')
    .where(matchQuery)
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  const activities = activityRes.data || []
  let signupActivitySet = new Set()

  if (activities.length > 0) {
    const signupList = await fetchByFieldIn(
      'signups',
      'activityId',
      activities.map(item => item._id),
      { _openid: openid }
    )

    signupActivitySet = new Set((signupList || []).map(item => item.activityId))
  }

  const list = activities.map(item => ({
    ...item,
    isSignedUp: signupActivitySet.has(item._id)
  }))

  return {
    code: 0,
    data: {
      list,
      total: countRes.total,
      page,
      pageSize
    }
  }
}

async function getActivityById(id, openid) {
  if (!id) {
    return { code: 400, message: '缺少活动 ID' }
  }

  const activityRes = await db.collection('activities').where({ _id: id }).limit(1).get()
  if (!activityRes.data || activityRes.data.length === 0) {
    return { code: 404, message: '活动不存在' }
  }

  const activity = activityRes.data[0]

  const [signupRes, checkinRes] = await Promise.all([
    db.collection('signups').where({ activityId: id, _openid: openid }).count(),
    db.collection('records').where({ activityId: id, _openid: openid }).count()
  ])

  activity.isSignedUp = signupRes.total > 0
  activity.isCheckedIn = checkinRes.total > 0

  return { code: 0, data: activity }
}

async function publishActivity(form = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const name = String(form.name || '').trim()
  const location = String(form.location || '').trim()
  const description = String(form.description || '').trim()
  const startTime = String(form.startTime || '').trim()
  const endTime = String(form.endTime || '').trim()
  const maxCount = Number(form.maxCount)

  if (!name || !location || !description || !startTime || !endTime) {
    return { code: 400, message: '请完整填写活动信息' }
  }

  if (!Number.isInteger(maxCount) || maxCount <= 0) {
    return { code: 400, message: 'maxCount 必须是正整数' }
  }

  const startTs = new Date(startTime).getTime()
  const endTs = new Date(endTime).getTime()
  if (!Number.isFinite(startTs) || !Number.isFinite(endTs) || startTs >= endTs) {
    return { code: 400, message: '活动时间不合法' }
  }

  const newActivity = {
    name,
    location,
    description,
    startTime,
    endTime,
    maxCount,
    publisherId: openid,
    enrollCount: 0,
    createdAt: db.serverDate(),
    status: 'recruiting'
  }

  const res = await db.collection('activities').add({ data: newActivity })
  return { code: 0, data: { _id: res._id, ...newActivity } }
}

async function signup(activityId, openid) {
  if (!activityId) {
    return { code: 400, message: '缺少活动 ID' }
  }

  const transaction = await db.startTransaction()

  try {
    const activityRes = await transaction.collection('activities').where({ _id: activityId }).limit(1).get()
    if (!activityRes.data || activityRes.data.length === 0) {
      await safeRollback(transaction)
      return { code: 404, message: '活动不存在' }
    }

    const activity = activityRes.data[0]
    const enrollCount = Number(activity.enrollCount || 0)
    const maxCount = Number(activity.maxCount || 0)

    if (activity.status === 'ended') {
      await safeRollback(transaction)
      return { code: 400, message: '活动已结束，无法报名' }
    }

    if (maxCount > 0 && enrollCount >= maxCount) {
      await safeRollback(transaction)
      return { code: 400, message: '活动名额已满' }
    }

    const existing = await transaction.collection('signups').where({
      activityId,
      _openid: openid
    }).count()

    if (existing.total > 0) {
      await safeRollback(transaction)
      return { code: 400, message: '您已报名该活动' }
    }

    await transaction.collection('signups').add({
      data: {
        activityId,
        _openid: openid,
        signupAt: db.serverDate()
      }
    })

    await transaction.collection('activities').doc(activityId).update({
      data: { enrollCount: _.inc(1) }
    })

    await transaction.commit()
    return { code: 0, message: '报名成功' }
  } catch (err) {
    await safeRollback(transaction)
    console.error('[signup] error:', err)
    return { code: 500, message: '报名失败，请稍后重试' }
  }
}

async function cancelSignup(activityId, openid) {
  if (!activityId) {
    return { code: 400, message: '缺少活动 ID' }
  }

  const transaction = await db.startTransaction()

  try {
    const signupCount = await transaction.collection('signups').where({
      activityId,
      _openid: openid
    }).count()

    if (signupCount.total === 0) {
      await safeRollback(transaction)
      return { code: 400, message: '未找到报名记录' }
    }

    const removeRes = await transaction.collection('signups').where({
      activityId,
      _openid: openid
    }).remove()

    const removed = Number(removeRes.removed || signupCount.total || 0)
    if (removed > 0) {
      await transaction.collection('activities').doc(activityId).update({
        data: { enrollCount: _.inc(-removed) }
      })
    }

    await transaction.commit()
    return { code: 0, message: '已取消报名' }
  } catch (err) {
    await safeRollback(transaction)
    console.error('[cancelSignup] error:', err)
    return { code: 500, message: '取消报名失败，请稍后重试' }
  }
}

async function getMySignups(openid) {
  const signups = await fetchAllByWhere(
    'signups',
    { _openid: openid },
    { orderByField: 'signupAt', orderDirection: 'desc', pageSize: 100 }
  )

  if (!signups || signups.length === 0) {
    return { code: 0, data: [] }
  }

  const activityIds = signups.map(item => item.activityId).filter(Boolean)

  const [activities, records] = await Promise.all([
    fetchByFieldIn('activities', '_id', activityIds),
    fetchByFieldIn('records', 'activityId', activityIds, { _openid: openid })
  ])

  const activityMap = new Map((activities || []).map(item => [item._id, item]))
  const checkedSet = new Set((records || []).map(item => item.activityId))

  const list = signups
    .map(signup => {
      const activity = activityMap.get(signup.activityId)
      if (!activity) return null

      return {
        ...activity,
        activityId: signup.activityId,
        signupId: signup._id,
        signupAt: signup.signupAt,
        isSignedUp: true,
        isCheckedIn: checkedSet.has(signup.activityId)
      }
    })
    .filter(Boolean)

  return { code: 0, data: list }
}

async function submitCheckin(data = {}, openid) {
  const activityId = String(data.activityId || '').trim()
  const serviceHours = Number(data.serviceHours)
  const serviceCount = Number(data.serviceCount)
  const photos = Array.isArray(data.photos) ? data.photos.filter(Boolean) : []
  const remark = String(data.remark || '').trim()

  if (!activityId) {
    return { code: 400, message: '缺少活动 ID' }
  }

  if (!Number.isFinite(serviceHours) || serviceHours <= 0 || serviceHours > 24) {
    return { code: 400, message: '服务时长必须在 0 ~ 24 小时内' }
  }

  if (!Number.isInteger(serviceCount) || serviceCount < 1) {
    return { code: 400, message: '服务人数必须为正整数' }
  }

  if (photos.length > MAX_CHECKIN_PHOTOS) {
    return { code: 400, message: `照片最多上传 ${MAX_CHECKIN_PHOTOS} 张` }
  }

  const transaction = await db.startTransaction()

  try {
    const signupRes = await transaction.collection('signups').where({
      activityId,
      _openid: openid
    }).count()

    if (signupRes.total === 0) {
      await safeRollback(transaction)
      return { code: 403, message: '未报名该活动，无法打卡' }
    }

    const existingRecordRes = await transaction.collection('records').where({
      activityId,
      _openid: openid
    }).count()

    if (existingRecordRes.total > 0) {
      await safeRollback(transaction)
      return { code: 400, message: '该活动已提交过打卡记录' }
    }

    const activityRes = await transaction.collection('activities').where({ _id: activityId }).limit(1).get()
    if (!activityRes.data || activityRes.data.length === 0) {
      await safeRollback(transaction)
      return { code: 404, message: '活动不存在' }
    }

    const activity = activityRes.data[0]

    const record = {
      activityId,
      activityName: activity.name,
      activityLocation: activity.location,
      serviceHours,
      serviceCount,
      photos,
      remark,
      _openid: openid,
      checkedAt: db.serverDate(),
      status: 'pending'
    }

    const addRes = await transaction.collection('records').add({ data: record })
    await transaction.commit()

    return { code: 0, data: { _id: addRes._id, ...record } }
  } catch (err) {
    await safeRollback(transaction)
    console.error('[submitCheckin] error:', err)
    return { code: 500, message: '提交打卡失败，请稍后重试' }
  }
}

async function getMyRecords(params = {}, openid) {
  const { page, pageSize, skip } = normalizePagination(params.page, params.pageSize)

  const countRes = await db.collection('records').where({ _openid: openid }).count()
  const listRes = await db.collection('records')
    .where({ _openid: openid })
    .orderBy('checkedAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  return {
    code: 0,
    data: {
      list: listRes.data,
      total: countRes.total,
      page,
      pageSize
    }
  }
}

async function getStatistics(openid) {
  const statsRes = await db.collection('records')
    .aggregate()
    .match({
      _openid: openid,
      status: 'approved'
    })
    .group({
      _id: null,
      totalHours: $.sum('$serviceHours'),
      totalCount: $.sum(1),
      totalServed: $.sum('$serviceCount')
    })
    .end()

  const byActivityRes = await db.collection('records')
    .aggregate()
    .match({
      _openid: openid,
      status: 'approved'
    })
    .group({
      _id: '$activityName',
      personCount: $.sum('$serviceCount'),
      totalHours: $.sum('$serviceHours')
    })
    .sort({ totalHours: -1 })
    .end()

  const byCategoryRes = await db.collection('records')
    .aggregate()
    .match({
      _openid: openid,
      status: 'approved'
    })
    .group({
      _id: '$activityLocation',
      count: $.sum(1),
      totalHours: $.sum('$serviceHours')
    })
    .sort({ totalHours: -1 })
    .end()

  const stats = statsRes.list[0] || { totalHours: 0, totalCount: 0, totalServed: 0 }

  return {
    code: 0,
    data: {
      totalHours: Number(stats.totalHours || 0),
      totalCount: Number(stats.totalCount || 0),
      totalServed: Number(stats.totalServed || 0),
      byCategory: (byCategoryRes.list || []).map(item => ({
        category: item._id || '未分类',
        count: Number(item.count || 0),
        totalHours: Number(item.totalHours || 0)
      })),
      byActivity: (byActivityRes.list || []).map(item => ({
        activityName: item._id || '未知活动',
        personCount: Number(item.personCount || 0),
        totalHours: Number(item.totalHours || 0)
      }))
    }
  }
}

function escapeCsvCell(value) {
  const text = String(value == null ? '' : value)
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }

  return text
}

function buildReportRows(stats) {
  const rows = [
    ['指标', '数值'],
    ['总服务时长(小时)', stats.totalHours],
    ['参与活动次数', stats.totalCount],
    ['服务人数', stats.totalServed]
  ]

  if (Array.isArray(stats.byActivity) && stats.byActivity.length > 0) {
    rows.push([])
    rows.push(['活动名称', '服务人数', '服务时长(小时)'])
    stats.byActivity.forEach(item => {
      rows.push([item.activityName, item.personCount, item.totalHours])
    })
  }

  return rows
}

function formatStamp(date) {
  const yyyy = date.getFullYear()
  const MM = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${yyyy}${MM}${dd}-${hh}${mm}${ss}`
}

async function exportReport(_params = {}, openid) {
  const statsRes = await getStatistics(openid)
  if (statsRes.code !== 0) {
    return statsRes
  }

  const rows = buildReportRows(statsRes.data)
  const csvBody = rows
    .map(row => row.map(escapeCsvCell).join(','))
    .join('\n')

  // UTF-8 BOM，保证 Excel 打开中文不乱码
  const csv = `\uFEFF${csvBody}`
  const stamp = formatStamp(new Date())
  const cloudPath = `volunteer-reports/${openid}/volunteer-report-${stamp}.csv`

  const uploadRes = await cloud.uploadFile({
    cloudPath,
    fileContent: Buffer.from(csv, 'utf8')
  })

  return {
    code: 0,
    data: uploadRes.fileID
  }
}
