<template>
  <view class="page">
    <view class="stat-bar">
      <text class="stat-bar-text">共 {{ total }} 条打卡记录</text>
    </view>

    <view v-if="loading && list.length === 0" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>

    <scroll-view v-else scroll-y class="scroll-wrap" @scrolltolower="loadMore">
      <view v-if="list.length === 0 && !loading" class="empty">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无打卡记录</text>
        <text class="empty-sub">参加活动并完成打卡后，记录将显示在这里</text>
      </view>

      <view v-else class="list-wrap">
        <view v-for="item in list" :key="item._id" class="record-card">
          <view class="card-head">
            <text class="activity-name">{{ item.activityName }}</text>
            <view class="status-badge" :style="{ color: statusInfo(item.status).color, background: statusInfo(item.status).bg }">
              {{ statusInfo(item.status).text }}
            </view>
          </view>

          <view class="card-row">
            <text class="row-icon">📍</text>
            <text class="row-text">{{ item.activityLocation }}</text>
          </view>
          <view class="card-row">
            <text class="row-icon">🕐</text>
            <text class="row-text">{{ formatDate(item.checkedAt) }}</text>
          </view>

          <view class="metrics-row">
            <view class="metric-item">
              <text class="metric-num">{{ item.serviceHours }}</text>
              <text class="metric-label">服务时长(h)</text>
            </view>
            <view class="metric-divider"></view>
            <view class="metric-item">
              <text class="metric-num">{{ item.serviceCount }}</text>
              <text class="metric-label">服务人数</text>
            </view>
          </view>

          <view v-if="item.remark" class="remark-row">
            <text class="remark-label">备注：</text>
            <text class="remark-text">{{ item.remark }}</text>
          </view>

          <view v-if="item.photos && item.photos.length > 0" class="photos-wrap">
            <image 
              v-for="(url, idx) in item.photos" 
              :key="idx" 
              :src="url" 
              mode="aspectFill" 
              class="photo-item"
              @tap="previewPhoto(item.photos, idx)"
            />
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-wrap">
        <uv-loading-icon size="28" />
      </view>
      <view v-else-if="finished && list.length > 0" class="no-more">已显示全部记录</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import type { CheckinRecord } from '@/types/volunteer'

const volunteerStore = useVolunteerStore()
const loading = ref(false)
const page = ref(1)
const finished = ref(false)
const list = ref<CheckinRecord[]>([])
const total = ref(0)
const PAGE_SIZE = 10

const STATUS_MAP = {
  pending: { text: '审核中', color: '#e67e22', bg: '#fff3e0' },
  approved: { text: '已通过', color: '#27ae60', bg: '#e6f9f0' },
  rejected: { text: '已驳回', color: '#e74c3c', bg: '#fde8e8' }
}

function statusInfo(status: string) {
  return STATUS_MAP[status as keyof typeof STATUS_MAP] || { text: status, color: '#a0aab5', bg: '#f0f2f4' }
}

function formatDate(iso: string) {
  if (!iso) return ''
  return iso.replace('T', ' ').slice(0, 16)
}

onLoad(() => loadFirst())

onPullDownRefresh(async () => {
  await loadFirst()
  uni.stopPullDownRefresh()
})

async function loadFirst() {
  page.value = 1
  finished.value = false
  list.value = []
  await loadMore()
}

async function loadMore() {
  if (loading.value || finished.value) return
  loading.value = true
  try {
    const result = await volunteerStore.fetchMyRecords(page.value, PAGE_SIZE)
    list.value = page.value === 1 ? result.list : [...list.value, ...result.list]
    total.value = result.total
    if (list.value.length >= result.total) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (err) {
    console.error('[record] load error:', err)
  } finally {
    loading.value = false
  }
}

function previewPhoto(photos: string[], index: number) {
  uni.previewImage({
    urls: photos,
    current: photos[index]
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #f0f2f5);
  display: flex;
  flex-direction: column;
}

.stat-bar {
  background: var(--color-primary-bg, #eef3fc);
  padding: var(--space-sm, 12px) var(--space-md, 16px);
}

.stat-bar-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-primary, #3a7bd5);
  font-weight: 600;
}

.scroll-wrap {
  flex: 1;
  height: 0;
  min-height: calc(100vh - 44px);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.list-wrap {
  padding: var(--space-sm, 12px) var(--space-md, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 12px);
}

.record-card {
  background: #fff;
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: var(--space-sm, 12px);
}

.activity-name {
  flex: 1;
  font-size: var(--font-lg, 19px);
  font-weight: 700;
  color: var(--color-text-main, #1e2a3a);
  line-height: 1.4;
}

.status-badge {
  flex-shrink: 0;
  font-size: var(--font-xs, 13px);
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.card-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.row-icon {
  font-size: 16px;
}

.row-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
}

.metrics-row {
  display: flex;
  align-items: center;
  background: var(--color-bg-page, #f0f2f5);
  border-radius: 8px;
  padding: var(--space-sm, 12px) 0;
  margin: var(--space-sm, 12px) 0 8px;
}

.metric-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.metric-num {
  font-size: var(--font-xl, 22px);
  font-weight: 700;
  color: var(--color-primary, #3a7bd5);
}

.metric-label {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-sub, #6b7b8d);
}

.metric-divider {
  width: 1px;
  height: 24px;
  background: #e2e7ec;
}

.remark-row {
  display: flex;
  margin-top: 10px;
  background: #fdfaf5;
  padding: 10px;
  border-radius: 6px;
}

.remark-label {
  font-size: 13px;
  color: #a0aab5;
  flex-shrink: 0;
}

.remark-text {
  font-size: 14px;
  color: #6b7b8d;
}

.photos-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.photo-item {
  width: calc((100% - 16px) / 3);
  height: 90px;
  border-radius: 4px;
  background: #f0f2f5;
}

.no-more {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: #ccc;
}
</style>
