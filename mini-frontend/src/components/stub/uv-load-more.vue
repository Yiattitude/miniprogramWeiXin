<template>
  <view class="uv-load-more">
    <view v-if="status === 'loading'" class="row">
      <view class="spin" />
      <text class="text">加载中...</text>
    </view>
    <text v-else-if="status === 'nomore'" class="text">没有更多了</text>
    <text v-else class="text link" @tap="emit('loadmore')">点击加载更多</text>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{ status?: 'loading' | 'loadmore' | 'nomore' }>(),
  { status: 'loadmore' }
)

const emit = defineEmits<{ (e: 'loadmore'): void }>()
</script>

<style scoped>
.uv-load-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24rpx 0 32rpx;
}

.row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.spin {
  width: 28rpx;
  height: 28rpx;
  border: 3rpx solid #e4e7ed;
  border-top-color: #3a7bd5;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.text {
  font-size: 26rpx;
  color: #999;
}

.link {
  color: #3a7bd5;
}
</style>
