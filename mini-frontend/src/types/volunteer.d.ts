/**
 * @file volunteer.d.ts
 * @description 志愿活动模块 TypeScript 类型定义
 *              Activity / CheckinRecord / StatisticsData 等
 * @phase Phase 1 - 1-4
 */

/**
 * @file volunteer.d.ts
 * @description 志愿活动模块 TypeScript 类型定义
 */

/** 活动状态枚举 */
export type ActivityStatus = 'recruiting' | 'upcoming' | 'ongoing' | 'ended'

/** 志愿活动 */
export interface Activity {
  id: string
  name: string
  startTime: string            // ISO 8601
  endTime: string
  location: string
  description: string
  maxCount: number             // 最大报名人数
  enrollCount: number          // 当前已报名人数
  status: ActivityStatus
  publisherId: string
  createdAt: string
  isSignedUp?: boolean         // 当前用户是否已报名
  isCheckedIn?: boolean        // 当前用户是否已打卡
}

/** 发布活动表单 */
export interface PublishActivityForm {
  name: string
  startTime: string
  endTime: string
  location: string
  description: string
  maxCount: number
}

/** 打卡记录 */
export interface CheckinRecord {
  id: string
  activityId: string
  activityName: string
  activityLocation: string
  serviceHours: number
  serviceCount: number
  photos: string[]
  remark: string
  checkedAt: string
  status: 'pending' | 'approved' | 'rejected'  // 后端审核状态
}

/** 打卡表单 */
export interface CheckinForm {
  activityId: string
  serviceHours: number    // 服务时长（小时，支持小数，步长 0.5）
  serviceCount: number    // 服务人数
  photos: string[]        // 现场照片 URL 数组（最多 9 张）
  remark?: string
}

/** 统计报表 —— 分类汇总行 */
export interface StatByCategory {
  category: string
  count: number
  totalHours: number
}

/** 统计报表 —— 按活动明细行（团队统计） */
export interface StatByActivity {
  activityName: string
  personCount: number
  totalHours: number
}

/** 统计报表数据 */
export interface StatisticsData {
  totalHours: number
  totalCount: number
  totalServed: number
  byCategory: StatByCategory[]
  byActivity: StatByActivity[]
}

/** 志愿 Store 筛选条件 */
export interface VolunteerFilter {
  timeRange: 'today' | 'week' | 'month' | 'custom'
  location: string
  keyword: string
  startDate?: string
  endDate?: string
}

/** 分页参数 */
export interface PaginationParams {
  page: number
  pageSize?: number
}

/** 分页响应 */
export interface PageResult<T> {
  list: T[]
  total: number
}
