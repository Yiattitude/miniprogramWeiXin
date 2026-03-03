<script lang="ts">
/**
 * @file App.vue
 * @description 应用层入口，处理全局生命周期、登录初始化
 * App 级生命周期（onLaunch/onShow/onHide）必须用 Options API，不能用 script setup
 */
import { useUserStore } from '@/stores/user'

export default {
  onLaunch() {
    const userStore = useUserStore()
    if (userStore.isLoggedIn) {
      userStore.fetchProfile().catch(() => {
        // token 失效，http.ts 中已处理 401 跳转
      })
    }
  },
}
</script>

<style lang="scss">
@import '@/styles/global.scss';
@import '@climblee/uv-ui/index.scss';
</style>
