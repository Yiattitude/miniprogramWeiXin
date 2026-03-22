<template>
  <page-meta root-font-size="system"/>
  <view class="page" v-if="stats">
    <!-- Header Summary Block -->
    <view class="summary-header">
      <view class="sum-box">
        <text class="sum-val">{{ stats.totalUsers }}</text>
        <text class="sum-label">平台总用户数</text>
      </view>
      <view class="sum-box">
        <text class="sum-val">{{ stats.totalCheckins }}</text>
        <text class="sum-label">累计打卡频次</text>
      </view>
      <view class="sum-box">
        <text class="sum-val">{{ stats.totalPointsIssued }}</text>
        <text class="sum-label">全站总发放积分</text>
      </view>
    </view>

    <!-- Top Users -->
    <view class="section-card">
      <view class="section-title">
        <Icon name="medal-line" size="20px" color="#f39c12" />
        <text style="margin-left:8px;">积分风云榜 (Top 5)</text>
      </view>
      
      <view class="top-list">
        <view v-for="(user, index) in stats.topUsers" :key="index" class="top-item">
          <view class="rank-badge" :class="'rank-' + (index + 1)">
            {{ index + 1 }}
          </view>
          <text class="top-name">{{ user.realName }}</text>
          <view class="top-pts">
            <text class="pts-val">{{ user.totalPoints }}</text>
            <text class="pts-txt"> 积分</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onLoad } from '@dcloudio/uni-app'
import { getAdminStats } from '@/api/admin'
import type { AdminStats } from '@/api/admin'

const stats = ref<AdminStats | null>(null)

onLoad(async () => {
  uni.showLoading({ title: '加载数据中' })
  try {
    const res = await getAdminStats()
    if (res.code === 0 && res.data) {
      stats.value = res.data
    }
  } finally {
    uni.hideLoading()
  }
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f4f6f9;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-header {
  background: linear-gradient(135deg, #4f8cec 0%, #2f62c6 100%);
  border-radius: 16px;
  padding: 24px 16px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 8px 16px rgba(47, 98, 198, 0.2);
}

.sum-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
}

.sum-val {
  font-size: 28px;
  font-weight: 800;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sum-label {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 6px;
}

.section-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: 700;
  color: #222;
  margin-bottom: 20px;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.top-item {
  display: flex;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid #f5f5f5;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  background: #f0f2f5;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  margin-right: 16px;

  &.rank-1 { background: #fee2e2; color: #ef4444; }
  &.rank-2 { background: #fef3c7; color: #f59e0b; }
  &.rank-3 { background: #e0e7ff; color: #6366f1; }
}

.top-name {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.top-pts {
  display: flex;
  align-items: baseline;
}

.pts-val {
  font-size: 20px;
  font-weight: 800;
  color: #3a7bd5;
}

.pts-txt {
  font-size: 12px;
  color: #888;
  margin-left: 2px;
}
</style>
