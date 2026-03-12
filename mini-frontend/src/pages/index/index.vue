<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="banner">
      <view class="banner-left">
        <image class="avatar" :src="userStore.userInfo?.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="user-info">
          <text class="welcome">{{ userStore.userInfo ? '你好，' + userStore.userInfo.nickName : '欢迎使用' }}</text>
          <text class="unit">{{ userStore.userInfo?.unit || '银发人才平台' }}</text>
        </view>
      </view>
      <view class="banner-logo-text">志愿</view>
    </view>

    <view v-if="userStore.isLoggedIn && userStore.userInfo" class="stat-card">
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalHours || 0 }}</text>
        <text class="stat-label">服务时长(h)</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalCount || 0 }}</text>
        <text class="stat-label">参与活动</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo.totalServed || 0 }}</text>
        <text class="stat-label">服务人次</text>
      </view>
    </view>

    <view class="section">
      <text class="section-title">功能模块</text>
      <view class="module-card module-primary" @tap="goVolunteer">
        <view class="module-icon-wrap">
          <Icon class="module-icon" name="hand-heart-line" size="28px" />
        </view>
        <view class="module-info">
          <text class="module-name">志愿活动</text>
          <text class="module-desc">报名参加、打卡记录、统计报表</text>
        </view>
        <Icon class="module-arrow" name="arrow-right-line" size="24px" />
      </view>
    </view>

    <view class="section">
      <text class="section-title">快捷入口</text>
      <view class="quick-grid">
        <view class="quick-item" @tap="goPage('/pages/volunteer/signup-list')">
          <view class="quick-icon-wrap quick-icon-1">
            <Icon class="quick-icon" name="edit-2-line" size="26px" />
          </view>
          <view class="quick-text">
            <text class="quick-label">活动报名</text>
            <text class="quick-desc">浏览并报名志愿活动</text>
          </view>
        </view>
        <view class="quick-item" @tap="goPage('/pages/volunteer/checkin-list')">
          <view class="quick-icon-wrap quick-icon-2">
            <Icon class="quick-icon" name="checkbox-line" size="26px" />
          </view>
          <view class="quick-text">
            <text class="quick-label">志愿打卡</text>
            <text class="quick-desc">已报名活动打卡记录</text>
          </view>
        </view>
        <view class="quick-item" @tap="goPage('/pages/volunteer/record')">
          <view class="quick-icon-wrap quick-icon-3">
            <Icon class="quick-icon" name="list-check-line" size="26px" />
          </view>
          <view class="quick-text">
            <text class="quick-label">打卡记录</text>
            <text class="quick-desc">查看历史打卡记录</text>
          </view>
        </view>
        <view class="quick-item" @tap="goPage('/pages/volunteer/statistics')">
          <view class="quick-icon-wrap quick-icon-4">
            <Icon class="quick-icon" name="chart-bar-line" size="26px" />
          </view>
          <view class="quick-text">
            <text class="quick-label">统计报表</text>
            <text class="quick-desc">查看个人服务统计</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Icon from '@/components/common/Icon.vue'
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
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding: 16px 16px 44px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #132b63 0%, #1f4696 45%, #2d61bf 100%);
  box-shadow: 0 14px 28px rgba(18, 44, 99, 0.28);
  overflow: hidden;
  animation: riseIn 0.45s ease-out both;
}

.banner::after {
  content: '';
  position: absolute;
  right: -40px;
  top: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: 14px;
  z-index: 1;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.16);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.welcome {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.unit {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.banner-logo-text {
  z-index: 1;
  padding: 6px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9a2f 0%, #ff7d1a 100%);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 6px 16px rgba(255, 125, 26, 0.4);
}

.stat-card {
  background: #fff;
  margin-top: 16px;
  border-radius: 18px;
  padding: 16px 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 8px 18px rgba(29, 55, 107, 0.08);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.05s;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-num {
  font-size: 22px;
  font-weight: 700;
  color: #1f4ea3;
}

.stat-label {
  font-size: 12px;
  color: #7a8797;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: #e6ebf2;
  flex-shrink: 0;
}

.section {
  margin-top: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 12px;
}

.module-card {
  display: flex;
  align-items: center;
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 12px 24px rgba(25, 52, 110, 0.2);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.1s;
}

.module-primary {
  background: linear-gradient(135deg, #2f62c6 0%, #3e7ae4 100%);
}

.module-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.18);
  border: 2px solid rgba(255, 255, 255, 0.4);
  margin-right: 12px;
}

.module-icon {
  font-size: 28px;
}

.module-info {
  flex: 1;
}

.module-name {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}

.module-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
}

.module-arrow {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin-left: 6px;
}

.quick-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.quick-item {
  background: #fff;
  border-radius: 18px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 20px rgba(20, 28, 46, 0.08);
  animation: riseIn 0.5s ease-out both;
}

.quick-item:nth-child(1) { animation-delay: 0.12s; }
.quick-item:nth-child(2) { animation-delay: 0.16s; }
.quick-item:nth-child(3) { animation-delay: 0.2s; }
.quick-item:nth-child(4) { animation-delay: 0.24s; }

.quick-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.quick-icon-1 {
  background: linear-gradient(135deg, #ffe1dd 0%, #ffd1cc 100%);
}

.quick-icon-2 {
  background: linear-gradient(135deg, #d7f6e6 0%, #bff0d8 100%);
}

.quick-icon-3 {
  background: linear-gradient(135deg, #ffe9c4 0%, #ffdba6 100%);
}

.quick-icon-4 {
  background: linear-gradient(135deg, #f7e0ff 0%, #e7c8ff 100%);
}

.quick-icon {
  font-size: 26px;
}

.quick-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.quick-label {
  font-size: 16px;
  font-weight: 600;
  color: #1c2431;
}

.quick-desc {
  font-size: 13px;
  color: #7a8797;
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
</style>
