<template>
  <!-- 占位，防止内容被导航栏遮挡 -->
  <view :style="{ height: navHeight + 'px' }" />

  <view class="nav-bar" :style="{ height: navHeight + 'px', paddingTop: statusBarHeight + 'px' }">
    <!-- 左侧返回按钮 -->
    <view v-if="showBack" class="nav-back" @click="handleBack">
      <text class="nav-back-icon">‹</text>
      <text class="nav-back-text">返回</text>
    </view>
    <view v-else class="nav-placeholder" />

    <!-- 标题 -->
    <text class="nav-title">{{ title }}</text>

    <!-- 右侧占位，保持标题居中 -->
    <view class="nav-placeholder" />
  </view>
</template>

<script setup lang="ts">
/**
 * @component NavBar
 * @description 自定义导航栏（适老化），左侧返回、标题居中，字号 ≥ 20px
 */
import { ref } from 'vue'

withDefaults(defineProps<{
  title?: string
  showBack?: boolean
}>(), {
  title: '',
  showBack: true,
})

const emit = defineEmits<{ back: [] }>()

// 获取系统状态栏高度
const statusBarHeight = ref(0)
const navHeight = ref(44)

try {
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight ?? 0
  navHeight.value = statusBarHeight.value + 50
} catch {}

function handleBack() {
  emit('back')
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.switchTab({ url: '/pages/index/index' })
  }
}
</script>

<style lang="scss" scoped>
.nav-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: #fff;
  display: flex;
  align-items: flex-end;
  padding-bottom: 10px;
  padding-left: 8px;
  padding-right: 8px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
}
.nav-back {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  min-width: 72px;
  cursor: pointer;
}
.nav-back-icon {
  font-size: 28px;
  color: #27ae60;
  line-height: 1;
  margin-right: 2px;
}
.nav-back-text {
  font-size: 18px;
  color: #27ae60;
  font-weight: 500;
}
.nav-title {
  flex: 1;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #1e2a3a;
  line-height: 1.3;
}
.nav-placeholder {
  min-width: 72px;
}
</style>
