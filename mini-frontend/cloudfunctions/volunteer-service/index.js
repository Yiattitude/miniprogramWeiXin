// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event
  const { OPENID } = cloud.getWXContext()

  switch (action) {
    case 'getActivities':
      return await getActivities(data)
    case 'getActivityById':
      return await getActivityById(data.id)
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
    case 'login':
      return await login(data, OPENID)
    case 'updateProfile':
    case 'updateAvatar':
      return await updateProfile(data, OPENID)
    default:
      return {
        code: 400,
        message: 'Unknown action'
      }
  }
}

async function login(data, openid) {
  const { userInfo } = data || {}
  const res = await db.collection('users').where({
    _openid: openid
  }).get()

  if (res.data.length === 0) {
    const normalizedUserInfo = { ...userInfo }
    if (!normalizedUserInfo.nickName || normalizedUserInfo.nickName === '微信用户') {
      const randomNum = Math.floor(Math.random() * 9000) + 1000
      normalizedUserInfo.nickName = '微信用户' + randomNum
    }
    const newUser = {
      ...normalizedUserInfo,
      _openid: openid,
      role: 'member',
      createdAt: db.serverDate()
    }
    await db.collection('users').add({
      data: newUser
    })
    return { code: 0, data: newUser }
  }

  return { code: 0, data: res.data[0] }
}

async function updateProfile(data, openid) {
  const res = await db.collection('users').where({
    _openid: openid
  }).get()

  if (res.data.length === 0) {
    await db.collection('users').add({
      data: {
        ...data,
        _openid: openid,
        role: 'member',
        createdAt: db.serverDate()
      }
    })
  } else {
    await db.collection('users').where({
      _openid: openid
    }).update({
      data: {
        ...data,
        updatedAt: db.serverDate()
      }
    })
  }

  return { code: 0, message: '更新成功' }
}

async function getActivities(params) {
  const { page = 1, pageSize = 10, keyword, location } = params
  let query = db.collection('activities')

  if (keyword) {
    query = query.where({
      name: db.RegExp({
        regexp: keyword,
        options: 'i',
      })
    })
  }

  if (location) {
    query = query.where({
      location: db.RegExp({
        regexp: location,
        options: 'i',
      })
    })
  }

  const countRes = await query.count()
  const listRes = await query.orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
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

async function getActivityById(id) {
  const res = await db.collection('activities').doc(id).get()
  return {
    code: 0,
    data: res.data
  }
}

async function publishActivity(data, openid) {
  const newActivity = {
    ...data,
    publisherId: openid,
    enrollCount: 0,
    createdAt: db.serverDate(),
    status: 'recruiting' // 初始状态
  }

  const res = await db.collection('activities').add({
    data: newActivity
  })

  return {
    code: 0,
    data: {
      id: res._id,
      ...newActivity
    }
  }
}

async function signup(activityId, openid) {
  // 1. 检查是否已报名
  const existing = await db.collection('signups').where({
    activityId,
    _openid: openid
  }).get()

  if (existing.data.length > 0) {
    return { code: 400, message: '已报名该活动' }
  }

  // 2. 增加活动报名人数
  await db.collection('activities').doc(activityId).update({
    data: {
      enrollCount: _.inc(1)
    }
  })

  // 3. 记录报名
  await db.collection('signups').add({
    data: {
      activityId,
      _openid: openid,
      signupAt: db.serverDate()
    }
  })

  return { code: 0, message: '报名成功' }
}

async function cancelSignup(activityId, openid) {
  // 1. 删除报名记录
  const res = await db.collection('signups').where({
    activityId,
    _openid: openid
  }).remove()

  if (res.removed === 0) {
    return { code: 400, message: '未找到报名记录' }
  }

  // 2. 减少活动报名人数
  await db.collection('activities').doc(activityId).update({
    data: {
      enrollCount: _.inc(-1)
    }
  })

  return { code: 0, message: '已取消报名' }
}

async function getMySignups(openid) {
  const res = await db.collection('signups').where({
    _openid: openid
  }).get()

  const activityIds = res.data.map(s => s.activityId)
  if (activityIds.length === 0) return { code: 0, data: [] }

  const activitiesRes = await db.collection('activities').where({
    _id: _.in(activityIds)
  }).get()

  return {
    code: 0,
    data: activitiesRes.data
  }
}

async function submitCheckin(data, openid) {
  const record = {
    ...data,
    _openid: openid,
    checkedAt: db.serverDate(),
    status: 'pending'
  }

  const res = await db.collection('records').add({
    data: record
  })

  return {
    code: 0,
    data: {
      id: res._id,
      ...record
    }
  }
}

async function getMyRecords(params, openid) {
  const { page = 1, pageSize = 10 } = params
  const query = db.collection('records').where({
    _openid: openid
  })

  const countRes = await query.count()
  const listRes = await query.orderBy('checkedAt', 'desc')
    .skip((page - 1) * pageSize)
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

async function getStatistics(openid) {
  // 示例统计逻辑
  const records = await db.collection('records').where({
    _openid: openid,
    status: 'approved'
  }).get()

  let totalHours = 0
  records.data.forEach(r => {
    totalHours += r.serviceHours || 0
  })

  return {
    code: 0,
    data: {
      totalHours,
      totalCount: records.data.length,
      // ... 其他统计
    }
  }
}
