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
const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

exports.main = async (event = {}) => {
  const { action, data = {} } = event
  const { OPENID } = cloud.getWXContext()

  try {
    switch (action) {
      case 'wechatLogin':
        return await wechatLogin(data, OPENID)
      case 'adminLogin':
        return await adminLogin(data, OPENID)
      case 'bindUser':
        return await bindUser(data, OPENID)

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

      case 'submitHonor':
        return await submitHonor(data, OPENID)

      case 'adminGetUsers':
        return await adminGetUsers(data, OPENID)
      case 'adminGetUser':
        return await adminGetUser(data, OPENID)
      case 'getPointsLogs':
        return await getPointsLogs(data, OPENID)
      case 'adjustUserPoints':
        return await adjustUserPoints(data, OPENID)
      case 'adminGetCheckins':
        return await adminGetCheckins(data, OPENID)
      case 'auditCheckin':
        return await auditCheckin(data, OPENID)
      case 'adminGetStats':
        return await adminGetStats(data, OPENID)
      case 'adminGetHonors':
        return await adminGetHonors(data, OPENID)
      case 'adminAuditHonor':
        return await adminAuditHonor(data, OPENID)

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

function isAdminSessionActive(user) {
  if (!user || !user.adminSessionExpiresAt) return false

  const expiresAt = new Date(user.adminSessionExpiresAt).getTime()
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

async function getUserRole(openid) {
  try {
    const user = await getUserByOpenid(openid)
    if (user && (String(user.role || 'member') === 'admin' || isAdminSessionActive(user))) {
      return 'admin'
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
  const category = String(form.category || '').trim()
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
    category,
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
  const declaredPoints = Number(data.declaredPoints)
  const activityCategory = String(data.activityCategory || '').trim()
  const serviceHours = Number(data.serviceHours)
  const serviceCount = Number(data.serviceCount)
  const photos = Array.isArray(data.photos) ? data.photos.filter(Boolean) : []
  const remark = String(data.remark || '').trim()

  if (!activityId) {
    return { code: 400, message: '缺少活动 ID' }
  }

  if (!Number.isFinite(declaredPoints) || declaredPoints <= 0) {
    return { code: 400, message: '申报积分必须为正整数' }
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
      activityCategory: activity.category || activityCategory || '其他服务',
      activityLocation: activity.location,
      declaredPoints,
      photos,
      remark,
      _openid: openid,
      checkedAt: db.serverDate(),
      status: 'pending'
    }

    if (Number.isFinite(serviceHours) && serviceHours > 0) {
      record.serviceHours = serviceHours
    }

    if (Number.isInteger(serviceCount) && serviceCount > 0) {
      record.serviceCount = serviceCount
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
  const [userRes, checkinCountRes, honorCountRes] = await Promise.all([
    db.collection('users').where({ _openid: openid }).limit(1).get(),
    db.collection('records').where({ _openid: openid }).count(),
    db.collection('honors').where({ _openid: openid }).count()
  ])

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
  const user = userRes.data && userRes.data.length > 0 ? userRes.data[0] : null

  const [checkinRecordsRes, honorRecordsRes] = await Promise.all([
    db.collection('records').where({ _openid: openid }).orderBy('checkedAt', 'desc').limit(50).get(),
    db.collection('honors').where({ _openid: openid }).orderBy('createdAt', 'desc').limit(50).get()
  ])

  return {
    code: 0,
    data: {
      totalHours: Number(stats.totalHours || 0),
      totalCount: Number(stats.totalCount || 0),
      totalServed: Number(stats.totalServed || 0),
      totalPoints: Number(user?.totalPoints || 0),
      totalCheckins: Number(checkinCountRes.total || 0),
      totalHonors: Number(honorCountRes.total || 0),
      checkinRecords: checkinRecordsRes.data || [],
      honorRecords: honorRecordsRes.data || [],
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

function buildToken(openid) {
  return `token_${openid}_${Date.now()}`
}

async function findAdminByCredential(account, password) {
  const inputAccount = String(account || '').trim()
  const inputPassword = String(password || '').trim()
  if (!inputAccount || !inputPassword) return null

  const res = await db.collection('users').where({ role: 'admin' }).limit(100).get()
  const adminUsers = res.data || []

  for (const user of adminUsers) {
    const candidateAccounts = [
      user.adminAccount,
      user.account,
      user.username,
      user.loginAccount,
      user.phone
    ]
      .map(v => String(v == null ? '' : v).trim())
      .filter(Boolean)

    const candidatePasswords = [
      user.adminPassword,
      user.password,
      user.passwd,
      user.loginPassword
    ]
      .map(v => String(v == null ? '' : v).trim())
      .filter(Boolean)

    if (candidateAccounts.includes(inputAccount) && candidatePasswords.includes(inputPassword)) {
      return user
    }
  }

  console.warn(`[adminLogin] credential mismatch, account=${inputAccount}, adminCount=${adminUsers.length}`)
  return null
}

async function attachAdminSession(openid, account, adminUser) {
  const user = await ensureUser(openid)
  if (!user || !user._id) return null

  const now = new Date()
  const expiresAt = new Date(now.getTime() + ADMIN_SESSION_TTL_MS)

  await db.collection('users').doc(user._id).update({
    data: {
      adminSessionAccount: account,
      adminSessionUserId: adminUser?._id || '',
      adminSessionAt: now,
      adminSessionExpiresAt: expiresAt,
      updatedAt: db.serverDate()
    }
  })

  const latest = await db.collection('users').doc(user._id).get()
  return latest.data || user
}

async function adminLogin(data = {}, openid) {
  const account = String(data.account || '').trim()
  const password = String(data.password || '').trim()

  if (!account || !password) {
    return { code: 400, message: '请输入管理员账号和密码' }
  }
  if (!openid) {
    return { code: 400, message: '缺少用户标识' }
  }

  const credentialUser = await findAdminByCredential(account, password)
  if (!credentialUser) {
    return { code: 401, message: '账号或密码错误' }
  }

  await attachAdminSession(openid, account, credentialUser)
  const normalizedUser = normalizeUserData(credentialUser)
  const displayName = String(
    credentialUser.nickName ||
    credentialUser.nickname ||
    credentialUser.realName ||
    credentialUser.adminAccount ||
    credentialUser.account ||
    account
  ).trim()
  const userInfo = {
    ...normalizedUser,
    nickName: displayName,
    nickname: displayName,
    avatar: credentialUser.avatar || credentialUser.avatarUrl || '',
    avatarUrl: credentialUser.avatarUrl || credentialUser.avatar || '',
    role: 'admin'
  }

  return {
    code: 0,
    data: {
      token: buildToken(openid),
      userInfo
    }
  }
}

function normalizeUserData(user) {
  if (!user) return user
  const role = user.role === 'admin' || isAdminSessionActive(user) ? 'admin' : 'member'
  return {
    ...user,
    totalPoints: Number(user.totalPoints || 0),
    checkinCount: Number(user.checkinCount || 0),
    role
  }
}

async function getUserByOpenid(openid) {
  if (!openid) return null
  const res = await db.collection('users').where({ _openid: openid }).limit(1).get()
  return res.data && res.data.length > 0 ? res.data[0] : null
}

async function ensureUser(openid) {
  if (!openid) return null
  const existing = await getUserByOpenid(openid)
  if (existing) return existing

  const data = {
    _openid: openid,
    realName: '',
    phone: '',
    role: 'member',
    totalPoints: 0,
    checkinCount: 0,
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }

  const res = await db.collection('users').add({ data })
  const created = await db.collection('users').doc(res._id).get()
  return created.data || { _id: res._id, ...data }
}

async function wechatLogin(_data, openid) {
  if (!openid) {
    return { code: 400, message: '缺少用户标识' }
  }

  const user = await ensureUser(openid)
  const normalized = normalizeUserData(user)
  const needBinding = !normalized?.realName || !normalized?.phone

  return {
    code: 0,
    data: {
      needBinding,
      openid,
      token: buildToken(openid),
      userInfo: normalized
    }
  }
}

async function bindUser(data = {}, openidFromCtx) {
  const openid = String(data.openid || openidFromCtx || '').trim()
  const realName = String(data.realName || '').trim()
  const phone = String(data.phone || '').trim()

  if (!openid) {
    return { code: 400, message: '缺少 openid' }
  }
  if (!realName || !phone) {
    return { code: 400, message: '请填写完整姓名和手机号' }
  }

  const user = await getUserByOpenid(openid)
  const updateData = {
    realName,
    phone,
    updatedAt: db.serverDate(),
    bindAt: user?.bindAt || db.serverDate()
  }

  if (user && user._id) {
    await db.collection('users').doc(user._id).update({ data: updateData })
  } else {
    await db.collection('users').add({
      data: {
        _openid: openid,
        role: 'member',
        totalPoints: 0,
        checkinCount: 0,
        createdAt: db.serverDate(),
        ...updateData
      }
    })
  }

  const latest = await getUserByOpenid(openid)
  return {
    code: 0,
    data: {
      token: buildToken(openid),
      userInfo: normalizeUserData(latest)
    }
  }
}

async function submitHonor(data = {}, openid) {
  const honorLevel = String(data.honorLevel || '').trim()
  const honorPoints = Number(data.honorPoints)
  const proofs = Array.isArray(data.proofs) ? data.proofs.filter(Boolean) : []
  const userId = String(data.userId || '').trim()

  if (!honorLevel || !Number.isFinite(honorPoints) || honorPoints <= 0) {
    return { code: 400, message: '荣誉信息不完整' }
  }

  let user = null
  if (userId) {
    try {
      const res = await db.collection('users').doc(userId).get()
      user = res.data || null
    } catch (err) {
      user = null
    }
  }
  if (!user) {
    user = await getUserByOpenid(openid)
  }

  const record = {
    userId: user?._id || userId || '',
    userName: user?.realName || '',
    phone: user?.phone || '',
    honorLevel,
    honorPoints,
    proofs,
    status: 'pending',
    _openid: openid,
    createdAt: db.serverDate()
  }

  const res = await db.collection('honors').add({ data: record })
  return { code: 0, data: { id: res._id } }
}

async function adminGetUsers(params = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const { page, pageSize, skip } = normalizePagination(params.page, params.pageSize)
  const keyword = String(params.keyword || '').trim()

  let query = db.collection('users')
  if (keyword) {
    const kw = db.RegExp({ regexp: keyword, options: 'i' })
    query = query.where(_.or([{ realName: kw }, { phone: kw }]))
  }

  const countRes = await query.count()
  const listRes = await query
    .skip(skip)
    .limit(pageSize)
    .get()

  const list = (listRes.data || []).map(normalizeUserData)

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

async function adminGetUser(params = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const id = String(params.id || '').trim()
  if (!id) return { code: 400, message: '缺少用户 ID' }

  try {
    const res = await db.collection('users').doc(id).get()
    if (!res.data) return { code: 404, message: '用户不存在' }
    return { code: 0, data: normalizeUserData(res.data) }
  } catch (err) {
    return { code: 404, message: '用户不存在' }
  }
}

async function getPointsLogs(params = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const userId = String(params.userId || '').trim()
  if (!userId) return { code: 400, message: '缺少用户 ID' }

  const res = await db.collection('points_logs')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .limit(200)
    .get()

  return { code: 0, data: { list: res.data || [] } }
}

async function adjustUserPoints(data = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const targetUserId = String(data.targetUserId || '').trim()
  const amount = Number(data.amount)
  const reason = String(data.reason || '').trim()

  if (!targetUserId) return { code: 400, message: '缺少目标用户' }
  if (!Number.isFinite(amount) || amount === 0) return { code: 400, message: '调整数值不合法' }
  if (!reason) return { code: 400, message: '必须填写调整原因' }

  const transaction = await db.startTransaction()
  try {
    const userRes = await transaction.collection('users').doc(targetUserId).get()
    if (!userRes.data) {
      await safeRollback(transaction)
      return { code: 404, message: '用户不存在' }
    }

    const user = userRes.data
    const currentPoints = Number(user.totalPoints || 0)
    const nextPoints = currentPoints + amount
    if (nextPoints < 0) {
      await safeRollback(transaction)
      return { code: 400, message: '扣减后积分不可为负数' }
    }

    await transaction.collection('users').doc(targetUserId).update({
      data: {
        totalPoints: nextPoints,
        updatedAt: db.serverDate()
      }
    })

    await transaction.collection('points_logs').add({
      data: {
        userId: targetUserId,
        userOpenid: user._openid || '',
        operatorId: openid,
        changeAmount: amount,
        afterPoints: nextPoints,
        reason,
        type: 'manual_adjust',
        createdAt: db.serverDate()
      }
    })

    await transaction.commit()
    return { code: 0, data: { success: true } }
  } catch (err) {
    await safeRollback(transaction)
    console.error('[adjustUserPoints] error:', err)
    return { code: 500, message: '操作失败，请稍后重试' }
  }
}

async function adminGetCheckins(params = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const { page, pageSize, skip } = normalizePagination(params.page, params.pageSize)
  const status = String(params.status || '').trim()
  const whereQuery = status ? { status } : {}

  const countRes = await db.collection('records').where(whereQuery).count()
  const listRes = await db.collection('records')
    .where(whereQuery)
    .orderBy('checkedAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  const records = listRes.data || []
  const userOpenids = records.map(item => item._openid).filter(Boolean)
  const users = await fetchByFieldIn('users', '_openid', userOpenids)
  const userMap = new Map((users || []).map(item => [item._openid, item]))

  const list = records.map(record => {
    const user = userMap.get(record._openid)
    return {
      ...record,
      realName: user?.realName || '',
      phone: user?.phone || ''
    }
  })

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

async function auditCheckin(data = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const recordId = String(data.recordId || '').trim()
  const pass = !!data.pass
  const rejectReason = String(data.rejectReason || '').trim()

  if (!recordId) return { code: 400, message: '缺少记录 ID' }

  const transaction = await db.startTransaction()
  try {
    const recordRes = await transaction.collection('records').doc(recordId).get()
    const record = recordRes.data

    if (!record) {
      await safeRollback(transaction)
      return { code: 404, message: '记录不存在' }
    }

    if (record.status && record.status !== 'pending') {
      await safeRollback(transaction)
      return { code: 400, message: '该记录已审核' }
    }

    if (pass) {
      const declaredPoints = Number(record.declaredPoints || 0)
      const userRes = await transaction.collection('users').where({ _openid: record._openid }).limit(1).get()
      let user = userRes.data && userRes.data.length > 0 ? userRes.data[0] : null

      if (!user) {
        const createRes = await transaction.collection('users').add({
          data: {
            _openid: record._openid,
            realName: record.realName || '',
            phone: record.phone || '',
            role: 'member',
            totalPoints: 0,
            checkinCount: 0,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        })
        const createdUser = await transaction.collection('users').doc(createRes._id).get()
        user = createdUser.data
      }

      const currentPoints = Number(user?.totalPoints || 0)
      const nextPoints = currentPoints + declaredPoints
      const nextCheckinCount = Number(user?.checkinCount || 0) + 1

      await transaction.collection('users').doc(user._id).update({
        data: {
          totalPoints: nextPoints,
          checkinCount: nextCheckinCount,
          updatedAt: db.serverDate()
        }
      })

      await transaction.collection('records').doc(recordId).update({
        data: {
          status: 'approved',
          auditedAt: db.serverDate(),
          auditorOpenid: openid,
          updatedAt: db.serverDate(),
          rejectReason: ''
        }
      })

      await transaction.collection('points_logs').add({
        data: {
          userId: user._id,
          userOpenid: user._openid || '',
          operatorId: openid,
          changeAmount: declaredPoints,
          afterPoints: nextPoints,
          reason: `打卡审核通过：${record.activityName || ''}`,
          type: 'audit_pass',
          recordId,
          createdAt: db.serverDate()
        }
      })
    } else {
      if (!rejectReason) {
        await safeRollback(transaction)
        return { code: 400, message: '必须填写驳回原因' }
      }

      await transaction.collection('records').doc(recordId).update({
        data: {
          status: 'rejected',
          rejectReason,
          auditedAt: db.serverDate(),
          auditorOpenid: openid,
          updatedAt: db.serverDate()
        }
      })
    }

    await transaction.commit()
    return { code: 0, data: { success: true } }
  } catch (err) {
    await safeRollback(transaction)
    console.error('[auditCheckin] error:', err)
    return { code: 500, message: '审核失败，请稍后重试' }
  }
}

async function adminGetStats(_params = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const usersCount = await db.collection('users').count()
  const checkinsCount = await db.collection('records').count()

  const pointsAgg = await db.collection('users')
    .aggregate()
    .group({ _id: null, totalPointsIssued: $.sum('$totalPoints') })
    .end()

  const totalPointsIssued = pointsAgg.list[0]?.totalPointsIssued || 0

  const topRes = await db.collection('users')
    .orderBy('totalPoints', 'desc')
    .limit(5)
    .get()

  const topUsers = (topRes.data || []).map(item => ({
    realName: item.realName || '未命名',
    totalPoints: Number(item.totalPoints || 0)
  }))

  return {
    code: 0,
    data: {
      totalUsers: usersCount.total,
      totalCheckins: checkinsCount.total,
      totalPointsIssued,
      topUsers
    }
  }
}

async function adminGetHonors(params = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const { page, pageSize, skip } = normalizePagination(params.page, params.pageSize)
  const status = String(params.status || '').trim()
  const whereQuery = status ? { status } : {}

  const countRes = await db.collection('honors').where(whereQuery).count()
  const listRes = await db.collection('honors')
    .where(whereQuery)
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  const honors = listRes.data || []
  const userIds = honors.map(item => item.userId).filter(Boolean)
  const users = await fetchByFieldIn('users', '_id', userIds)
  const userMap = new Map((users || []).map(item => [item._id, item]))

  const list = honors.map(item => {
    const user = userMap.get(item.userId)
    return {
      ...item,
      id: item._id,
      userName: item.userName || user?.realName || '',
      phone: item.phone || user?.phone || ''
    }
  })

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

async function adminAuditHonor(data = {}, openid) {
  const adminError = await ensureAdmin(openid)
  if (adminError) return adminError

  const honorId = String(data.id || '').trim()
  const pass = !!data.pass
  const rejectReason = String(data.rejectReason || '').trim()

  if (!honorId) return { code: 400, message: '缺少荣誉记录 ID' }

  const transaction = await db.startTransaction()
  try {
    const honorRes = await transaction.collection('honors').doc(honorId).get()
    const honor = honorRes.data

    if (!honor) {
      await safeRollback(transaction)
      return { code: 404, message: '荣誉记录不存在' }
    }

    if (honor.status && honor.status !== 'pending') {
      await safeRollback(transaction)
      return { code: 400, message: '该记录已审核' }
    }

    if (pass) {
      const honorPoints = Number(honor.honorPoints || 0)
      let user = null
      if (honor.userId) {
        try {
          const userRes = await transaction.collection('users').doc(honor.userId).get()
          user = userRes.data || null
        } catch (err) {
          user = null
        }
      }
      if (!user && honor._openid) {
        const userRes = await transaction.collection('users').where({ _openid: honor._openid }).limit(1).get()
        user = userRes.data && userRes.data.length > 0 ? userRes.data[0] : null
      }
      if (!user) {
        await safeRollback(transaction)
        return { code: 404, message: '用户不存在' }
      }

      const currentPoints = Number(user.totalPoints || 0)
      const nextPoints = currentPoints + honorPoints

      await transaction.collection('users').doc(user._id).update({
        data: {
          totalPoints: nextPoints,
          updatedAt: db.serverDate()
        }
      })

      await transaction.collection('honors').doc(honorId).update({
        data: {
          status: 'approved',
          auditedAt: db.serverDate(),
          auditorOpenid: openid,
          updatedAt: db.serverDate(),
          rejectReason: ''
        }
      })

      await transaction.collection('points_logs').add({
        data: {
          userId: user._id,
          userOpenid: user._openid || '',
          operatorId: openid,
          changeAmount: honorPoints,
          afterPoints: nextPoints,
          reason: `荣誉审核通过：${honor.honorLevel || ''}`,
          type: 'audit_pass',
          honorId,
          createdAt: db.serverDate()
        }
      })
    } else {
      if (!rejectReason) {
        await safeRollback(transaction)
        return { code: 400, message: '必须填写驳回原因' }
      }

      await transaction.collection('honors').doc(honorId).update({
        data: {
          status: 'rejected',
          rejectReason,
          auditedAt: db.serverDate(),
          auditorOpenid: openid,
          updatedAt: db.serverDate()
        }
      })
    }

    await transaction.commit()
    return { code: 0, data: { success: true } }
  } catch (err) {
    await safeRollback(transaction)
    console.error('[adminAuditHonor] error:', err)
    return { code: 500, message: '审核失败，请稍后重试' }
  }
}
