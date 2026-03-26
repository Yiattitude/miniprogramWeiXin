import { cloudCall } from './http'

// ========================
// 接口类型定义
// ========================

export interface AdminUser {
  _id: string
  _openid: string
  realName: string
  phone: string
  totalPoints: number
  checkinCount: number
  role: 'admin' | 'member'
  bindAt: string
}

export interface PointsLog {
  _id: string
  userId: string
  operatorId: string
  changeAmount: number
  afterPoints: number
  reason: string
  type: 'audit_pass' | 'manual_adjust'
  createdAt: string
}

export interface AdminCheckinRecord {
  _id: string
  activityId: string
  activityName: string
  activityCategory: string
  activityLocation: string
  declaredPoints: number
  photos: string[]
  remark: string
  _openid: string
  realName?: string
  phone?: string
  checkedAt: string
  status: 'pending' | 'approved' | 'rejected'
  rejectReason?: string
}

export interface AdminStats {
  totalUsers: number
  totalCheckins: number
  totalPointsIssued: number
  topUsers: Array<{ realName: string; totalPoints: number }>
}

export interface AdminHonorRecord {
  id?: string
  _id?: string
  userName: string
  phone: string
  honorLevel: string
  honorPoints: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  proofs?: string[]
  rejectReason?: string
}

// ========================
// 云函数调用
// ========================

export async function getAdminUsers(params: { page: number; pageSize?: number; keyword?: string }) {
  const data = await cloudCall<{ list: AdminUser[]; total: number }>('adminGetUsers', params)
  return { code: 0, data }
}

export async function getAdminUser(id: string) {
  const data = await cloudCall<AdminUser>('adminGetUser', { id })
  return { code: 0, data }
}

export async function adjustUserPoints(data: { targetUserId: string; amount: number; reason: string }) {
  const result = await cloudCall<any>('adjustUserPoints', data)
  return { code: 0, data: result }
}

export async function getPointsLogs(userId: string) {
  const data = await cloudCall<{ list: PointsLog[] }>('getPointsLogs', { userId })
  return { code: 0, data }
}

export async function getAdminCheckins(params: { page: number; pageSize?: number; status?: string }) {
  const data = await cloudCall<{ list: AdminCheckinRecord[]; total: number }>('adminGetCheckins', params)
  return { code: 0, data }
}

export async function auditCheckin(data: { recordId: string; pass: boolean; rejectReason?: string }) {
  const result = await cloudCall<any>('auditCheckin', data)
  return { code: 0, data: result }
}

export async function getAdminStats() {
  const data = await cloudCall<AdminStats>('adminGetStats')
  return { code: 0, data }
}

export async function getAdminHonors(params: { page: number; pageSize?: number; status?: string }) {
  const data = await cloudCall<{ list: AdminHonorRecord[]; total: number }>('adminGetHonors', params)
  return { code: 0, data }
}

export async function auditHonor(data: { id: string; pass: boolean; rejectReason?: string }) {
  const result = await cloudCall<any>('adminAuditHonor', data)
  return { code: 0, data: result }
}
