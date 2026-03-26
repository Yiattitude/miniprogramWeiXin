<template>
  <page-meta root-font-size="system" />
  <view class="page">
    <LoginModal @wechat-code="onWechatCode" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import LoginModal from '@/components/auth/LoginModal.vue'
import { useUserStore } from '@/stores/user'
import { api, type WechatLoginResponse } from '@/api/user'

const userStore = useUserStore()
const redirect = ref<string>('/pages/index/index')

onLoad((query) => {
  const r = (query?.redirect as string) || ''
  if (r) redirect.value = decodeURIComponent(r)
})

function isTabPage(url: string) {
  return (
    url === '/pages/index/index' ||
    url === '/pages/volunteer/index' ||
    url === '/pages/volunteer/profile'
  )
}

function needProfileBind(info: WechatLoginResponse['userInfo']) {
  const userInfo = info || {}
  const realName = String(
    userInfo.realName ?? userInfo.real_name ?? userInfo.fullName ?? userInfo.full_name ?? ''
  ).trim()
  const phone = String(
    userInfo.phone ?? userInfo.mobile ?? userInfo.phoneNumber ?? userInfo.tel ?? ''
  ).trim()
  return !realName || !phone
}

async function onWechatCode(code: string) {
  try {
    uni.showLoading({ title: '登录中...' })

    const res = await api.wechatLogin({ code })

    const openid = res.openid || ''
    if (openid) {
      uni.setStorageSync('openid', openid)
    }

    if (res.needBinding) {
      if (!openid) {
        uni.showToast({ title: '获取用户标识失败，请重试', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages/auth/bind?openid=${encodeURIComponent(openid)}&redirect=${encodeURIComponent(
          redirect.value || '/pages/index/index'
        )}`,
      })
      return
    }

    if (!res.token) {
      uni.showToast({ title: '登录失败，请重试', icon: 'none' })
      return
    }

    if (needProfileBind(res.userInfo)) {
      if (!openid) {
        uni.showToast({ title: '获取用户标识失败，请重试', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages/auth/bind?openid=${encodeURIComponent(openid)}&redirect=${encodeURIComponent(
          redirect.value || '/pages/index/index'
        )}`,
      })
      return
    }

    userStore.token = res.token
    if (res.userInfo) userStore.syncUserInfo(res.userInfo)
  } finally {
    uni.hideLoading()
  }

  const url = redirect.value || '/pages/volunteer/profile'
  if (isTabPage(url)) {
    uni.switchTab({ url })
  } else {
    uni.redirectTo({ url })
  }
}
</script>

<style scoped lang="scss">
.page {
  min-height: 100vh;
}
</style>
