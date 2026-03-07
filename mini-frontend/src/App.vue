<script lang="ts">
declare const wx: any
import { useUserStore } from './stores/user'

export default {
  onLaunch() {
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
    const userStore = useUserStore()
    if (userStore.isLoggedIn) {
      userStore.fetchProfile().catch((err: any) => {
        console.error('获取用户信息失败', err)
      })
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
