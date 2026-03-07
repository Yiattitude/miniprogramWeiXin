import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  const token = ref(uni.getStorageSync('token') || '')
  const userInfo = ref<any>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.role === 'admin')

  async function fetchProfile() {
    // 示例逻辑，后续可调用云函数获取用户信息
    console.log('Fetching user profile from cloud...')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    isAdmin,
    fetchProfile
  }
})
