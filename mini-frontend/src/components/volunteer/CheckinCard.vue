<template>
  <view class="checkin-card" :class="{ 'is-checked': activity.isCheckedIn }">
    <view class="card-body">
      <view class="card-header">
        <text class="card-title">{{ activity.name }}</text>
        <view v-if="activity.isCheckedIn" class="tag-done">✓ 已打卡</view>
        <view v-else-if="activity.status === 'ongoing'" class="tag-ongoing">进行中</view>
        <view v-else class="tag-status">{{ STATUS_TEXT[activity.status] || '已结束' }}</view>
      </view>
      <view class="meta-row">
        <Icon class="meta-icon" name="time-line" size="13px" />
        <text class="meta-text">{{ formatActivityTime(activity.startTime, activity.endTime) }}</text>
      </view>
      <view class="meta-row">
        <Icon class="meta-icon" name="location-line" size="13px" />
        <text class="meta-text">{{ activity.location }}</text>
      </view>
    </view>
    <view class="card-action">
      <view v-if="activity.isCheckedIn" class="btn-checked">已完成</view>
      <view v-else class="btn-checkin" @tap="handleCheckin">去打卡</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { formatActivityTime } from '@/utils/format'
import Icon from '@/components/common/Icon.vue'
import type { Activity } from '@/types/volunteer'

interface Props {
  activity: Activity
}

const props = defineProps<Props>()
const emit = defineEmits(['checkin'])

const STATUS_TEXT: Record<string, string> = {
  recruiting: '招募中',
  upcoming: '即将开始',
  ongoing: '进行中',
  ended: '已结束'
}

function handleCheckin() {
  if (!props.activity.isCheckedIn) {
    emit('checkin', props.activity)
  }
}
</script>

<style lang="scss" scoped>
.checkin-card {
  background: #fff;
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  margin-bottom: var(--space-sm, 12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkin-card.is-checked {
  opacity: 0.6;
}

.card-body {
  flex: 1;
  margin-right: var(--space-sm, 12px);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 6px;
}

.card-title {
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  flex: 1;
}

.tag-done {
  font-size: var(--font-xs, 13px);
  color: #a0aab5;
  background: #f0f2f4;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.tag-ongoing {
  font-size: var(--font-xs, 13px);
  color: #27ae60;
  background: #e6f9f0;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.tag-status {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
  background: #f0f2f4;
  padding: 2px 8px;
  border-radius: 20px;
  flex-shrink: 0;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.meta-icon {
  font-size: 13px;
  margin-right: 5px;
  width: 16px;
  flex-shrink: 0;
}

.meta-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card-action {
  flex-shrink: 0;
}

.btn-checkin {
  min-width: 72px;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background: var(--color-primary, #3a7bd5);
  color: #fff;
  font-size: var(--font-sm, 15px);
  font-weight: 500;
  border-radius: var(--radius-md, 10px);
  padding: 0 16px;
}

.btn-checked {
  min-width: 72px;
  height: 44px;
  line-height: 44px;
  text-align: center;
  background: #f0f2f4;
  color: #a0aab5;
  font-size: var(--font-sm, 15px);
  border-radius: var(--radius-md, 10px);
  padding: 0 16px;
}
</style>
