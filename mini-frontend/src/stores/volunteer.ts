/**
 * @file volunteer.ts
 * @description 志愿活动模块 Pinia Store
 * @phase Phase 1 - 1-9
 */

/**
 * @file volunteer.ts
 * @description 志愿活动模块 Pinia Store
 * 负责活动列表、报名、打卡、统计数据的状态管理
 */

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import * as volunteerApi from '@/api/volunteer'
import type {
  Activity,
  CheckinRecord,
  CheckinForm,
  PublishActivityForm,
  StatisticsData,
  VolunteerFilter,
  PageResult,
} from '@/types/volunteer'

export const useVolunteerStore = defineStore('volunteer', () => {
  // ────── 状态 ──────

  /** 活动列表（报名页）*/
  const activityList = ref<Activity[]>([])
  const activityTotal = ref(0)

  /** 当前活动详情（详情页）*/
  const currentActivity = ref<Activity | null>(null)

  /** 我已报名的活动（打卡页）*/
  const mySignups = ref<Activity[]>([])

  /** 我的打卡记录 */
  const myRecords = ref<CheckinRecord[]>([])
  const recordTotal = ref(0)

  /** 统计报表数据 */
  const statistics = ref<StatisticsData | null>(null)

  /** 筛选条件 */
  const filter = reactive<VolunteerFilter>({
    timeRange: 'month',
    location: '',
    keyword: '',
  })

  // ────── Actions ──────

  /**
   * 获取活动列表（支持筛选和搜索）
   */
  async function fetchActivityList(page = 1, pageSize = 10): Promise<PageResult<Activity>> {
    const result = await volunteerApi.getActivityList({
      page,
      pageSize,
      keyword: filter.keyword || undefined,
      timeRange: filter.timeRange,
      location: filter.location || undefined,
      startDate: filter.startDate,
      endDate: filter.endDate,
    })
    if (page === 1) {
      activityList.value = result.list
    } else {
      activityList.value.push(...result.list)
    }
    activityTotal.value = result.total
    return result
  }

  /**
   * 获取单个活动详情
   */
  async function fetchActivityById(id: string): Promise<Activity> {
    const activity = await volunteerApi.getActivityById(id)
    currentActivity.value = activity
    return activity
  }

  /**
   * 发布活动（仅管理员）
   */
  async function publishActivity(form: PublishActivityForm): Promise<Activity> {
    const activity = await volunteerApi.publishActivity(form)
    return activity
  }

  /**
   * 报名参加活动
   */
  async function signupActivity(activityId: string) {
    await volunteerApi.signup(activityId)
    // 报名成功后更新列表中的该活动状态
    const idx = activityList.value.findIndex((a) => a.id === activityId)
    if (idx !== -1) {
      activityList.value[idx] = { ...activityList.value[idx], isSignedUp: true }
    }
    if (currentActivity.value?.id === activityId) {
      currentActivity.value = { ...currentActivity.value, isSignedUp: true }
    }
  }

  /**
   * 取消报名
   */
  async function cancelSignup(activityId: string) {
    await volunteerApi.cancelSignup(activityId)
    const idx = activityList.value.findIndex((a) => a.id === activityId)
    if (idx !== -1) {
      activityList.value[idx] = { ...activityList.value[idx], isSignedUp: false }
    }
    if (currentActivity.value?.id === activityId) {
      currentActivity.value = { ...currentActivity.value, isSignedUp: false }
    }
  }

  /**
   * 获取我已报名的活动列表（打卡页）
   */
  async function fetchMySignups() {
    mySignups.value = await volunteerApi.getMySignups()
  }

  /**
   * 提交打卡
   */
  async function submitCheckin(form: CheckinForm): Promise<CheckinRecord> {
    const record = await volunteerApi.submitCheckin(form)
    // 打卡成功后标记对应活动已打卡
    const idx = mySignups.value.findIndex((a) => a.id === form.activityId)
    if (idx !== -1) {
      mySignups.value[idx] = { ...mySignups.value[idx], isCheckedIn: true }
    }
    return record
  }

  /**
   * 获取个人历史打卡记录（分页）
   */
  async function fetchMyRecords(page = 1, pageSize = 10): Promise<PageResult<CheckinRecord>> {
    const result = await volunteerApi.getMyRecords({ page, pageSize })
    if (page === 1) {
      myRecords.value = result.list
    } else {
      myRecords.value.push(...result.list)
    }
    recordTotal.value = result.total
    return result
  }

  /**
   * 获取统计报表数据
   */
  async function fetchStatistics(params: Parameters<typeof volunteerApi.getStatistics>[0]) {
    statistics.value = await volunteerApi.getStatistics(params)
  }

  /**
   * 导出统计报表
   */
  async function exportReport(params: Parameters<typeof volunteerApi.exportReport>[0]): Promise<string> {
    const { downloadUrl } = await volunteerApi.exportReport(params)
    return downloadUrl
  }

  /** 重置筛选条件 */
  function resetFilter() {
    filter.timeRange = 'month'
    filter.location = ''
    filter.keyword = ''
    filter.startDate = undefined
    filter.endDate = undefined
  }

  return {
    activityList,
    activityTotal,
    currentActivity,
    mySignups,
    myRecords,
    recordTotal,
    statistics,
    filter,
    fetchActivityList,
    fetchActivityById,
    publishActivity,
    signupActivity,
    cancelSignup,
    fetchMySignups,
    submitCheckin,
    fetchMyRecords,
    fetchStatistics,
    exportReport,
    resetFilter,
  }
})
