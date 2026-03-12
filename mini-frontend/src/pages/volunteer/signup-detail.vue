<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view v-if="loading" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>
    
    <view v-else-if="activity">
      <view class="status-bar" :style="{ background: statusInfo.bg }">
        <text class="status-text" :style="{ color: statusInfo.color }">{{ statusInfo.text }}</text>
      </view>

      <view class="info-card">
        <text class="act-title">{{ activity.name }}</text>
        
        <view class="info-row">
          <Icon class="info-icon" name="time-line" size="18px" />
          <view class="info-right">
            <text class="info-label">活动时间</text>
            <text class="info-value">{{ formatActivityTime(activity.startTime, activity.endTime) }}</text>
          </view>
        </view>

        <view class="info-row">
          <Icon class="info-icon" name="location-line" size="18px" />
          <view class="info-right">
            <text class="info-label">活动地点</text>
            <text class="info-value">{{ activity.location }}</text>
          </view>
        </view>

        <view class="info-row">
          <Icon class="info-icon" name="calendar-line" size="18px" />
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
import Icon from '@/components/common/Icon.vue'
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
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding-bottom: 100px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 100px 0;
}

.status-bar {
  padding: 12px 16px;
  text-align: center;
  animation: slideDown 0.3s ease-out both;
}

.status-text {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.info-card {
  background: #fff;
  margin: 16px;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 24px rgba(29, 55, 107, 0.1);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.05s;
}

.act-title {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #1c2431;
  line-height: 1.4;
  margin-bottom: 18px;
  letter-spacing: 0.3px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
  padding: 10px 0;
  border-bottom: 1px solid #f7f9fc;
}

.info-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.info-icon {
  font-size: 18px;
  margin-top: 2px;
  flex-shrink: 0;
  width: 24px;
  text-align: center;
}

.info-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #a0aab5;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 15px;
  color: #1c2431;
  font-weight: 500;
  line-height: 1.5;
}

.enroll-card {
  background: #fff;
  margin: 0 16px 14px;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 20px rgba(20, 28, 46, 0.08);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.1s;
}

.enroll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.enroll-title {
  font-size: 16px;
  font-weight: 700;
  color: #1c2431;
}

.enroll-count {
  display: flex;
  align-items: baseline;
  font-size: 14px;
  gap: 2px;
}

.count-current {
  font-size: 22px;
  font-weight: 700;
  color: #2f62c6;
}

.count-sep, .count-max {
  color: #7a8797;
  font-weight: 500;
}

.progress-wrap {
  height: 10px;
  background: #e6ebf2;
  border-radius: 5px;
  overflow: hidden;
  position: relative;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2f62c6 0%, #3e7ae4 100%);
  border-radius: 5px;
  transition: width 0.5s ease;
  box-shadow: 0 2px 8px rgba(47, 98, 198, 0.3);
}

.full-tip {
  margin-top: 10px;
  font-size: 13px;
  color: #e74c3c;
  text-align: right;
  font-weight: 600;
}

.desc-card {
  background: #fff;
  margin: 0 16px 14px;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 20px rgba(20, 28, 46, 0.08);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.15s;
}

.desc-title {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 12px;
}

.desc-text {
  font-size: 15px;
  color: #6b7b8d;
  line-height: 1.7;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, #fff 80%, rgba(255, 255, 255, 0.9));
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.06);
  display: flex;
  gap: 12px;
  backdrop-filter: blur(10px);
}

.btn {
  flex: 1;
  height: 52px;
  border-radius: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 700;
  border: none;
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

.btn:active {
  transform: scale(0.98);
}

.btn-primary {
  background: linear-gradient(135deg, #2f62c6 0%, #3e7ae4 100%);
  color: #fff;
  box-shadow: 0 8px 20px rgba(47, 98, 198, 0.3);
}

.btn-outline {
  background: #fff;
  color: #7a8797;
  border: 2px solid #e6ebf2;
}

.btn-disabled {
  background: #f0f2f5;
  color: #a0aab5;
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
