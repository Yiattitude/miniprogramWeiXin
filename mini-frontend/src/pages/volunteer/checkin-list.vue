<template>
  <view class="page">
    <view class="tip-bar">
      <text class="tip-text">📌 已报名的活动，点击"去打卡"填报本次服务记录</text>
    </view>

    <view v-if="loading" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>
    
    <view v-else-if="list.length > 0" class="list-wrap">
      <CheckinCard 
        v-for="item in list" 
        :key="item._id" 
        :activity="item" 
        @checkin="onCheckin" 
      />
    </view>
    
    <view v-else class="empty">
      <text class="empty-icon">🎉</text>
      <text class="empty-text">暂无待打卡的活动</text>
      <text class="empty-sub">所有活动都已打卡完成，或暂未报名</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import CheckinCard from '@/components/volunteer/CheckinCard.vue'
import type { Activity } from '@/types/volunteer'

const volunteerStore = useVolunteerStore()
const list = ref<Activity[]>([])
const loading = ref(false)

onLoad(() => {
  fetchList()
})

onPullDownRefresh(async () => {
  await fetchList()
  uni.stopPullDownRefresh()
})

async function fetchList() {
  loading.value = true
  try {
    await volunteerStore.fetchMySignups()
    list.value = volunteerStore.mySignups
  } catch (e: any) {
    console.error('[checkin-list] fetch error:', e)
  } finally {
    loading.value = false
  }
}

function onCheckin(activity: Activity) {
  uni.navigateTo({ url: `/pages/volunteer/checkin-form?activityId=${activity._id}` })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #f0f2f5);
  padding-bottom: 40px;
}

.tip-bar {
  background: var(--color-primary-bg, #eef3fc);
  padding: var(--space-sm, 12px) var(--space-md, 16px);
}

.tip-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-primary, #3a7bd5);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.list-wrap {
  padding: var(--space-sm, 12px) var(--space-md, 16px);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px var(--space-md, 16px);
  gap: 10px;
}

.empty-icon {
  font-size: 56px;
}

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
