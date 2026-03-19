/**
 * @file volunteer.d.ts
 * @description 志愿活动模块数据结构定义
 */

export interface Activity {
  _id: string                // 云数据库生成的 ID
  name: string
  startTime: string          // ISO 8601
  endTime: string
  location: string
  description: string
  maxCount: number           // 最大参与人数
  enrollCount: number        // 当前参与人数
  status: 'recruiting' | 'upcoming' | 'ongoing' | 'ended'
  publisherId: string
  createdAt: string
  isCheckedIn?: boolean      // 当前登录用户是否已打卡
}

export interface CheckinRecord {
  _id: string
  activityId: string
  activityName: string
  activityLocation: string
  serviceHours: number       // 服务时长（小时，步长 0.5）
  serviceCount: number       // 服务人数
  photos: string[]           // 现场照片 URL 数组（最多 9 张）
  remark: string
  checkedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

export interface StatisticsData {
  totalHours: number
  totalCount: number
  totalServed: number
  byCategory: Array<{ category: string; count: number; totalHours: number }>
  byActivity: Array<{ activityName: string; personCount: number; totalHours: number }>
}

export interface PageResult<T> {
  list: T[]
  total: number
}
