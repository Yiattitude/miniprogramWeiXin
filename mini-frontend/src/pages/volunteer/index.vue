<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="header">
      <text class="header-title">志愿活动</text>
      <text class="header-sub">参与志愿服务，传递银发力量</text>
    </view>

    <view class="grid">
      <view class="grid-item" @tap="goPage('/pages/volunteer/signup-list')">
        <view class="grid-icon-wrap" style="background: linear-gradient(135deg, #ffe1dd 0%, #ffd1cc 100%)">
          <Icon class="grid-icon" name="edit-2-line" size="26px" />
        </view>
        <view class="grid-text">
          <text class="grid-label">活动报名</text>
          <text class="grid-desc">浏览并报名志愿活动</text>
        </view>
      </view>

      <view class="grid-item" @tap="goPage('/pages/volunteer/checkin-list')">
        <view class="grid-icon-wrap" style="background: linear-gradient(135deg, #d7f6e6 0%, #bff0d8 100%)">
          <Icon class="grid-icon" name="checkbox-line" size="26px" />
        </view>
        <view class="grid-text">
          <text class="grid-label">志愿打卡</text>
          <text class="grid-desc">已报名活动打卡记录</text>
        </view>
      </view>

      <view v-if="userStore.isAdmin" class="grid-item" @tap="goPage('/pages/volunteer/publish')">
        <view class="grid-icon-wrap" style="background: linear-gradient(135deg, #ffe9c4 0%, #ffdba6 100%)">
          <Icon class="grid-icon" name="add-circle-line" size="26px" />
        </view>
        <view class="grid-text">
          <text class="grid-label">发布活动</text>
          <text class="grid-desc">创建新的志愿活动</text>
        </view>
      </view>

      <view class="grid-item" @tap="goPage('/pages/volunteer/record')">
        <view class="grid-icon-wrap" style="background: linear-gradient(135deg, #f7e0ff 0%, #e7c8ff 100%)">
          <Icon class="grid-icon" name="list-check-line" size="26px" />
        </view>
        <view class="grid-text">
          <text class="grid-label">打卡记录</text>
          <text class="grid-desc">查看历史打卡记录</text>
        </view>
      </view>

      <view class="grid-item" @tap="goPage('/pages/volunteer/statistics')">
        <view class="grid-icon-wrap" style="background: linear-gradient(135deg, #d4e9fc 0%, #c0dffe 100%)">
          <Icon class="grid-icon" name="chart-bar-line" size="26px" />
        </view>
        <view class="grid-text">
          <text class="grid-label">统计报表</text>
          <text class="grid-desc">个人与团队统计汇总</text>
        </view>
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
import Icon from '@/components/common/Icon.vue'

const userStore = useUserStore()

function goPage(path: string) {
  uni.navigateTo({ url: path })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding-bottom: 44px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 顶部标题栏 */
.header {
  position: relative;
  background: linear-gradient(135deg, #2f62c6 0%, #3e7ae4 100%);
  padding: 36px 16px 32px;
  box-shadow: 0 8px 24px rgba(25, 52, 110, 0.18);
  overflow: hidden;
}

.header::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -30px;
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
}

.header-title {
  position: relative;
  z-index: 1;
  display: block;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.header-sub {
  position: relative;
  z-index: 1;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.88);
}

/* 功能卡片网格 */
.grid {
  display: flex;
  flex-direction: column;
  padding: 16px;
  gap: 14px;
  margin-top: -20px;
}

.grid-item {
  width: 100%;
  background: #fff;
  border-radius: 18px;
  padding: 18px 16px;
  box-shadow: 0 10px 20px rgba(20, 28, 46, 0.08);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  animation: riseIn 0.5s ease-out both;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.grid-item:nth-child(1) { animation-delay: 0.05s; }
.grid-item:nth-child(2) { animation-delay: 0.1s; }
.grid-item:nth-child(3) { animation-delay: 0.15s; }
.grid-item:nth-child(4) { animation-delay: 0.2s; }
.grid-item:nth-child(5) { animation-delay: 0.25s; }

.grid-item:active {
  transform: scale(0.98);
}

.grid-icon-wrap {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.6);
}

.grid-icon {
  font-size: 26px;
}

.grid-label {
  font-size: 16px;
  font-weight: 600;
  color: #1c2431;
  line-height: 1.3;
}

.grid-desc {
  font-size: 13px;
  color: #7a8797;
  margin-top: 4px;
  line-height: 1.4;
}

.grid-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 个人统计卡片 */
.summary-card {
  background: #fff;
  margin: 0 16px;
  border-radius: 18px;
  padding: 16px 12px;
  box-shadow: 0 12px 24px rgba(29, 55, 107, 0.1);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.3s;
}

.summary-title {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 16px;
  padding: 0 8px;
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
  font-size: 22px;
  font-weight: 700;
  color: #2f62c6;
}

.summary-label {
  font-size: 12px;
  color: #7a8797;
}

.summary-divider {
  width: 1px;
  height: 32px;
  background: #e6ebf2;
  flex-shrink: 0;
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
