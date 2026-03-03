/**
 * @file user.d.ts
 * @description 用户相关 TypeScript 类型定义
 *              由原 typings/index.d.ts 中的 IAppOption 重构演化而来
 * @phase Phase 1 - 1-4
 */

/**
 * @file user.d.ts
 * @description 用户相关 TypeScript 类型定义
 */

/** 用户角色 */
export type UserRole = 'admin' | 'member'

/** 登录响应 */
export interface LoginResult {
  token: string
  userId: string
  role: UserRole
}

/** 用户信息 */
export interface UserInfo {
  userId: string
  nickname: string
  avatar: string         // 头像 URL
  unit: string           // 所属单位
  phone?: string
  role: UserRole
  // 志愿统计汇总（登录后从后端获取）
  totalHours: number     // 累计志愿时长（小时）
  totalCount: number     // 累计参与次数
  totalServed: number    // 累计服务人次
}

/** Pinia UserStore 状态 */
export interface UserState {
  token: string
  userInfo: UserInfo | null
}

/** 微信 getUserProfile 返回 */
export interface WxUserProfile {
  nickName: string
  avatarUrl: string
}
