<template>
  <view class="empty-state">
    <Icon v-if="iconName" class="empty-icon" :name="iconName" size="64px" />
    <text v-else class="empty-icon">{{ icon }}</text>
    <text class="empty-text">{{ text }}</text>
    <text v-if="subText" class="empty-sub">{{ subText }}</text>
  </view>
</template>

<script setup lang="ts">
import Icon from '@/components/common/Icon.vue'
/**
 * @component EmptyState
 * @description 数据为空时占位组件，适老化大图标 + 大字提示
 */
withDefaults(defineProps<{
  iconName?: string
  icon?: string
  text?: string
  subText?: string
}>(), {
  iconName: 'folder-line',
  icon: '',
  text: '暂无数据',
  subText: '',
})
</script>

<style lang="scss" scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  gap: 14px;
}
.empty-icon {
  font-size: 64px;
  line-height: 1;
}
.empty-text {
  font-size: 20px;
  font-weight: 600;
  color: #4a5568;
}
.empty-sub {
  font-size: 16px;
  color: #9aa5b4;
  text-align: center;
  line-height: 1.6;
}
</style>
