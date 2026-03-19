/**
 * @file volunteer.ts
 * @description 志愿活动模块 Pinia Store
 */

import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import * as volunteerApi from '../api/volunteer'
import type { Activity, CheckinRecord, StatisticsData } from '../types/volunteer'

export const useVolunteerStore = defineStore('volunteer', () => {
  const activityList = ref<Activity[]>([])
  const activityTotal = ref(0)
  const currentActivity = ref<Activity | null>(null)
  const myRecords = ref<CheckinRecord[]>([])
  const recordTotal = ref(0)
  const statistics = ref<StatisticsData | null>(null)

  const filter = reactive({
    timeRange: 'month',
    location: '',
    keyword: '',
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined
  })

  /**
   * 获取活动列表
   */
  async function fetchActivityList(page = 1, pageSize = 10) {
    const result = await volunteerApi.getActivityList({
      page,
      pageSize,
      keyword: filter.keyword || undefined,
      location: filter.location || undefined,
      startDate: filter.startDate,
      endDate: filter.endDate
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
   * 获取活动详情
   */
  async function fetchActivityById(id: string) {
    const activity = await volunteerApi.getActivityById(id)
    currentActivity.value = activity
    return activity
  }

  /**
   * 发布活动
   */
  async function publishActivity(form: any) {
    const activity = await volunteerApi.publishActivity(form)
    return activity
  }

  /**
   * 提交打卡
   */
  async function submitCheckin(form: any) {
    const record = await volunteerApi.submitCheckin(form)
    
    // 更新本地状态：标记该活动已打卡
    const idx = activityList.value.findIndex(a => a._id === form.activityId)
    if (idx !== -1) {
      activityList.value[idx] = { ...activityList.value[idx], isCheckedIn: true }
    }
    if (currentActivity.value?._id === form.activityId) {
      currentActivity.value = { ...currentActivity.value, isCheckedIn: true }
    }
    return record
  }

  /**
   * 获取我的打卡记录
   */
  async function fetchMyRecords(page = 1, pageSize = 10) {
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
   * 获取统计数据
   */
  async function fetchStatistics() {
    const data = await volunteerApi.getStatistics()
    statistics.value = data
    // Return data so pages can consume it directly.
    return data
  }

  /**
   * 导出报表
   */
  async function exportReport() {
    const { downloadUrl } = await volunteerApi.exportReport()
    return downloadUrl
  }

  /**
   * 重置筛选
   */
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
    myRecords,
    recordTotal,
    statistics,
    filter,
    fetchActivityList,
    fetchActivityById,
    publishActivity,
    submitCheckin,
    fetchMyRecords,
    fetchStatistics,
    exportReport,
    resetFilter
  }
})
