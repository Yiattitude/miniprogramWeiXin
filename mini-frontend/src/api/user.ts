/**
 * @file api.ts
 * @description 用户认证相关的API调用
 */

import { cloudCall } from './http'

export type WechatLoginResponse = {
  needBinding: boolean
  openid?: string
  token?: string
  userInfo?: any
}

function pickDefined<T>(values: Array<T | null | undefined>): T | undefined {
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i]
    if (value !== undefined && value !== null) return value
  }
  return undefined
}

export async function wechatLogin(data: { code: string }): Promise<WechatLoginResponse> {
  const raw = await cloudCall<any>('wechatLogin', data, 'volunteer-service')

  // 兼容后端常见字段命名差异（need_binding / openId 等）
  const rawAny = raw as any
  const dataAny = rawAny && rawAny.data ? rawAny.data : undefined

  const needBindingValue = pickDefined([
    rawAny ? rawAny.needBinding : undefined,
    rawAny ? rawAny.need_binding : undefined,
    rawAny ? rawAny.needBind : undefined,
    rawAny ? rawAny.need_bind : undefined,
  ])
  const needBinding =
    needBindingValue === undefined || needBindingValue === null ? false : needBindingValue

  const openid = pickDefined([
    rawAny ? rawAny.openid : undefined,
    rawAny ? rawAny.openId : undefined,
    rawAny ? rawAny.open_id : undefined,
    dataAny ? dataAny.openid : undefined,
  ])
  const token = pickDefined([
    rawAny ? rawAny.token : undefined,
    rawAny ? rawAny.accessToken : undefined,
    rawAny ? rawAny.access_token : undefined,
    dataAny ? dataAny.token : undefined,
  ])
  const userInfo = pickDefined([
    rawAny ? rawAny.userInfo : undefined,
    rawAny ? rawAny.user_info : undefined,
    dataAny ? dataAny.userInfo : undefined,
    dataAny ? dataAny.user_info : undefined,
  ])

  return {
    needBinding: !!needBinding,
    openid: openid || undefined,
    token: token || undefined,
    userInfo
  }
}

/**
 * 绑定用户信息
 */
export async function bindUser(data: {
  openid: string
  realName: string
  phone: string
}): Promise<{
  success: boolean
  token?: string
  userInfo?: any
  message?: string
}> {
  try {
    const result = await cloudCall<{ token: string; userInfo?: any }>(
      'bindUser',
      data,
      'volunteer-service'
    )
    return { success: true, token: result.token, userInfo: result.userInfo, message: '绑定成功' }
  } catch (error) {
    console.error('Bind user error:', error)
    return {
      success: false,
      message: '网络错误，请稍后重试'
    }
  }
}

// 导出api对象供useAuth使用
export const api = {
  wechatLogin,
  bindUser
}
