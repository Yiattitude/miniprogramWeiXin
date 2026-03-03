/**
 * @file mock.ts
 * @description 全量 Mock 数据服务——无需后端即可完整演示所有功能
 *              发布活动 → 列表 → 报名 → 打卡 → 记录 → 统计 全链路可用
 *
 * TODO: 后端就绪后，在 src/api/volunteer.ts 中将 import 切换回真实接口
 */

import type {
  Activity,
  ActivityStatus,
  CheckinForm,
  CheckinRecord,
  PublishActivityForm,
  StatisticsData,
  PageResult,
} from '@/types/volunteer'

// ════════════════════════════════════════
//  内存数据库
// ════════════════════════════════════════

let _nextId = 100

function genId() {
  return String(++_nextId)
}

function now() {
  return new Date().toISOString()
}

/** 计算活动状态 */
function calcStatus(startTime: string, endTime: string): ActivityStatus {
  const now = Date.now()
  const start = new Date(startTime).getTime()
  const end = new Date(endTime).getTime()
  if (now < start) return 'recruiting'
  if (now >= start && now <= end) return 'ongoing'
  return 'ended'
}

// ── 种子活动 ──
const _activities: Activity[] = [
  {
    id: '1',
    name: '社区环保清洁行动',
    startTime: '2026-03-10 09:00',
    endTime: '2026-03-10 12:00',
    location: '市中心广场',
    description: '组织志愿者清洁社区公共区域，维护城市环境卫生，请穿着舒适运动鞋参加。',
    maxCount: 30,
    enrollCount: 12,
    status: 'recruiting',
    publisherId: 'admin',
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false,
  },
  {
    id: '2',
    name: '老年人健康讲座志愿服务',
    startTime: '2026-03-15 14:00',
    endTime: '2026-03-15 17:00',
    location: '社区服务站二楼',
    description: '协助组织老年人健康知识讲座，负责签到、引导及会场维护工作。',
    maxCount: 20,
    enrollCount: 8,
    status: 'recruiting',
    publisherId: 'admin',
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false,
  },
  {
    id: '3',
    name: '春季义诊活动',
    startTime: '2026-03-20 08:30',
    endTime: '2026-03-20 16:00',
    location: '人民医院门诊大厅',
    description: '协助医护人员开展免费义诊，协助维持秩序、引导患者排队就诊。',
    maxCount: 15,
    enrollCount: 15,
    status: 'recruiting',
    publisherId: 'admin',
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false,
  },
  {
    id: '4',
    name: '小学课外辅导',
    startTime: '2026-03-22 15:00',
    endTime: '2026-03-22 17:30',
    location: '育才小学图书室',
    description: '为小学生提供课外功课辅导，科目不限，需有耐心和爱心。',
    maxCount: 10,
    enrollCount: 6,
    status: 'recruiting',
    publisherId: 'admin',
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false,
  },
  {
    id: '5',
    name: '公园绿化种植',
    startTime: '2026-04-05 08:00',
    endTime: '2026-04-05 11:00',
    location: '人民公园东门广场',
    description: '参与园林绿化种植活动，种植树苗及花草，美化公共绿地环境。',
    maxCount: 50,
    enrollCount: 23,
    status: 'recruiting',
    publisherId: 'admin',
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false,
  },
]

/** 我的报名列表 */
const _mySignups: Activity[] = []

/** 我的打卡记录 */
const _myRecords: CheckinRecord[] = []

// ════════════════════════════════════════
//  工具
// ════════════════════════════════════════

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function paginate<T>(arr: T[], page: number, pageSize: number): PageResult<T> {
  const start = (page - 1) * pageSize
  return {
    list: arr.slice(start, start + pageSize),
    total: arr.length,
  }
}

// ════════════════════════════════════════
//  活动管理
// ════════════════════════════════════════

export async function getActivityList(params: {
  page: number
  pageSize?: number
  keyword?: string
  location?: string
}): Promise<PageResult<Activity>> {
  await delay()
  console.log('[mock] getActivityList called, total activities:', _activities.length)
  let list = [..._activities]
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    list = list.filter(
      (a) => a.name.toLowerCase().includes(kw) || a.location.toLowerCase().includes(kw),
    )
  }
  if (params.location) {
    list = list.filter((a) => a.location.includes(params.location!))
  }
  return paginate(list, params.page, params.pageSize ?? 10)
}

export async function getActivityById(id: string): Promise<Activity> {
  await delay()
  const a = _activities.find((a) => a.id === id)
  if (!a) throw new Error(`活动 ${id} 不存在`)
  return { ...a }
}

export async function publishActivity(form: PublishActivityForm): Promise<Activity> {
  await delay(600)
  const newActivity: Activity = {
    id: genId(),
    name: form.name,
    startTime: form.startTime,
    endTime: form.endTime,
    location: form.location,
    description: form.description,
    maxCount: form.maxCount,
    enrollCount: 0,
    status: calcStatus(form.startTime, form.endTime),
    publisherId: 'admin',
    createdAt: now(),
    isSignedUp: false,
    isCheckedIn: false,
  }
  _activities.unshift(newActivity)
  return { ...newActivity }
}

// ════════════════════════════════════════
//  报名管理
// ════════════════════════════════════════

export async function signup(activityId: string): Promise<void> {
  await delay()
  const idx = _activities.findIndex((a) => a.id === activityId)
  if (idx === -1) throw new Error('活动不存在')
  if (_activities[idx].isSignedUp) throw new Error('已报名该活动')
  _activities[idx] = {
    ..._activities[idx],
    isSignedUp: true,
    enrollCount: _activities[idx].enrollCount + 1,
  }
  const already = _mySignups.find((a) => a.id === activityId)
  if (!already) _mySignups.push({ ..._activities[idx] })
}

export async function cancelSignup(activityId: string): Promise<void> {
  await delay()
  const idx = _activities.findIndex((a) => a.id === activityId)
  if (idx !== -1) {
    _activities[idx] = {
      ..._activities[idx],
      isSignedUp: false,
      enrollCount: Math.max(0, _activities[idx].enrollCount - 1),
    }
  }
  const si = _mySignups.findIndex((a) => a.id === activityId)
  if (si !== -1) _mySignups.splice(si, 1)
}

export async function getMySignups(): Promise<Activity[]> {
  await delay()
  return _mySignups.map((a) => ({ ...a }))
}

// ════════════════════════════════════════
//  打卡管理
// ════════════════════════════════════════

export async function submitCheckin(data: CheckinForm): Promise<CheckinRecord> {
  await delay(600)
  const activity = _activities.find((a) => a.id === data.activityId)
  const record: CheckinRecord = {
    id: genId(),
    activityId: data.activityId,
    activityName: activity?.name ?? '未知活动',
    activityLocation: activity?.location ?? '',
    serviceHours: data.serviceHours,
    serviceCount: data.serviceCount,
    photos: data.photos,
    remark: data.remark ?? '',
    checkedAt: now(),
    status: 'pending',
  }
  _myRecords.unshift(record)
  // 标记活动已打卡
  const ai = _activities.findIndex((a) => a.id === data.activityId)
  if (ai !== -1) _activities[ai] = { ..._activities[ai], isCheckedIn: true }
  const si = _mySignups.findIndex((a) => a.id === data.activityId)
  if (si !== -1) _mySignups[si] = { ..._mySignups[si], isCheckedIn: true }
  return { ...record }
}

// ════════════════════════════════════════
//  记录 & 统计
// ════════════════════════════════════════

export async function getMyRecords(params: {
  page: number
  pageSize: number
}): Promise<PageResult<CheckinRecord>> {
  await delay()
  return paginate(_myRecords, params.page, params.pageSize)
}

export async function getStatistics(_params: unknown): Promise<StatisticsData> {
  await delay()
  const totalHours = _myRecords.reduce((s, r) => s + r.serviceHours, 0)
  const totalCount = _myRecords.length
  const totalServed = _myRecords.reduce((s, r) => s + r.serviceCount, 0)

  const byActivity: StatisticsData['byActivity'] = _myRecords.map((r) => ({
    activityName: r.activityName,
    personCount: r.serviceCount,
    totalHours: r.serviceHours,
  }))

  return {
    totalHours,
    totalCount,
    totalServed,
    byCategory: [
      { category: '社区服务', count: Math.ceil(totalCount * 0.4), totalHours: Math.round(totalHours * 0.4 * 10) / 10 },
      { category: '医疗卫生', count: Math.ceil(totalCount * 0.3), totalHours: Math.round(totalHours * 0.3 * 10) / 10 },
      { category: '教育助学', count: Math.floor(totalCount * 0.3), totalHours: Math.round(totalHours * 0.3 * 10) / 10 },
    ].filter((r) => r.count > 0),
    byActivity,
  }
}

export async function exportReport(_params: unknown): Promise<{ downloadUrl: string }> {
  await delay(800)
  uni.showToast({ title: 'Mock 模式：暂不支持导出', icon: 'none' })
  return { downloadUrl: '' }
}
