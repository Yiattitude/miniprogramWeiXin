<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>
    
    <view v-elif="activity">
      <view class="status-bar" :style="{ background: statusInfo.bg }">
        <text class="status-text" :style="{ color: statusInfo.color }">{{ statusInfo.text }}</text>
      </view>

      <view class="info-card">
        <text class="act-title">{{ activity.name }}</text>
        
        <view class="info-row">
          <text class="info-icon">🕐</text>
          <view class="info-right">
            <text class="info-label">活动时间</text>
            <text class="info-value">{{ formatActivityTime(activity.startTime, activity.endTime) }}</text>
          </view>
        </view>

        <view class="info-row">
          <text class="info-icon">📍</text>
          <view class="info-right">
            <text class="info-label">活动地点</text>
            <text class="info-value">{{ activity.location }}</text>
          </view>
        </view>

        <view class="info-row">
          <text class="info-icon">📅</text>
          <view class="info-right">
            <text class="info-label">发布时间</text>
            <text class="info-value">{{ formatDateTime(activity.createdAt) }}</text>
          </view>
        </view>
      </view>

      <view class="enroll-card">
        <view class="enroll-header">
          <text class="enroll-title">报名情况</text>
          <view class="enroll-count">
            <text class="count-current">{{ activity.enrollCount }}</text>
            <text class="count-sep"> / </text>
            <text class="count-max">{{ activity.maxCount }} 人</text>
          </view>
        </view>
        <view class="progress-wrap">
          <view class="progress-bar" :style="{ width: enrollPercent + '%' }" />
        </view>
        <view v-if="isFull" class="full-tip">名额已满</view>
      </view>

      <view class="desc-card">
        <text class="desc-title">活动说明</text>
        <text class="desc-text">{{ activity.description }}</text>
      </view>

      <view class="bottom-bar">
        <template v-if="activity.isSignedUp">
          <button 
            class="btn btn-outline" 
            :disabled="actionLoading"
            @tap="handleCancel"
          >
            {{ actionLoading ? '处理中...' : '取消报名' }}
          </button>
        </template>
        <template v-else>
          <button 
            v-if="activity.status !== 'ended' && !isFull"
            class="btn btn-primary" 
            :disabled="actionLoading"
            @tap="handleSignup"
          >
            {{ actionLoading ? '报名中...' : '确认报名' }}
          </button>
          <button v-else-if="activity.status === 'ended'" class="btn btn-disabled" disabled>活动已结束</button>
          <button v-else-if="isFull" class="btn btn-disabled" disabled>名额已满</button>
        </template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import { formatActivityTime, formatDateTime } from '@/utils/format'
import type { Activity } from '@/types/volunteer'

const volunteerStore = useVolunteerStore()
const activityId = ref('')
const activity = ref<Activity | null>(null)
const loading = ref(false)
const actionLoading = ref(false)

const STATUS_MAP = {
  recruiting: { text: '招募中', color: '#3a7bd5', bg: '#eef3fc' },
  upcoming: { text: '即将开始', color: '#e67e22', bg: '#fff3e0' },
  ongoing: { text: '进行中', color: '#27ae60', bg: '#e6f9f0' },
  ended: { text: '已结束', color: '#a0aab5', bg: '#f0f2f4' }
}

const statusInfo = computed(() => {
  if (!activity.value) return STATUS_MAP.ended
  return STATUS_MAP[activity.value.status] || STATUS_MAP.ended
})

const isFull = computed(() => {
  return activity.value ? activity.value.enrollCount >= activity.value.maxCount : false
})

const enrollPercent = computed(() => {
  if (!activity.value) return 0
  return Math.min((activity.value.enrollCount / activity.value.maxCount) * 100, 100)
})

onLoad(async (options: any) => {
  const id = options?.activityId || ''
  activityId.value = id
  if (!id) return

  loading.value = true
  try {
    activity.value = await volunteerStore.fetchActivityById(id)
  } catch (err) {
    console.error('[signup-detail] load error:', err)
  } finally {
    loading.value = false
  }
})

async function handleSignup() {
  if (!activity.value) return
  actionLoading.value = true
  try {
    await volunteerStore.signupActivity(activity.value._id)
    activity.value.isSignedUp = true
    activity.value.enrollCount++
    uni.showToast({ title: '报名成功！', icon: 'success' })
  } catch (e: any) {
    console.error('[signup-detail] signup error:', e)
  } finally {
    actionLoading.value = false
  }
}

async function handleCancel() {
  if (!activity.value) return
  actionLoading.value = true
  try {
    await volunteerStore.cancelSignup(activity.value._id)
    activity.value.isSignedUp = false
    activity.value.enrollCount--
    uni.showToast({ title: '已取消报名', icon: 'none' })
  } catch (e: any) {
    console.error('[signup-detail] cancel error:', e)
  } finally {
    actionLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #f0f2f5);
  padding-bottom: 100px;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.status-bar {
  padding: 10px var(--space-md, 16px);
  text-align: center;
}

.status-text {
  font-size: var(--font-sm, 15px);
  font-weight: 600;
}

.info-card {
  background: #fff;
  margin: var(--space-sm, 12px) var(--space-md, 16px);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.act-title {
  display: block;
  font-size: var(--font-xl, 22px);
  font-weight: 700;
  color: var(--color-text-main, #1e2a3a);
  line-height: 1.4;
  margin-bottom: var(--space-md, 16px);
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm, 12px);
  margin-bottom: var(--space-sm, 12px);
}

.info-icon {
  font-size: 18px;
  margin-top: 1px;
  flex-shrink: 0;
}

.info-right {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
}

.info-value {
  font-size: var(--font-base, 17px);
  color: var(--color-text-main, #1e2a3a);
}

.enroll-card {
  background: #fff;
  margin: 0 var(--space-md, 16px) var(--space-sm, 12px);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.enroll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.enroll-title {
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
}

.enroll-count {
  display: flex;
  align-items: baseline;
  font-size: var(--font-sm, 15px);
}

.count-current {
  font-size: var(--font-lg, 19px);
  font-weight: 700;
  color: var(--color-primary, #3a7bd5);
}

.count-sep, .count-max {
  color: var(--color-text-sub, #6b7b8d);
}

.progress-wrap {
  height: 8px;
  background: var(--color-border, #e2e7ec);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: var(--color-primary, #3a7bd5);
  border-radius: 4px;
}

.full-tip {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-error, #e74c3c);
  text-align: right;
}

.desc-card {
  background: #fff;
  margin: 0 var(--space-md, 16px) var(--space-sm, 12px);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.desc-title {
  display: block;
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  margin-bottom: 10px;
}

.desc-text {
  font-size: var(--font-base, 17px);
  color: var(--color-text-main, #1e2a3a);
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 600;
  border: none;
}

.btn-primary {
  background: var(--color-primary, #3a7bd5);
  color: #fff;
}

.btn-outline {
  background: #fff;
  color: var(--color-text-sub, #6b7b8d);
  border: 1px solid var(--color-border, #e2e7ec);
}

.btn-disabled {
  background: #f5f5f5;
  color: #ccc;
}
</style>
