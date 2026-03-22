/**
 * @file volunteer.ts
 * @description 志愿活动模块 API
 *              由原 mock 模式切换为微信云开发调用
 */

import { cloudCall } from './http'
import type { Activity, CheckinRecord, StatisticsData, PageResult } from '../types/volunteer'

/**
 * 获取活动列表
 */
export async function getActivityList(params: {
  page: number
  pageSize?: number
  keyword?: string
  location?: string
  startDate?: string
  endDate?: string
}) {
  return await cloudCall<PageResult<Activity>>('getActivities', params)
}

/**
 * 获取活动详情
 */
export async function getActivityById(id: string) {
  return await cloudCall<Activity>('getActivityById', { id })
}

/**
 * 发布活动
 */
export async function publishActivity(form: {
  name: string
  category: string
  startTime: string
  endTime: string
  location: string
  description: string
  maxCount: number
}) {
  return await cloudCall<Activity>('publishActivity', form)
}

/**
 * 提交打卡
 */
export async function submitCheckin(data: {
  activityId: string
  declaredPoints: number
  activityCategory: string
  photos: string[]
  remark?: string
}) {
  return await cloudCall<CheckinRecord>('submitCheckin', data)
}

/**
 * 获取我的打卡记录
 */
export async function getMyRecords(params: { page: number; pageSize?: number }) {
  return await cloudCall<PageResult<CheckinRecord>>('getMyRecords', params)
}

/**
 * 获取统计数据
 */
export async function getStatistics() {
  return await cloudCall<StatisticsData>('getStatistics')
}

/**
 * 提交荣誉信息（后端待实现）
 */
export async function submitHonor(data: {
  userId: string
  honorLevel: string
  honorPoints: number
  proofs?: string[]
}) {
  return await cloudCall<any>('submitHonor', data)
}

/**
 * 导出报表 (示例逻辑，云开发可通过云函数生成并返回文件 ID)
 */
export async function exportReport() {
  // 云端逻辑：生成 Excel -> 存入云存储 -> 返回 fileID
  const fileID = await cloudCall<string>('exportReport')
  
  // 转换为临时下载地址
  declare const wx: any
  const { fileList } = await wx.cloud.getTempFileURL({
    fileList: [fileID]
  })
  
  return { downloadUrl: fileList[0].tempFileURL }
}
