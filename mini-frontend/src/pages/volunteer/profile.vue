<script setup lang="ts">
/**
 * @page volunteer/profile
 * @description 个人主页：头像/单位、三格汇总统计、菜单跳转入口
 * @phase Phase 4 - 4-3
 */
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const refreshing = ref(false)

// 每次页面显示时刷新用户信息（含统计）
onShow(async () => {
  if (userStore.isLoggedIn) {
    await userStore.fetchProfile()
  }
})

async function handleRefresh() {
  refreshing.value = true
  try {
    await userStore.fetchProfile()
  } finally {
    refreshing.value = false
    uni.stopPullDownRefresh()
  }
}

onPullDownRefresh(() => {
  handleRefresh()
})

/** 跳转页面 */
function goPage(url: string) {
  uni.navigateTo({ url })
}

/** 退出登录 */
function handleLogout() {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出当前账号吗？',
    confirmText: '退出',
    confirmColor: '#e74c3c',
    success(res) {
      if (res.confirm) {
        userStore.logout()
      }
    },
  })
}
</script>

<template>
  <view class="page">
    <!-- ── 头部用户信息 ── -->
    <view class="profile-header">
      <image
        class="avatar"
        :src="userStore.userInfo?.avatar || '/static/default-avatar.png'"
        mode="aspectFill"
      />
      <view class="user-meta">
        <text class="nickname">{{ userStore.userInfo?.nickname || '银发人才' }}</text>
        <view class="unit-row">
          <text class="unit-icon">🏢</text>
          <text class="unit-text">{{ userStore.userInfo?.unit || '暂未设置单位' }}</text>
        </view>
        <view
          :class="['role-badge', userStore.isAdmin ? 'role-admin' : 'role-member']"
        >
          {{ userStore.isAdmin ? '管理员' : '志愿者' }}
        </view>
      </view>
    </view>

    <!-- ── 三格汇总统计 ── -->
    <view class="stat-card">
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo?.totalHours ?? 0 }}</text>
        <text class="stat-label">志愿时长(h)</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo?.totalCount ?? 0 }}</text>
        <text class="stat-label">参与次数</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ userStore.userInfo?.totalServed ?? 0 }}</text>
        <text class="stat-label">服务人次</text>
      </view>
    </view>

    <!-- ── 功能菜单 ── -->
    <view class="menu-section">
      <view class="section-title">我的功能</view>
      <view class="menu-card">
        <!-- 打卡记录 -->
        <view class="menu-item" @click="goPage('/pages/volunteer/record')">
          <view class="menu-icon-wrap" style="background: #e6f9f0;">
            <text class="menu-icon">📋</text>
          </view>
          <text class="menu-label">打卡记录</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-divider" />

        <!-- 统计报表 -->
        <view class="menu-item" @click="goPage('/pages/volunteer/statistics')">
          <view class="menu-icon-wrap" style="background: #eef3fc;">
            <text class="menu-icon">📊</text>
          </view>
          <text class="menu-label">统计报表</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-divider" />

        <!-- 已报名活动 -->
        <view class="menu-item" @click="goPage('/pages/volunteer/checkin-list')">
          <view class="menu-icon-wrap" style="background: #fff3e0;">
            <text class="menu-icon">✅</text>
          </view>
          <text class="menu-label">我的报名</text>
          <text class="menu-arrow">›</text>
        </view>
        <view class="menu-divider" />

        <!-- 活动报名 -->
        <view class="menu-item" @click="goPage('/pages/volunteer/signup-list')">
          <view class="menu-icon-wrap" style="background: #fde8e8;">
            <text class="menu-icon">📝</text>
          </view>
          <text class="menu-label">浏览活动</text>
          <text class="menu-arrow">›</text>
        </view>

        <!-- 发布活动（仅管理员） -->
        <template v-if="userStore.isAdmin">
          <view class="menu-divider" />
          <view class="menu-item" @click="goPage('/pages/volunteer/publish')">
            <view class="menu-icon-wrap" style="background: #fff3cd;">
              <text class="menu-icon">📢</text>
            </view>
            <text class="menu-label">发布活动</text>
            <view class="admin-tag">管理员</view>
            <text class="menu-arrow">›</text>
          </view>
        </template>
      </view>
    </view>

    <!-- ── 退出登录 ── -->
    <view class="logout-wrap">
      <view class="btn-logout" @click="handleLogout">退出登录</view>
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

/* 头部 */
.profile-header {
  background: linear-gradient(135deg, #3a7bd5 0%, #2a5caa 100%);
  padding: 40px var(--space-md, 16px) 60px;
  display: flex;
  align-items: center;
  gap: var(--space-md, 16px);
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.user-meta {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nickname {
  font-size: var(--font-xl, 22px);
  font-weight: 700;
  color: #fff;
}

.unit-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.unit-icon { font-size: 15px; }
.unit-text {
  font-size: var(--font-sm, 15px);
  color: rgba(255, 255, 255, 0.85);
}

.role-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: var(--font-xs, 13px);
  font-weight: 600;
  width: fit-content;

  &.role-admin {
    background: #ffc107;
    color: #856404;
  }
  &.role-member {
    background: rgba(255, 255, 255, 0.25);
    color: #fff;
  }
}

/* 统计卡片 */
.stat-card {
  background: #fff;
  margin: -36px var(--space-md, 16px) var(--space-md, 16px);
  border-radius: var(--radius-lg, 16px);
  padding: var(--space-md, 16px);
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(58, 123, 213, 0.15);
  position: relative;
  z-index: 1;
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
  height: 40px;
  background: var(--color-border, #e2e7ec);
  flex-shrink: 0;
}

/* 功能菜单 */
.menu-section {
  margin: 0 var(--space-md, 16px) var(--space-md, 16px);
}
.section-title {
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  padding: var(--space-sm, 12px) 0 var(--space-xs, 8px);
}

.menu-card {
  background: #fff;
  border-radius: var(--radius-md, 10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 12px);
  padding: var(--space-md, 16px);
  min-height: var(--tap-min-size, 44px);
}

.menu-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.menu-icon { font-size: 24px; }

.menu-label {
  flex: 1;
  font-size: var(--font-base, 17px);
  color: var(--color-text-main, #1e2a3a);
  font-weight: 500;
}

.admin-tag {
  background: #fff3cd;
  color: #856404;
  font-size: var(--font-xs, 13px);
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  margin-right: 4px;
}

.menu-arrow {
  font-size: 22px;
  color: var(--color-text-muted, #a0aab5);
  flex-shrink: 0;
}

.menu-divider {
  height: 1px;
  background: var(--color-border, #e2e7ec);
  margin: 0 var(--space-md, 16px);
}

/* 退出登录 */
.logout-wrap {
  padding: var(--space-md, 16px);
}
.btn-logout {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  font-size: var(--font-base, 17px);
  font-weight: 600;
}

/* 底部 */
.footer {
  padding: 0 var(--space-md, 16px) 0;
  text-align: center;
}
.footer-text {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
}
</style>
