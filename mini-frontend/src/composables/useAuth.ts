/**
 * @file useAuth.ts
 * @description 用户认证状态管理
 */

import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api/user'

export function useAuth() {
  const userStore = useUserStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 检查是否已登录
  const isLoggedIn = computed(() => !!userStore.token)

  // 获取当前用户信息
  const currentUser = computed(() => userStore.userInfo)

  /**
   * 获取当前页面路径（用于登录后跳转）
   */
  function getCurrentPath(): string {
    const pages = getCurrentPages()
    const current = pages[pages.length - 1] as any
    const route = current?.route ? `/${current.route}` : '/pages/index/index'
    const options = current?.options || {}
    const qs = Object.keys(options)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(options[k])}`)
      .join('&')
    return qs ? `${route}?${qs}` : route
  }

  /**
   * 跳转到登录页（承载登录 UI）
   */
  function openLoginPage(redirect?: string) {
    const r = redirect || getCurrentPath()
    uni.navigateTo({
      url: `/pages/auth/login?redirect=${encodeURIComponent(r)}`,
    })
  }

  /**
   * 未登录时弹出提示，并在确认后进入登录流程
   */
  async function requireLogin(options?: { title?: string; content?: string; redirect?: string }) {
    if (userStore.isLoggedIn) return true
    const title = options?.title || '提示'
    const content = options?.content || '此操作需要登录，是否立即登录？'
    const redirect = options?.redirect || getCurrentPath()

    return await new Promise<boolean>((resolve) => {
      uni.showModal({
        title,
        content,
        confirmText: '去登录',
        cancelText: '取消',
        success(res) {
          if (res.confirm) {
            openLoginPage(redirect)
            resolve(false)
          } else {
            resolve(false)
          }
        },
        fail() {
          resolve(false)
        },
      })
    })
  }

  /**
   * 处理微信登录（供自定义登录 UI 使用）
   */
  async function handleWeChatLogin(redirect?: string) {
    loading.value = true
    error.value = null

    try {
      const loginRes = await uni.login({
        provider: 'weixin'
      })

      if (loginRes.code) {
        const authResult = await api.wechatLogin({ code: loginRes.code })
        if (authResult.needBinding) {
          const openid = authResult.openid || ''
          const r = redirect || getCurrentPath()
          uni.navigateTo({
            url: `/pages/auth/bind?openid=${encodeURIComponent(openid)}&redirect=${encodeURIComponent(r)}`,
          })
          return { needBinding: true, openid }
        }
        if (authResult.token) {
          userStore.token = authResult.token
          if (authResult.userInfo) userStore.syncUserInfo(authResult.userInfo)
          return { success: true }
        }
      }
    } catch (err: any) {
      error.value = err.message || '登录失败'
      console.error('WeChat login error:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * 绑定用户信息
   */
  async function bindUserInfo(realName: string, phone: string) {
    loading.value = true
    error.value = null

    try {
      const bindRes = await api.bindUser({
        openid: getCurrentOpenId(),
        realName,
        phone
      })

      if (bindRes.success) {
        if (bindRes.token) userStore.token = bindRes.token
        if (bindRes.userInfo) userStore.syncUserInfo(bindRes.userInfo)
        return { success: true }
      } else {
        error.value = bindRes.message || '绑定失败'
        return { success: false, message: error.value }
      }
    } catch (err: any) {
      error.value = err.message || '网络错误'
      return { success: false, message: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   */
  function logout() {
    userStore.logout()
  }

  // 工具函数
  function getCurrentOpenId(): string {
    // 从缓存或全局状态获取OpenID
    return uni.getStorageSync('openid') || ''
  }

  return {
    loading,
    error,
    isLoggedIn,
    currentUser,
    openLoginPage,
    requireLogin,
    handleWeChatLogin,
    bindUserInfo,
    logout
  }
}