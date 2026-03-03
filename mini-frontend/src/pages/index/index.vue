<script setup lang="ts">
/**
 * @page index
 * @description 应用首页：顶部欢迎横幅 + 志愿活动功能入口卡片 + 个人汇总统计
 */
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 页面挂载时拉取用户信息
onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.fetchProfile()
  }
})

/** 跳转志愿活动首页 */
function goVolunteer() {
  uni.switchTab({ url: '/pages/volunteer/index' })
}

/** 四格入口点击 */
function goPage(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<template>
  <view class="page">
    <!-- ── 顶部横幅 ── -->
    <view class="banner">
      <view class="banner-left">
        <image
          class="avatar"
          :src="userStore.userInfo?.avatar || '/static/default-avatar.png'"
          mode="aspectFill"
        />
        <view class="user-info">
          <text class="welcome">{{ userStore.userInfo ? '你好，' + userStore.userInfo.nickname : '欢迎使用' }}</text>
          <text class="unit">{{ userStore.userInfo?.unit || '银发人才平台' }}</text>
        </view>
      </view>
      <view class="banner-logo-text">志愿</view>
    </view>

    <!-- ── 汇总统计卡（已登录才显示） ── -->
    <view v-if="userStore.isLoggedIn && userStore.userInfo" class="stat-card">
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalHours }}</text>
        <text class="stat-label">志愿时长(h)</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalCount }}</text>
        <text class="stat-label">参与次数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalServed }}</text>
        <text class="stat-label">服务人次</text>
      </view>
    </view>

    <!-- ── 功能模块标题 ── -->
    <view class="section-title">功能模块</view>

    <!-- ── 志愿活动大入口卡 ── -->
    <view class="module-card" @click="goVolunteer">
      <view class="module-icon-wrap" style="background: #eef3fc;">
        <text class="module-icon">🤝</text>
      </view>
      <view class="module-info">
        <text class="module-name">志愿活动</text>
        <text class="module-desc">报名参加、打卡记录、统计报表</text>
      </view>
      <text class="module-arrow">›</text>
    </view>

    <!-- ── 快捷入口四格 ── -->
    <view class="section-title">快捷入口</view>
    <view class="quick-grid">
      <view class="quick-item" @click="goPage('/pages/volunteer/signup-list')">
        <text class="quick-icon">📝</text>
        <text class="quick-label">活动报名</text>
      </view>
      <view class="quick-item" @click="goPage('/pages/volunteer/checkin-list')">
        <text class="quick-icon">✅</text>
        <text class="quick-label">志愿打卡</text>
      </view>
      <view class="quick-item" @click="goPage('/pages/volunteer/record')">
        <text class="quick-icon">📋</text>
        <text class="quick-label">打卡记录</text>
      </view>
      <view class="quick-item" @click="goPage('/pages/volunteer/statistics')">
        <text class="quick-icon">📊</text>
        <text class="quick-label">统计报表</text>
      </view>
    </view>

    <!-- ── 底部品牌信息 ── -->
    <view class="footer">
      <text class="footer-text">银发人才平台 · 志愿活动统计</text>
    </view>
  </view>
</template>

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
  margin: 0 var(--space-md, 16px) var(--space-md, 16px);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  display: flex;
  align-items: center;
  gap: var(--space-sm, 12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.module-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: var(--radius-md, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.module-icon {
  font-size: 28px;
}

.module-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.module-name {
  font-size: var(--font-lg, 19px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
}

.module-desc {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
}

.module-arrow {
  font-size: 24px;
  color: var(--color-text-muted, #a0aab5);
  flex-shrink: 0;
}

/* ── 快捷四格 ── */
.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm, 12px);
  padding: 0 var(--space-md, 16px);
}

.quick-item {
  background: #fff;
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs, 8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  min-height: 90px;
  justify-content: center;
}

.quick-icon {
  font-size: 32px;
}

.quick-label {
  font-size: var(--font-base, 17px);
  font-weight: 500;
  color: var(--color-text-main, #1e2a3a);
}

/* ── 底部品牌 ── */
.footer {
  padding: var(--space-lg, 24px) var(--space-md, 16px) 0;
  text-align: center;
}

.footer-text {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
}
</style>
