<template>
  <view class="page">
    <view class="banner">
      <view class="banner-left">
        <image class="avatar" :src="userStore.userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-info">
          <text class="welcome">{{ userStore.userInfo ? '你好，' + userStore.userInfo.nickname : '欢迎使用' }}</text>
          <text class="unit">{{ userStore.userInfo?.unit || '银发人才平台' }}</text>
        </view>
      </view>
      <view class="banner-logo-text">志愿</view>
    </view>

    <view v-if="userStore.isLoggedIn && userStore.userInfo" class="stat-card">
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalHours || 0 }}</text>
        <text class="stat-label">志愿时长(h)</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalCount || 0 }}</text>
        <text class="stat-label">参与次数</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalServed || 0 }}</text>
        <text class="stat-label">服务人次</text>
      </view>
    </view>

    <view class="section-title">功能模块</view>
    <view class="module-card" @tap="goVolunteer">
      <view class="module-icon-wrap" style="background: #eef3fc">
        <text class="module-icon">🤝</text>
      </view>
      <view class="module-info">
        <text class="module-name">志愿活动</text>
        <text class="module-desc">报名参加、打卡记录、统计报表</text>
      </view>
      <text class="module-arrow">›</text>
    </view>

    <view class="section-title">快捷入口</view>
    <view class="quick-grid">
      <view class="quick-item" @tap="goPage('/pages/volunteer/signup-list')">
        <text class="quick-icon">📝</text>
        <text class="quick-label">活动报名</text>
      </view>
      <view class="quick-item" @tap="goPage('/pages/volunteer/checkin-list')">
        <text class="quick-icon">✅</text>
        <text class="quick-label">志愿打卡</text>
      </view>
      <view class="quick-item" @tap="goPage('/pages/volunteer/record')">
        <text class="quick-icon">📋</text>
        <text class="quick-label">打卡记录</text>
      </view>
      <view class="quick-item" @tap="goPage('/pages/volunteer/statistics')">
        <text class="quick-icon">📊</text>
        <text class="quick-label">统计报表</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.fetchProfile()
  }
})

function goVolunteer() {
  uni.switchTab({ url: '/pages/volunteer/index' })
}

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

/* ── 顶部横幅 ── */
.banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #3a7bd5 0%, #2a5caa 100%);
  padding: 40px var(--space-md, 16px) var(--space-lg, 24px);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 12px);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.welcome {
  font-size: var(--font-lg, 19px);
  font-weight: 600;
  color: #fff;
}

.unit {
  font-size: var(--font-sm, 15px);
  color: rgba(255, 255, 255, 0.8);
}

.banner-logo-text {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 1px;
}

/* ── 汇总统计卡 ── */
.stat-card {
  background: #fff;
  margin: -20px var(--space-md, 16px) 0;
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-md, 16px);
  display: flex;
  align-items: center;
  box-shadow: 0 4px 16px rgba(58, 123, 213, 0.12);
  position: relative;
  z-index: 1;
  margin-bottom: var(--space-md, 16px);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: var(--font-xl, 22px);
  font-weight: 700;
  color: var(--color-primary, #3a7bd5);
}

.stat-label {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-sub, #6b7b8d);
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--color-border, #e2e7ec);
  flex-shrink: 0;
}

/* ── 标题 ── */
.section-title {
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  padding: var(--space-md, 16px) var(--space-md, 16px) var(--space-xs, 8px);
}

/* ── 大模块卡 ── */
.module-card {
  background: #fff;
  margin: 0 var(--space-md, 16px);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.module-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.module-icon {
  font-size: 26px;
}

.module-info {
  flex: 1;
}

.module-name {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: #1e2a3a;
  margin-bottom: 2px;
}

.module-desc {
  font-size: 13px;
  color: #6b7b8d;
}

.module-arrow {
  font-size: 24px;
  color: #ccc;
  margin-left: 8px;
}

/* ── 快捷网格 ── */
.quick-grid {
  display: flex;
  flex-wrap: wrap;
  padding: var(--space-sm, 12px) var(--space-md, 16px);
  gap: var(--space-sm, 12px);
}

.quick-item {
  flex: 0 0 calc(50% - 6px);
  background: #fff;
  border-radius: var(--radius-md, 10px);
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.quick-icon {
  font-size: 28px;
}

.quick-label {
  font-size: 15px;
  font-weight: 500;
  color: #1e2a3a;
}
</style>
