<script setup lang="ts">
/**
 * @page volunteer/checkin-list
 * @description 我已报名的活动列表：已打卡置灰，未打卡可跳转打卡填报
 */
import { ref } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import CheckinCard from '@/components/volunteer/CheckinCard.vue'
import type { Activity } from '@/types/volunteer'

const volunteerStore = useVolunteerStore()
const list = ref<Activity[]>([])
const loading = ref(false)

onLoad(() => { fetchList() })

onPullDownRefresh(() => {
  fetchList().finally(() => uni.stopPullDownRefresh())
})

async function fetchList() {
  loading.value = true
  try {
    await volunteerStore.fetchMySignups()
    // 展示所有已报名活动（不过滤状态，确保有数据可显示）
    list.value = volunteerStore.mySignups
  } catch (e) {
    console.error('[checkin-list] fetchMySignups error:', e)
  } finally {
    loading.value = false
  }
}

function onCheckin(activity: Activity) {
  uni.navigateTo({ url: `/pages/volunteer/checkin-form?activityId=${activity.id}` })
}
</script>

<template>
  <view class="page">
    <!-- 提示 -->
    <view class="tip-bar">
      <text class="tip-text">📌 已报名的活动，点击"去打卡"填报本次服务记录</text>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>

    <!-- 列表 -->
    <view v-else-if="list.length > 0" class="list-wrap">
      <CheckinCard
        v-for="item in list"
        :key="item.id"
        :activity="item"
        @checkin="onCheckin"
      />
    </view>

    <!-- 空状态 -->
    <view v-else class="empty">
      <text class="empty-icon">🎉</text>
      <text class="empty-text">暂无待打卡的活动</text>
      <text class="empty-sub">所有活动都已打卡完成，或暂未报名</text>
    </view>
  </view>
</template>

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