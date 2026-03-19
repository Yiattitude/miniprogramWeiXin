<template>
  <view class="activity-card" @tap="handleClick">
    <view class="card-header">
      <text class="card-title">{{ activity.name }}</text>
      <view class="status-badge" :style="{ color: statusInfo.color, backgroundColor: statusInfo.bg }">
        {{ statusInfo.text }}
      </view>
    </view>
    
    <view v-if="activity.isCheckedIn" class="tag-signed">✓ 已打卡</view>
    
    <view class="card-meta">
      <view class="meta-row">
        <Icon class="meta-icon" name="time-line" size="14px" />
        <text class="meta-text">{{ formatActivityTime(activity.startTime, activity.endTime) }}</text>
      </view>
      <view class="meta-row">
        <Icon class="meta-icon" name="location-line" size="14px" />
        <text class="meta-text">{{ activity.location }}</text>
      </view>
      <view class="meta-row">
        <Icon class="meta-icon" name="group-line" size="14px" />
        <text class="meta-text">参与人数 {{ activity.enrollCount }} / {{ activity.maxCount }} 人</text>
      </view>
    </view>
    
    <view class="progress-wrap">
      <view class="progress-bar" :style="{ width: enrollPercent + '%' }" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { formatActivityTime } from '@/utils/format'
import type { Activity } from '@/types/volunteer'

interface Props {
  activity: Activity
}

const props = defineProps<Props>()
const emit = defineEmits(['click'])

const STATUS_MAP = {
  recruiting: { text: '招募中', color: '#3a7bd5', bg: '#eef3fc' },
  upcoming: { text: '即将开始', color: '#e67e22', bg: '#fff3e0' },
  ongoing: { text: '进行中', color: '#27ae60', bg: '#e6f9f0' },
  ended: { text: '已结束', color: '#a0aab5', bg: '#f0f2f4' }
}

const statusInfo = computed(() => {
  return STATUS_MAP[props.activity.status] || STATUS_MAP.ended
})

const enrollPercent = computed(() => {
  if (!props.activity.maxCount) return 0
  return Math.min((props.activity.enrollCount / props.activity.maxCount) * 100, 100)
})

function handleClick() {
  emit('click', props.activity)
}
</script>

<style lang="scss" scoped>
.activity-card {
  background: #fff;
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  margin-bottom: var(--space-sm, 12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-title {
  font-size: var(--font-lg, 19px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  line-height: 1.4;
  flex: 1;
  margin-right: 8px;
}

.status-badge {
  font-size: var(--font-xs, 13px);
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.tag-signed {
  display: inline-block;
  font-size: var(--font-xs, 13px);
  color: #27ae60;
  background: #e6f9f0;
  padding: 2px 10px;
  border-radius: 20px;
  margin-bottom: 10px;
}

.card-meta {
  margin-bottom: 10px;
}

.meta-row {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.meta-icon {
  font-size: 14px;
  margin-right: 6px;
  width: 18px;
  flex-shrink: 0;
}

.meta-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
  line-height: 1.5;
}

.progress-wrap {
  height: 4px;
  background: var(--color-border, #e2e7ec);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary, #3a7bd5);
  border-radius: 4px;
}
</style>
