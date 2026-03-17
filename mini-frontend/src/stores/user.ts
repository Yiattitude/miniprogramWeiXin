import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref<any>(uni.getStorageSync('userInfo') || null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => resolveRole(userInfo.value) === 'admin')

  // Keep token in sync with local storage for app relaunch.
  watch(
    token,
    (val) => {
      if (val) uni.setStorageSync('token', val)
      else uni.removeStorageSync('token')
    },
    { immediate: true }
  )

  function resolveRole(profile: any) {
    // Sync backend users.role to top-level role for consistent admin checks.
    const role = profile?.role ?? profile?.users?.role ?? profile?.user?.role
    return role === 'admin' ? 'admin' : 'member'
  }

  function syncUserInfo(profile: any) {
    if (!profile) return null
    const role = resolveRole(profile)
    userInfo.value = { ...(userInfo.value || {}), ...profile, role }
    uni.setStorageSync('userInfo', userInfo.value)
    return userInfo.value
  }

  async function fetchProfile(profile?: any) {
    // If caller provides backend data, normalize role and cache it.
    if (profile) {
      return syncUserInfo(profile)
    }
    const cached = uni.getStorageSync('userInfo')
    return cached ? syncUserInfo(cached) : userInfo.value
  }

  function logout() {
    // Clear auth and cached user info in one place.
    token.value = ''
    userInfo.value = null
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    // Some flows may cache combined auth payloads.
    uni.removeStorageSync('auth_info')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    fetchProfile,
    logout,
    syncUserInfo
  }
})
