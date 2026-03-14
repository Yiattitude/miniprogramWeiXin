import { cloudCall } from './http'

export async function loginWithWeChat(userInfo: any) {
  return await cloudCall('login', { userInfo })
}

export async function updateProfile(data: { nickName?: string; avatarUrl?: string }) {
  return await cloudCall('updateProfile', data)
}
