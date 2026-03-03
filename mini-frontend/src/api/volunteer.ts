/**
 * @file volunteer.ts
 * @description 2.3 志愿活动参加统计接口定义
 * @phase Phase 1 - 1-8
 */

/**
 * @file volunteer.ts
 * @description 2.3 志愿活动参加统计接口定义
 *
 * 接口前缀：/api/volunteer
 * 后端请参考此文件定义对应 Controller
 */

/**
 * TODO: 后端就绪后，将 export ... from './mock' 替换为下方注释中的真实接口实现
 */

// ── Mock 实现（无需后端）──
export {
  getActivityList,
  getActivityById,
  publishActivity,
  signup,
  cancelSignup,
  getMySignups,
  submitCheckin,
  getMyRecords,
  getStatistics,
  exportReport,
} from './mock'

/* ── 真实接口（USE_MOCK = false 时启用）──
import { http } from './http'
import type {
  Activity, PublishActivityForm, CheckinForm, CheckinRecord,
  StatisticsData, PaginationParams, PageResult,
} from '@/types/volunteer'

export function getActivityList(params: any) {
  return http.get<PageResult<Activity>>('/api/volunteer/activities', params)
}
export function getActivityById(id: string) {
  return http.get<Activity>(`/api/volunteer/activities/${id}`)
}
export function publishActivity(data: PublishActivityForm) {
  return http.post<Activity>('/api/volunteer/activities', data)
}
export function signup(activityId: string) {
  return http.post<void>('/api/volunteer/signups', { activityId })
}
export function cancelSignup(activityId: string) {
  return http.delete<void>(`/api/volunteer/signups/${activityId}`)
}
export function getMySignups() {
  return http.get<Activity[]>('/api/volunteer/signups/mine')
}
export function submitCheckin(data: CheckinForm) {
  return http.post<CheckinRecord>('/api/volunteer/checkins', data)
}
export function getMyRecords(params: PaginationParams) {
  return http.get<PageResult<CheckinRecord>>('/api/volunteer/records/mine', params)
}
export function getStatistics(params: any) {
  return http.get<StatisticsData>('/api/volunteer/statistics', params)
}
export function exportReport(params: any) {
  return http.post<{ downloadUrl: string }>('/api/volunteer/statistics/export', params)
}
*/
