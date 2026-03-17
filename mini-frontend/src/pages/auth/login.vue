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
import { api } from '@/api/user'

const userStore = useUserStore()
const redirect = ref<string>('/pages/index/index')
const forceBind = ref(false)
const didAutoJump = ref(false)

onLoad((query) => {
  const r = (query?.redirect as string) || ''
  if (r) redirect.value = decodeURIComponent(r)
  forceBind.value = String((query as any)?.forceBind || '') === '1'

  // 仅用于测试：进入页面即强制跳转绑定页，不依赖按钮/授权回调
  if (forceBind.value && !didAutoJump.value) {
    didAutoJump.value = true
    setTimeout(() => {
      uni.navigateTo({
        url: `/pages/auth/bind?openid=${encodeURIComponent(
          'mock_openid_' + Date.now()
        )}&redirect=${encodeURIComponent(redirect.value || '/pages/index/index')}`,
      })
    }, 0)
  }
})

function isTabPage(url: string) {
  return (
    url === '/pages/index/index' ||
    url === '/pages/volunteer/index' ||
    url === '/pages/volunteer/profile'
  )
}

async function onWechatCode(code: string) {
  try {
    uni.showLoading({ title: '登录中...' })

    // 仅用于测试：强制进入绑定页，方便调试表单界面
    if (forceBind.value) {
      uni.navigateTo({
        url: `/pages/auth/bind?openid=${encodeURIComponent(
          'mock_openid_' + Date.now()
        )}&redirect=${encodeURIComponent(redirect.value || '/pages/index/index')}`,
      })
      return
    }

    const res = await api.wechatLogin({ code })

    if (res.needBinding) {
      const openid = res.openid || ''
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
