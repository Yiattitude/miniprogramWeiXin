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
      <Icon class="empty-icon" name="check-circle-line" size="72px" />
      <text class="empty-text">暂无待打卡的活动</text>
      <text class="empty-sub">所有活动都已打卡完成，或暂未报名</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
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
