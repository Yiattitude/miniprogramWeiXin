<template>
  <view class="load-more">
    <!-- 加载中 -->
    <view v-if="loading" class="load-row">
      <view class="spinner" />
      <text class="load-text">加载中...</text>
    </view>
    <!-- 已全部加载 -->
    <view v-else-if="finished" class="load-row">
      <view class="divider" />
      <text class="load-text finished">没有更多了</text>
      <view class="divider" />
    </view>
    <!-- 点击加载更多 -->
    <view v-else class="load-row clickable" @click="emit('load')">
      <text class="load-text">点击加载更多</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * @component LoadMore
 * @description 上拉加载更多，loading / finished 状态，触底自动 emit
 */
defineProps<{
  loading?: boolean
  finished?: boolean
}>()

const emit = defineEmits<{ load: [] }>()
</script>

<style lang="scss" scoped>
.load-more {
  padding: 20px 0;
}
.load-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  &.clickable { cursor: pointer; }
}
.load-text {
  font-size: 16px;
  color: #9aa5b4;
  &.finished { color: #b0bac4; }
}
.spinner {
  width: 22px;
  height: 22px;
  border: 3px solid #e2e7ec;
  border-top-color: #27ae60;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.divider {
  flex: 1;
  height: 1px;
  background: #e2e7ec;
  max-width: 60px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
