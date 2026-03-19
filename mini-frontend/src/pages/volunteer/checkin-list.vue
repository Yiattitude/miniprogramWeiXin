<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="tip-bar">
      <text class="tip-text">📌 直接选择活动，点击"去打卡"填报本次服务记录</text>
    </view>

    <view v-if="loading && list.length === 0" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>
    
    <view v-else-if="list.length > 0" class="list-wrap">
      <CheckinCard 
        v-for="item in list" 
        :key="item._id" 
        :activity="item" 
        @checkin="onCheckin" 
      />
      <uv-load-more
        :status="finished ? 'nomore' : loading ? 'loading' : 'loadmore'"
        @loadmore="onLoadMore"
      />
    </view>
    
    <view v-else class="empty">
      <Icon class="empty-icon" name="check-circle-line" size="72px" />
      <text class="empty-text">暂无待打卡的活动</text>
      <text class="empty-sub">暂无可打卡的活动，稍后再来看看</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import CheckinCard from '@/components/volunteer/CheckinCard.vue'
import type { Activity } from '@/types/volunteer'

const volunteerStore = useVolunteerStore()
const list = ref<Activity[]>([])
const loading = ref(false)
const page = ref(1)
const finished = ref(false)
const PAGE_SIZE = 10

onLoad(() => {
  loadList(true)
})

onPullDownRefresh(async () => {
  await loadList(true)
  uni.stopPullDownRefresh()
})

onReachBottom(() => {
  if (!finished.value) {
    loadList()
  }
})

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

async function loadList(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    finished.value = false
    list.value = []
    volunteerStore.resetFilter()
  }
  if (finished.value) return

  loading.value = true
  try {
    const result = await volunteerStore.fetchActivityList(page.value, PAGE_SIZE)
    const incoming = Array.isArray(result.list) ? result.list : []
    const merged = mergeActivities(list.value, incoming)
    list.value = merged

    const totalFromResult = typeof result.total === 'number' ? result.total : null
    const reachedTotal = totalFromResult !== null
      ? merged.length >= totalFromResult
      : incoming.length < PAGE_SIZE

    if (reachedTotal || incoming.length === 0) {
      finished.value = true
    } else {
      page.value += 1
    }
  } catch (e: any) {
    console.error('[checkin-list] fetch error:', e)
    uni.showToast({ title: e?.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onLoadMore() {
  if (!finished.value) loadList()
}

function onCheckin(activity: Activity) {
  uni.navigateTo({ url: `/pages/volunteer/checkin-form?activityId=${activity._id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding-bottom: 44px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.tip-bar {
  background: linear-gradient(135deg, #eef6ff 0%, #e0efff 100%);
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(47, 98, 198, 0.08);
}

.tip-text {
  font-size: 14px;
  color: #2f62c6;
  font-weight: 500;
  line-height: 1.5;
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
  opacity: 0.6;
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
