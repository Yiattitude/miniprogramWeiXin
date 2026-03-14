<script lang="ts">
declare const wx: any
declare const getCurrentPages: any
import { useUserStore } from './stores/user'

const AUTH_WHITE_LIST = ['/pages/auth/login']

function isAuthPage(url: string) {
  return AUTH_WHITE_LIST.some((path) => url.startsWith(path))
}

function redirectToLogin() {
  const pages = getCurrentPages ? getCurrentPages() : []
  const current = pages.length ? `/${pages[pages.length - 1].route}` : ''
  if (!isAuthPage(current)) {
    uni.reLaunch({ url: '/pages/auth/login' })
  }
}

function setupAuthGuard(userStore: ReturnType<typeof useUserStore>) {
  const guard = (args: any) => {
    const url = args?.url || ''
    if (!userStore.isLoggedIn && !isAuthPage(url)) {
      redirectToLogin()
      return false
    }
    return args
  }

  uni.addInterceptor('navigateTo', { invoke: guard })
  uni.addInterceptor('redirectTo', { invoke: guard })
  uni.addInterceptor('reLaunch', { invoke: guard })
  uni.addInterceptor('switchTab', { invoke: guard })
}

async function refreshUserProfile(userStore: ReturnType<typeof useUserStore>) {
  if (!wx?.cloud) return

  try {
    const res = await wx.cloud.callFunction({
      name: 'volunteer-service',
      data: {
        action: 'login',
        data: { userInfo: {} }
      }
    })
    const result = res?.result || {}
    if (result.code === 0 && result.data) {
      await userStore.fetchProfile(result.data)
      return
    }
  } catch (err) {
    console.error('刷新用户信息失败', err)
  }

  await userStore.fetchProfile().catch((err: any) => {
    console.error('获取用户信息失败', err)
  })
}

export default {
  onLaunch() {
    // 1. Init WeChat cloud
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-9gqeut4h5f964174',
        traceUser: true,
      })
    }

    // 2. Auth guard + bootstrap
    const userStore = useUserStore()
    setupAuthGuard(userStore)

    if (!userStore.isLoggedIn && userStore.userInfo) {
      const fallbackToken = userStore.userInfo.openid || userStore.userInfo._openid || "logged"
      userStore.login({ token: fallbackToken, userInfo: userStore.userInfo })
    }

    if (userStore.isLoggedIn) {
      refreshUserProfile(userStore)
    } else {
      redirectToLogin()
    }
  },
}
</script>

<style lang="scss">
page {
  background-color: #f0f2f5;
  font-size: 28rpx;
  color: #333;
}
</style>