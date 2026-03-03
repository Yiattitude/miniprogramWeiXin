/**
 * @file user.ts
 * @description 全局用户信息 Store（token、角色、志愿汇总统计）
 * @phase Phase 1 - 1-9
 */

/**
 * @file user.ts
 * @description 全局用户信息 Store，登录态、角色权限
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { http } from '@/api/http'
import type { UserInfo, LoginResult } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  // ────── 状态 ──────
  const token = ref<string>(uni.getStorageSync('token') ?? '')
  const userInfo = ref<UserInfo | null>(null)

  // ────── Getters ──────
  const isLoggedIn = computed(() => Boolean(token.value))
  const isAdmin = computed(() => true) // TODO: 临时调试，上线前改回 userInfo.value?.role === 'admin'
  const role = computed(() => userInfo.value?.role)

  // ────── Actions ──────

  /**
   * 微信登录：wx.login 获取 code 后传入，将 token 嵌入 Storage
   */
  async function login(code: string) {
    const result = await http.post<LoginResult>('/api/auth/login', { code })
    token.value = result.token
    uni.setStorageSync('token', result.token)
    // 登录后立即拉取用户信息
    await fetchProfile()
  }

  /**
   * 登出：清除 token 和本地缓存
   */
  function logout() {
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.reLaunch({ url: '/pages/login/index' })
  }

  /**
   * 拉取最新用户信息（含志愿统计汇总）
   */
  async function fetchProfile() {
    try {
      const info = await http.get<UserInfo>('/api/user/profile')
      userInfo.value = { ...info, role: 'admin' } // TODO: 临时调试，上线前删除
    } catch (e) {
      console.error('[userStore] fetchProfile error:', e)
    }
  }

  /**
   * 更新用户个人信息（头像、昵称）
   */
  async function updateProfile(data: { nickname?: string; avatar?: string; unit?: string }) {
    const updated = await http.put<UserInfo>('/api/user/profile', data)
    userInfo.value = updated
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    role,
    login,
    logout,
    fetchProfile,
    updateProfile,
  }
})
