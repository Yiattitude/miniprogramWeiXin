<template>
  <view class="page">
    <view class="header">
      <text class="header-title">志愿活动</text>
      <text class="header-sub">参与志愿服务，传递银发力量</text>
    </view>

    <view class="grid">
      <view class="grid-item" @tap="goPage('/pages/volunteer/signup-list')">
        <view class="grid-icon-wrap" style="background: #eef3fc">
          <text class="grid-icon">📝</text>
        </view>
        <text class="grid-label">活动报名</text>
        <text class="grid-desc">浏览并报名志愿活动</text>
      </view>

      <view class="grid-item" @tap="goPage('/pages/volunteer/checkin-list')">
        <view class="grid-icon-wrap" style="background: #e6f9f0">
          <text class="grid-icon">✅</text>
        </view>
        <text class="grid-label">志愿打卡</text>
        <text class="grid-desc">已报名活动打卡记录</text>
      </view>

      <view v-if="userStore.isAdmin" class="grid-item" @tap="goPage('/pages/volunteer/publish')">
        <view class="grid-icon-wrap" style="background: #fff3e0">
          <text class="grid-icon">📢</text>
        </view>
        <text class="grid-label">发布活动</text>
        <text class="grid-desc">创建新的志愿活动</text>
      </view>

      <view class="grid-item" @tap="goPage('/pages/volunteer/record')">
        <view class="grid-icon-wrap" style="background: #f3eeff">
          <text class="grid-icon">📋</text>
        </view>
        <text class="grid-label">打卡记录</text>
        <text class="grid-desc">查看历史打卡记录</text>
      </view>

      <view class="grid-item" @tap="goPage('/pages/volunteer/statistics')">
        <view class="grid-icon-wrap" style="background: #fdf0f0">
          <text class="grid-icon">📊</text>
        </view>
        <text class="grid-label">统计报表</text>
        <text class="grid-desc">个人与团队统计汇总</text>
      </view>
    </view>

    <view v-if="userStore.userInfo" class="summary-card">
      <text class="summary-title">我的志愿汇总</text>
      <view class="summary-row">
        <view class="summary-item">
          <text class="summary-num">{{ userStore.userInfo.totalHours || 0 }}</text>
          <text class="summary-label">服务时长(h)</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-num">{{ userStore.userInfo.totalCount || 0 }}</text>
          <text class="summary-label">参与次数</text>
        </view>
        <view class="summary-divider"></view>
        <view class="summary-item">
          <text class="summary-num">{{ userStore.userInfo.totalServed || 0 }}</text>
          <text class="summary-label">服务人数</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

function goPage(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #f0f2f5);
  padding-bottom: 40px;
}

/* 顶部 */
.header {
  background: linear-gradient(135deg, #27ae60 0%, #1e8449 100%);
  padding: 36px var(--space-md, 16px) var(--space-xl, 32px);
}
.header-title {
  display: block;
  font-size: var(--font-xl, 22px);
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}
.header-sub {
  font-size: var(--font-sm, 15px);
  color: rgba(255, 255, 255, 0.8);
}

/* 四格 */
.grid {
  display: flex;
  flex-wrap: wrap;
  padding: var(--space-md, 16px);
  gap: var(--space-sm, 12px);
  margin-top: -20px;
}
.grid-item {
  flex: 0 0 calc(50% - 6px);
  background: #fff;
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.grid-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm, 6px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.grid-icon {
  font-size: 26px;
}
.grid-label {
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
}
.grid-desc {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-sub, #6b7b8d);
}

/* 汇总卡 */
.summary-card {
  background: #fff;
  margin: 0 var(--space-md, 16px);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.summary-title {
  display: block;
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  margin-bottom: var(--space-sm, 12px);
}
.summary-row {
  display: flex;
  align-items: center;
}
.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.summary-num {
  font-size: var(--font-xl, 22px);
  font-weight: 700;
  color: #27ae60;
}
.summary-label {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-sub, #6b7b8d);
}
.summary-divider {
  width: 1px;
  height: 30px;
  background: #eee;
}
</style>
