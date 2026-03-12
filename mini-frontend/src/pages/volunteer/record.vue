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
        <Icon class="empty-icon" name="file-text-line" size="72px" />
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
            <Icon class="row-icon" name="location-line" size="16px" />
            <text class="row-text">{{ item.activityLocation }}</text>
          </view>
          <view class="card-row">
            <Icon class="row-icon" name="time-line" size="16px" />
            <text class="row-text">{{ formatCheckedAt(item.checkedAt) }}</text>
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
import Icon from '@/components/common/Icon.vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import { formatDateTime } from '@/utils/format'
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

function formatCheckedAt(value: string | number | Date) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  // Avoid string replace on Date objects; format via Date helpers.
  return formatDateTime(date)
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
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  display: flex;
  flex-direction: column;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.stat-bar {
  background: linear-gradient(135deg, #eef6ff 0%, #e0efff 100%);
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(47, 98, 198, 0.08);
}

.stat-bar-text {
  font-size: 14px;
  color: #2f62c6;
  font-weight: 700;
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
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.record-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 20px rgba(20, 28, 46, 0.08);
  animation: riseIn 0.45s ease-out both;
  transition: transform 0.2s ease;
}

.record-card:active {
  transform: scale(0.99);
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}

.activity-name {
  flex: 1;
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
  line-height: 1.4;
}

.status-badge {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.card-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.row-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.row-text {
  font-size: 14px;
  color: #7a8797;
  line-height: 1.5;
}

.metrics-row {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f7f9fc 0%, #eef3fc 100%);
  border-radius: 14px;
  padding: 16px 0;
  margin: 14px 0 10px;
  box-shadow: 0 2px 8px rgba(47, 98, 198, 0.06);
}

.metric-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.metric-num {
  font-size: 24px;
  font-weight: 700;
  color: #2f62c6;
}

.metric-label {
  font-size: 12px;
  color: #7a8797;
  font-weight: 500;
}

.metric-divider {
  width: 1px;
  height: 32px;
  background: #e6ebf2;
}

.remark-row {
  display: flex;
  margin-top: 12px;
  background: linear-gradient(135deg, #fffcf5 0%, #fff9eb 100%);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid #f5ead4;
}

.remark-label {
  font-size: 13px;
  color: #a0aab5;
  flex-shrink: 0;
  font-weight: 600;
}

.remark-text {
  font-size: 14px;
  color: #6b7b8d;
  line-height: 1.6;
}

.photos-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.photo-item {
  width: calc((100% - 20px) / 3);
  height: 90px;
  border-radius: 10px;
  background: #f7f9fc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease;
}

.photo-item:active {
  transform: scale(0.95);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 16px;
  gap: 14px;
  animation: fadeIn 0.5s ease-out both;
}

.empty-icon {
  font-size: 72px;
  opacity: 0.5;
}

.empty-text {
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
}

.empty-sub {
  font-size: 14px;
  color: #7a8797;
  text-align: center;
  line-height: 1.6;
  max-width: 280px;
}

.no-more {
  text-align: center;
  padding: 24px 0;
  font-size: 13px;
  color: #a0aab5;
  font-weight: 500;
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
