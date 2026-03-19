<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="banner">
      <view class="banner-left">
        <image class="avatar" :src="userStore.userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-info">
          <text class="welcome">{{ userStore.userInfo ? '你好，' + userStore.userInfo.nickName : '欢迎使用' }}</text>
          <text class="unit">{{ userStore.userInfo?.unit || '银才荟-志愿服务平台' }}</text>
        </view>
      </view>
      <view class="banner-logo-text">志愿</view>
    </view>

    <view v-if="userStore.isLoggedIn && userStore.userInfo" class="stat-card">
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalHours || 0 }}</text>
        <text class="stat-label">服务时长(h)</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalCount || 0 }}</text>
        <text class="stat-label">参与活动</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalServed || 0 }}</text>
        <text class="stat-label">服务人次</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">功能模块</text>
      <view class="module-card module-primary" @tap="goVolunteer">
        <view class="module-icon-wrap">
          <Icon class="module-icon" name="hand-heart-line" size="28px" />
        </view>
        <view class="module-info">
          <text class="module-name">志愿活动</text>
          <text class="module-desc">活动打卡、打卡记录、统计报表</text>
        </view>
        <Icon class="module-arrow" name="arrow-right-line" size="24px" />
      </view>
    </view>

    <view class="section">
      <text class="section-title">活动一览</text>
      <view class="activity-list">
        <view v-if="activityLoading && activities.length === 0" class="loading-wrap">
          <uv-loading-icon size="36" />
          <text class="loading-text">加载中...</text>
        </view>

        <ActivityCard
          v-for="item in activities"
          :key="item._id"
          :activity="item"
          @click="onCheckin"
        />

        <view v-if="!activityLoading && activities.length === 0" class="empty">
          <text class="empty-text">暂无已发布的活动</text>
        </view>

        <view v-if="activities.length > 0" class="load-more">
          <view v-if="activityLoading" class="load-more-row">
            <uv-loading-icon size="26" />
            <text class="load-more-text">加载中...</text>
          </view>
          <text v-else-if="activityFinished" class="load-more-text">已加载全部活动</text>
          <text v-else class="load-more-text">上拉加载更多</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { useUserStore } from '@/stores/user'
import { useVolunteerStore } from '@/stores/volunteer'
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import ActivityCard from '@/components/volunteer/ActivityCard.vue'
import type { Activity } from '@/types/volunteer'

const userStore = useUserStore()
const volunteerStore = useVolunteerStore()

const activities = ref<Activity[]>([])
const activityPage = ref(1)
const activityPageSize = ref(4)
const activityLoading = ref(false)
const activityFinished = ref(false)

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.fetchProfile()
  }
})

onLoad(() => {
  computePageSize()
  loadActivities(true)
})

onReachBottom(() => {
  if (!activityFinished.value) {
    loadActivities()
  }
})

function goVolunteer() {
  uni.switchTab({ url: '/pages/volunteer/index' })
}

function onCheckin(activity: Activity) {
  uni.navigateTo({ url: `/pages/volunteer/checkin-form?activityId=${activity._id}` })
}

function computePageSize() {
  try {
    const { windowHeight } = uni.getSystemInfoSync()
    const reservedHeight = 380
    const cardHeight = 140
    const count = Math.ceil((windowHeight - reservedHeight) / cardHeight)
    activityPageSize.value = Math.min(8, Math.max(3, count))
  } catch (e) {
    activityPageSize.value = 4
  }
}

function getPublishTime(activity: Activity) {
  const ts = Date.parse(activity.createdAt || activity.startTime || activity.endTime || '')
  return Number.isFinite(ts) ? ts : 0
}

function mergeActivities(current: Activity[], incoming: Activity[]) {
  const map = new Map<string, Activity>()
  current.forEach(item => map.set(item._id, item))
  incoming.forEach(item => map.set(item._id, item))
  return Array.from(map.values()).sort(
    (a, b) => getPublishTime(b) - getPublishTime(a)
  )
}

async function loadActivities(reset = false) {
  if (activityLoading.value) return
  if (reset) {
    activityPage.value = 1
    activityFinished.value = false
    activities.value = []
    volunteerStore.resetFilter()
  }
  if (activityFinished.value) return

  activityLoading.value = true
  try {
    const result = await volunteerStore.fetchActivityList(
      activityPage.value,
      activityPageSize.value
    )
    const incoming = Array.isArray(result.list) ? result.list : []
    const merged = mergeActivities(activities.value, incoming)
    activities.value = merged

    const totalFromResult = typeof result.total === 'number' ? result.total : null
    const reachedTotal = totalFromResult !== null
      ? merged.length >= totalFromResult
      : incoming.length < activityPageSize.value

    if (reachedTotal || incoming.length === 0) {
      activityFinished.value = true
    } else {
      activityPage.value += 1
    }
  } catch (e: any) {
    console.error('[index] loadActivities error:', e)
    uni.showToast({ title: e?.message || '加载失败', icon: 'none' })
  } finally {
    activityLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding: 16px 16px 44px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #132b63 0%, #1f4696 45%, #2d61bf 100%);
  box-shadow: 0 14px 28px rgba(18, 44, 99, 0.28);
  overflow: hidden;
  animation: riseIn 0.45s ease-out both;
}

.banner::after {
  content: '';
  position: absolute;
  right: -40px;
  top: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 1;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.welcome {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.unit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.banner-logo-text {
  z-index: 1;
  padding: 6px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9a2f 0%, #ff7d1a 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 6px 16px rgba(255, 125, 26, 0.4);
}

.stat-card {
  background: #fff;
  margin-top: 16px;
  border-radius: 18px;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 18px rgba(29, 55, 107, 0.08);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.05s;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #1f4ea3;
}

.stat-label {
  font-size: 12px;
  color: #7a8797;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e6ebf2;
  flex-shrink: 0;
}

.section {
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 12px;
}

.module-card {
  display: flex;
  align-items: center;
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 12px 24px rgba(25, 52, 110, 0.2);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.1s;
}

.module-primary {
  background: linear-gradient(135deg, #2f62c6 0%, #3e7ae4 100%);
}

.module-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  border: 2px solid rgba(255, 255, 255, 0.4);
  margin-right: 12px;
}

.module-icon {
  font-size: 28px;
}

.module-info {
  flex: 1;
}

.module-name {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.module-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.module-arrow {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 6px;
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;
  gap: 10px;
}

.loading-text {
  font-size: 14px;
  color: #7a8797;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 56px 0;
}

.empty-text {
  font-size: 15px;
  color: #7a8797;
  font-weight: 500;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 8px 0 4px;
}

.load-more-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.load-more-text {
  font-size: 13px;
  color: #7a8797;
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
</style>
