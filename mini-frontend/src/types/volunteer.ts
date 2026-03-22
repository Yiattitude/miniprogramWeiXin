/**
 * @file volunteer.d.ts
 * @description 志愿活动模块数据结构定义
 */

export interface Activity {
  _id: string                // 云数据库生成的 ID
  name: string
  category?: string          // 活动分类/类型
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
  activityCategory: string
  activityLocation: string
  declaredPoints: number     // 申报积分
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
  // 新版统计字段（若后端暂未提供，可留空）
  totalPoints?: number
  totalCheckins?: number
  totalHonors?: number
  checkinRecords?: CheckinRecord[]
  honorRecords?: HonorRecord[]
}

export interface HonorRecord {
  id?: string
  _id?: string
  honorLevel: string
  honorPoints: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface PageResult<T> {
  list: T[]
  total: number
}
