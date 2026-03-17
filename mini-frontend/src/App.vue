<script setup lang="ts">
declare const wx: any
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'

const userStore = useUserStore()

onLaunch(() => {
  // 1. 初始化微信云开发
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力')
  } else {
    wx.cloud.init({
      env: 'cloud1-9gqeut4h5f964174',
      traceUser: true,
    })
  }

  // 2. 检查登录状态
  if (userStore.isLoggedIn) {
    userStore.fetchProfile().catch((err: any) => {
      console.error('获取用户信息失败', err)
    })
  }
})

</script>

<template>
  <view class="app">
    <!-- 主应用内容 -->
    <slot />
  </view>
</template>

<style lang="scss">
.app {
  min-height: 100vh;
  background-color: #f0f2f5;
  font-size: 28rpx;
  color: #333;
}
</style>
