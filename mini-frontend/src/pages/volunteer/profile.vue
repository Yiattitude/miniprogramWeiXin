<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="profile-header">
      <image class="avatar" :src="avatar" mode="aspectFill" />
      <view class="user-info">
        <text class="nickname">{{ nickname }}</text>
        <view class="role-badge" :class="isAdmin ? 'role-admin' : 'role-user'">
          {{ isAdmin ? '管理员' : '志愿者' }}
        </view>
      </view>
    </view>

    <view class="stat-card">
      <view class="stat-item">
        <text class="stat-num">{{ stats.totalActivities }}</text>
        <text class="stat-label">参与活动</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ stats.totalHours }}</text>
        <text class="stat-label">服务时长(h)</text>
      </view>
      <view class="stat-divider" />
      <view class="stat-item">
        <text class="stat-num">{{ stats.totalCount }}</text>
        <text class="stat-label">服务人次</text>
      </view>
    </view>

    <view class="menu-card">
      <view class="menu-item" @tap="navTo('/pages/volunteer/record')">
        <Icon class="menu-icon" name="list-check-line" size="36rpx" />
        <text class="menu-text">我的打卡记录</text>
        <Icon class="menu-arrow" name="arrow-right-line" size="36rpx" />
      </view>
      <view class="menu-item" @tap="navTo('/pages/volunteer/checkin-list')">
        <Icon class="menu-icon" name="checkbox-line" size="36rpx" />
        <text class="menu-text">待打卡活动</text>
        <Icon class="menu-arrow" name="arrow-right-line" size="36rpx" />
      </view>
      <view v-if="isAdmin" class="menu-item" @tap="navTo('/pages/volunteer/statistics')">
        <Icon class="menu-icon" name="chart-bar-line" size="36rpx" />
        <text class="menu-text">统计报表</text>
        <Icon class="menu-arrow" name="arrow-right-line" size="36rpx" />
      </view>
    </view>

    <view class="menu-card" style="margin-top: 24rpx;">
      <view class="menu-item logout-item" @tap="onLogout">
        <Icon class="menu-icon" name="share-forward-line" size="36rpx" />
        <text class="menu-text logout-text">退出登录</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../stores/user'
import { getStatistics } from '../../api/volunteer'

const userStore = useUserStore()
const isAdmin = computed(() => userStore.isAdmin)
const nickname = computed(() => userStore.userInfo?.nickName || '志愿者')
const avatar = computed(
  () => userStore.userInfo?.avatarUrl || '/static/default-avatar.png'
)

const stats = ref({ totalActivities: 0, totalHours: 0, totalCount: 0 })

onShow(async () => {
  try {
    const data = await getStatistics()
    if (data) {
      stats.value.totalActivities = (data as any).totalActivities ?? 0
      stats.value.totalHours = (data as any).totalHours ?? 0
      stats.value.totalCount = (data as any).totalCount ?? 0
    }
  } catch {
    // 非管理员可能无权限，静默忽略
  }
})

function navTo(url: string) {
  uni.navigateTo({ url })
}

function onLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success(res) {
      if (res.confirm) {
        // Use store logout to clear token + cached user info.
        userStore.logout()
        // 小程序端更稳定的方式：跳转到登录页，登录成功后再回到当前 tab。
        uni.redirectTo({
          url: `/pages/auth/login?redirect=${encodeURIComponent('/pages/index/index')}`,
        })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.page {
  padding: 32rpx 24rpx;
}

.profile-header {
  display: flex;
  align-items: center;
  background: #fff;
  border-radius: 16rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: #e0e7ef;
  margin-right: 32rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #222;
}

.role-badge {
  display: inline-block;
  font-size: 22rpx;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
}

.role-admin {
  background: #fff3e0;
  color: #e65100;
}

.role-user {
  background: #e8f4fd;
  color: #1565c0;
}

.stat-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx 0;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stat-num {
  font-size: 44rpx;
  font-weight: 700;
  color: #3a7bd5;
}

.stat-label {
  font-size: 24rpx;
  color: #888;
}

.stat-divider {
  width: 1rpx;
  background: #eee;
  margin: 8rpx 0;
}

.menu-card {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 36rpx 32rpx;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.menu-icon {
  font-size: 36rpx;
  margin-right: 24rpx;
}

.menu-text {
  flex: 1;
  font-size: 30rpx;
  color: #333;
}

.menu-arrow {
  font-size: 36rpx;
  color: #ccc;
}

.logout-text {
  color: #e53935;
}
</style>
