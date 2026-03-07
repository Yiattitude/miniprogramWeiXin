<template>
  <view class="uv-loading-wrap" :style="wrapStyle">
    <view class="uv-loading-spin" :style="spinStyle" />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ size?: number | string }>(),
  { size: 28 }
)

const px = computed(() => Number(props.size))

const wrapStyle = computed(() => ({
  width: `${px.value}rpx`,
  height: `${px.value}rpx`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}))

const spinStyle = computed(() => ({
  width: `${px.value}rpx`,
  height: `${px.value}rpx`,
}))
</script>

<style scoped>
.uv-loading-spin {
  border: 3rpx solid #e4e7ed;
  border-top-color: #3a7bd5;
  border-radius: 50%;
  animation: uv-spin 0.8s linear infinite;
}

@keyframes uv-spin {
  to { transform: rotate(360deg); }
}
</style>
