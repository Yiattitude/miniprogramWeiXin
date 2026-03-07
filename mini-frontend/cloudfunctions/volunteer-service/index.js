// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

/**
 * 志愿活动后端逻辑清单实现
 * 1. 活动管理 (列表、详情、发布)
 * 2. 报名管理 (报名、取消、查询)
 * 3. 打卡管理 (提交、查询)
 * 4. 统计报表 (聚合查询)
 */
exports.main = async (event, context) => {
  const { action, data } = event
  const { OPENID } = cloud.getWXContext()

  try {
    switch (action) {
      // --- 活动管理 ---
      case 'getActivities':
        return await getActivities(data, OPENID)
      case 'getActivityById':
        return await getActivityById(data.id, OPENID)
      case 'publishActivity':
        return await publishActivity(data, OPENID)

      // --- 报名管理 ---
      case 'signup':
        return await signup(data.activityId, OPENID)
      case 'cancelSignup':
        return await cancelSignup(data.activityId, OPENID)
      case 'getMySignups':
        return await getMySignups(OPENID)

      // --- 打卡管理 ---
      case 'submitCheckin':
        return await submitCheckin(data, OPENID)
      case 'getMyRecords':
        return await getMyRecords(data, OPENID)

      // --- 统计报表 ---
      case 'getStatistics':
        return await getStatistics(OPENID)

      default:
        return { code: 400, message: '未定义的业务动作' }
    }
  } catch (err) {
    console.error(`[Action ${action}] Error:`, err)
    return { code: 500, message: err.message || '内部服务器错误' }
  }
}

/**
 * 1.1 获取活动列表 (支持筛选和分页)
 */
async function getActivities(params, openid) {
  const { page = 1, pageSize = 10, keyword, location, timeRange } = params
  const skip = (page - 1) * pageSize

  // 构建查询条件
  let matchQuery = {}
  if (keyword) {
    matchQuery.name = db.RegExp({ regexp: keyword, options: 'i' })
  }
  if (location && location !== '全部地点') {
    matchQuery.location = db.RegExp({ regexp: location, options: 'i' })
  }

  // 1. 获取总数
  const countRes = await db.collection('activities').where(matchQuery).count()
  
  // 2. 联表查询当前用户的报名状态 (使用聚合)
  const listRes = await db.collection('activities')
    .aggregate()
    .match(matchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageSize)
    .lookup({
      from: 'signups',
      let: { activity_id: '$_id' },
      pipeline: $.pipeline()
        .match($.expr($.and([
          $.eq(['$activityId', '$$activity_id']),
          $.eq(['$_openid', openid])
        ])))
        .done(),
      as: 'userSignup'
    })
    .addFields({
      isSignedUp: $.gt([$.size('$userSignup'), 0])
    })
    .project({
      userSignup: 0 // 移除临时字段
    })
    .end()

  return {
    code: 0,
    data: {
      list: listRes.list,
      total: countRes.total
    }
  }
}

/**
 * 1.2 获取活动详情
 */
async function getActivityById(id, openid) {
  const activityRes = await db.collection('activities').doc(id).get()
  const activity = activityRes.data

  // 查询用户是否已报名
  const signupRes = await db.collection('signups').where({
    activityId: id,
    _openid: openid
  }).count()

  activity.isSignedUp = signupRes.total > 0

  return { code: 0, data: activity }
}

/**
 * 1.3 发布活动 (管理员)
 */
async function publishActivity(form, openid) {
  const newActivity = {
    ...form,
    publisherId: openid,
    enrollCount: 0,
    createdAt: db.serverDate(),
    status: 'recruiting'
  }

  const res = await db.collection('activities').add({ data: newActivity })
  return { code: 0, data: { _id: res._id, ...newActivity } }
}

/**
 * 2.1 报名活动 (原子操作)
 */
async function signup(activityId, openid) {
  // 1. 检查是否重复报名
  const existing = await db.collection('signups').where({
    activityId,
    _openid: openid
  }).get()

  if (existing.data.length > 0) {
    return { code: 400, message: '您已报名该活动' }
  }

  // 2. 事务性报名 (这里使用简化的两步操作，实际生产环境建议用 transaction)
  try {
    // 增加名额
    const updateRes = await db.collection('activities').doc(activityId).update({
      data: { enrollCount: _.inc(1) }
    })

    if (updateRes.stats.updated === 0) {
      return { code: 404, message: '活动不存在' }
    }

    // 插入记录
    await db.collection('signups').add({
      data: {
        activityId,
        _openid: openid,
        signupAt: db.serverDate()
      }
    })

    return { code: 0, message: '报名成功' }
  } catch (err) {
    return { code: 500, message: '报名失败，请重试' }
  }
}

/**
 * 2.2 取消报名
 */
async function cancelSignup(activityId, openid) {
  const res = await db.collection('signups').where({
    activityId,
    _openid: openid
  }).remove()

  if (res.removed === 0) {
    return { code: 400, message: '未找到报名记录' }
  }

  // 减少名额
  await db.collection('activities').doc(activityId).update({
    data: { enrollCount: _.inc(-1) }
  })

  return { code: 0, message: '已取消报名' }
}

/**
 * 2.3 获取我的报名
 */
async function getMySignups(openid) {
  // 联表查询我报名的活动详情
  const res = await db.collection('signups')
    .aggregate()
    .match({ _openid: openid })
    .lookup({
      from: 'activities',
      localField: 'activityId',
      foreignField: '_id',
      as: 'activityInfo'
    })
    .unwind('$activityInfo')
    .replaceRoot({
      newRoot: $.mergeObjects(['$activityInfo', '$$ROOT'])
    })
    .project({
      activityInfo: 0
    })
    .sort({ signupAt: -1 })
    .end()

  return { code: 0, data: res.list }
}

/**
 * 3.1 提交打卡
 */
async function submitCheckin(data, openid) {
  // 获取活动基本信息用于冗余存储
  const activityRes = await db.collection('activities').doc(data.activityId).get()
  const activity = activityRes.data

  const record = {
    activityId: data.activityId,
    activityName: activity.name,
    activityLocation: activity.location,
    serviceHours: data.serviceHours,
    serviceCount: data.serviceCount,
    photos: data.photos,
    remark: data.remark || '',
    _openid: openid,
    checkedAt: db.serverDate(),
    status: 'pending' // 待审核
  }

  const res = await db.collection('records').add({ data: record })
  return { code: 0, data: { _id: res._id, ...record } }
}

/**
 * 3.2 获取我的打卡记录
 */
async function getMyRecords(params, openid) {
  const { page = 1, pageSize = 10 } = params
  const skip = (page - 1) * pageSize

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
      total: countRes.total
    }
  }
}

/**
 * 4.1 获取个人统计数据
 */
async function getStatistics(openid) {
  // 聚合计算已通过的打卡记录
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

  const stats = statsRes.list[0] || { totalHours: 0, totalCount: 0, totalServed: 0 }

  return {
    code: 0,
    data: {
      totalHours: stats.totalHours,
      totalCount: stats.totalCount,
      totalServed: stats.totalServed,
      // 占位字段，适配前端类型
      byCategory: [],
      byActivity: []
    }
  }
}
