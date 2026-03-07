<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useUserStore } from './stores/user'

onLaunch(() => {
  // 1. 初始化微信云开发
  if (!wx.cloud) {
    console.error('请使用 2.2.3 或以上的基础库以使用云能力')
  } else {
    wx.cloud.init({
      env: 'cloud1-9gqeut4h5f964174', // TODO: 填入你的云开发环境 ID
      traceUser: true,
    })
    console.log('微信云开发初始化成功')
  }

  // 2. 检查登录状态
  const userStore = useUserStore()
  if (userStore.isLoggedIn) {
    userStore.fetchProfile().catch(err => {
      console.error('获取用户信息失败', err)
    })
  }
})
</script>

<style lang="scss">
/* 全局公共样式 */
@import "@/styles/global.scss";
</style>
