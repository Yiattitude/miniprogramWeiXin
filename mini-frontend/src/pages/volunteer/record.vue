<script setup lang="ts">
/**
 * @page volunteer/record
 * @description 历史打卡记录列表（分页），展示时间/人数/状态徽章
 * @phase Phase 4 - 4-2
 */
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import type { CheckinRecord } from '@/types/volunteer'

const volunteerStore = useVolunteerStore()

const loading = ref(false)
const page = ref(1)
const PAGE_SIZE = 10
const finished = ref(false)
const list = ref<CheckinRecord[]>([])
const total = ref(0)

// 审核状态映射
const STATUS_MAP: Record<string, { text: string; color: string; bg: string }> = {
  pending:  { text: '审核中',  color: '#e67e22', bg: '#fff3e0' },
  approved: { text: '已通过', color: '#27ae60', bg: '#e6f9f0' },
  rejected: { text: '已驳回', color: '#e74c3c', bg: '#fde8e8' },
}

function statusInfo(status: string) {
  return STATUS_MAP[status] ?? { text: status, color: '#a0aab5', bg: '#f0f2f4' }
}

// 格式化时间：ISO → 可读
function formatDate(iso: string): string {
  if (!iso) return ''
  return iso.replace('T', ' ').slice(0, 16)
}

onLoad(() => loadFirst())

onPullDownRefresh(() => {
  loadFirst().finally(() => uni.stopPullDownRefresh())
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
    list.value.push(...result.list)
    total.value = result.total
    if (list.value.length >= result.total) {
      finished.value = true
    } else {
      page.value++
    }
  } finally {
    loading.value = false
  }
}

// 图片预览
function previewPhoto(photos: string[], index: number) {
  uni.previewImage({ urls: photos, current: photos[index] })
}
</script>

<template>
  <view class="page" @touchmove.stop>
    <!-- 统计栏 -->
    <view class="stat-bar">
      <text class="stat-bar-text">共 {{ total }} 条打卡记录</text>
    </view>

    <!-- 加载状态（首次加载） -->
    <view v-if="loading && list.length === 0" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>

    <!-- 记录列表 -->
    <scroll-view
      v-else
      scroll-y
      class="scroll-wrap"
      @scrolltolower="loadMore"
    >
      <!-- 空状态 -->
      <view v-if="list.length === 0 && !loading" class="empty">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无打卡记录</text>
        <text class="empty-sub">参加活动并完成打卡后，记录将显示在这里</text>
      </view>

      <!-- 卡片列表 -->
      <view v-else class="list-wrap">
        <view
          v-for="item in list"
          :key="item.id"
          class="record-card"
        >
          <!-- 卡片头部：活动名称 + 状态徽章 -->
          <view class="card-head">
            <text class="activity-name">{{ item.activityName }}</text>
            <view
              class="status-badge"
              :style="{ color: statusInfo(item.status).color, background: statusInfo(item.status).bg }"
            >
              {{ statusInfo(item.status).text }}
            </view>
          </view>

          <!-- 活动地点 -->
          <view class="card-row">
            <text class="row-icon">📍</text>
            <text class="row-text">{{ item.activityLocation }}</text>
          </view>

          <!-- 打卡时间 -->
          <view class="card-row">
            <text class="row-icon">🕐</text>
            <text class="row-text">{{ formatDate(item.checkedAt) }}</text>
          </view>

          <!-- 关键指标区 -->
          <view class="metrics-row">
            <view class="metric-item">
              <text class="metric-num">{{ item.serviceHours }}</text>
              <text class="metric-label">服务时长(h)</text>
            </view>
            <view class="metric-divider" />
            <view class="metric-item">
              <text class="metric-num">{{ item.serviceCount }}</text>
              <text class="metric-label">服务人数</text>
            </view>
          </view>

          <!-- 备注 -->
          <view v-if="item.remark" class="remark-row">
            <text class="remark-label">备注：</text>
            <text class="remark-text">{{ item.remark }}</text>
          </view>

          <!-- 现场照片 -->
          <view v-if="item.photos && item.photos.length > 0" class="photos-wrap">
            <image
              v-for="(url, idx) in item.photos"
              :key="idx"
              class="photo-thumb"
              :src="url"
              mode="aspectFill"
              @click="previewPhoto(item.photos, idx)"
            />
          </view>
        </view>
      </view>

      <!-- 加载更多 / 已全部加载 -->
      <view class="load-more-wrap">
        <view v-if="loading" class="load-more-loading">
          <uv-loading-icon size="28" />
          <text class="load-more-text">加载中</text>
        </view>
        <text v-else-if="finished && list.length > 0" class="load-more-finished">
          ── 已加载全部记录 ──
        </text>
      </view>
    </scroll-view>
  </view>
</template>

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

/* 记录卡片 */
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
.row-icon { font-size: 16px; }
.row-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
}

/* 指标区 */
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
  height: 36px;
  background: var(--color-border, #e2e7ec);
}

/* 备注 */
.remark-row {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}
.remark-label {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
  flex-shrink: 0;
}
.remark-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-main, #1e2a3a);
  line-height: 1.5;
}

/* 照片 */
.photos-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: var(--space-sm, 12px);
}
.photo-thumb {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  background: #f0f0f0;
}

/* 加载更多 */
.load-more-wrap {
  display: flex;
  justify-content: center;
  padding: var(--space-lg, 24px) 0 40px;
}
.load-more-loading {
  display: flex;
  align-items: center;
  gap: 8px;
}
.load-more-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-muted, #a0aab5);
}
.load-more-finished {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-muted, #a0aab5);
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px var(--space-md, 16px);
  gap: 10px;
}
.empty-icon { font-size: 56px; }
.empty-text {
  font-size: var(--font-lg, 19px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
}
.empty-sub {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-muted, #a0aab5);
  text-align: center;
}
</style>