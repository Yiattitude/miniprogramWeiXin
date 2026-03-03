/**
 * @file permission.ts
 * @description 角色权限判断（admin / member）
 * @phase Phase 1 - 1-6
 */

/**
 * @file permission.ts
 * @description 角色权限判断工具
 */

import type { UserRole } from '@/types/user'

/**
 * 是否为管理员
 * 管理员可发布活动
 */
export function isAdmin(role: UserRole | undefined | null): boolean {
  return role === 'admin'
}

/**
 * 是否为普通成员
 */
export function isMember(role: UserRole | undefined | null): boolean {
  return role === 'member'
}

/**
 * 检查是否已登录（token 存在且非空）
 */
export function isLoggedIn(): boolean {
  const token = uni.getStorageSync('token') as string | undefined
  return Boolean(token)
}

/**
 * 鱼跟制: 若未登录则跳转登录页
 * 建议在各页面 onShow/onLoad 调用
 */
export function requireLogin(): boolean {
  if (!isLoggedIn()) {
    uni.reLaunch({ url: '/pages/login/index' })
    return false
  }
  return true
}

/**
 * 鱼跟制: 必须是管理员角色
 * @param role 当前用户角色
 * @returns 是否有权限
 */
export function requireAdmin(role: UserRole | undefined | null): boolean {
  if (!isAdmin(role)) {
    uni.showToast({ title: '权限不足', icon: 'none' })
    setTimeout(() => uni.navigateBack(), 1000)
    return false
  }
  return true
}
