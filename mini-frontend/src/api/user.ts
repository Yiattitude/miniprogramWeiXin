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

export async function wechatLogin(data: { code: string }): Promise<WechatLoginResponse> {
  const raw = await cloudCall<any>('wechatLogin', data, 'volunteer-service')

  // 兼容后端常见字段命名差异（need_binding / openId 等）
  const needBinding =
    raw?.needBinding ?? raw?.need_binding ?? raw?.needBind ?? raw?.need_bind ?? false

  const openid = raw?.openid ?? raw?.openId ?? raw?.open_id ?? raw?.data?.openid ?? ''
  const token = raw?.token ?? raw?.accessToken ?? raw?.access_token ?? raw?.data?.token ?? ''
  const userInfo = raw?.userInfo ?? raw?.user_info ?? raw?.data?.userInfo ?? raw?.data?.user_info

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