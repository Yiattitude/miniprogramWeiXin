<template>
  <view class="page">
    <view v-if="loading" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>

    <view v-else>
      <!-- 汇总卡片 -->
      <view class="summary-card">
        <view class="summary-title">📊 整体统计</view>
        <view class="summary-grid">
          <view class="summary-item">
            <text class="summary-num">{{ data.totalActivities ?? 0 }}</text>
            <text class="summary-label">活动总数</text>
          </view>
          <view class="summary-item">
            <text class="summary-num">{{ data.totalSignups ?? 0 }}</text>
            <text class="summary-label">报名总数</text>
          </view>
          <view class="summary-item">
            <text class="summary-num">{{ data.totalCheckins ?? 0 }}</text>
            <text class="summary-label">打卡总数</text>
          </view>
          <view class="summary-item">
            <text class="summary-num">{{ data.totalHours ?? 0 }}</text>
            <text class="summary-label">总服务时长(h)</text>
          </view>
        </view>
      </view>

      <!-- 活动明细列表 -->
      <view class="section-title">各活动明细</view>

      <view v-if="!data.activities || data.activities.length === 0" class="empty">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无活动数据</text>
      </view>

      <view v-else class="table-card">
        <view class="table-header">
          <text class="col-name">活动名称</text>
          <text class="col-num">报名</text>
          <text class="col-num">打卡</text>
          <text class="col-num">时长(h)</text>
        </view>
        <view
          v-for="item in data.activities"
          :key="item._id"
          class="table-row"
        >
          <text class="col-name" :title="item.name">{{ item.name }}</text>
          <text class="col-num">{{ item.signupCount ?? 0 }}</text>
          <text class="col-num">{{ item.checkinCount ?? 0 }}</text>
          <text class="col-num">{{ item.totalHours ?? 0 }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getStatistics } from '../../api/volunteer'

const loading = ref(true)
const data = ref<any>({})

onLoad(async () => {
  try {
    const res = await getStatistics()
    data.value = res ?? {}
  } catch (err: any) {
    uni.showToast({ title: err?.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
})
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding-top: 120rpx;
}

.summary-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.summary-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 28rpx;
}

.summary-grid {
  display: flex;
  flex-wrap: wrap;
}

.summary-item {
  width: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
}

.summary-num {
  font-size: 48rpx;
  font-weight: 700;
  color: #3a7bd5;
}

.summary-label {
  font-size: 24rpx;
  color: #888;
  margin-top: 6rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #555;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.table-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.table-header,
.table-row {
  display: flex;
  align-items: center;
  padding: 24rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.table-header {
  background: #f8f9fa;
  font-size: 24rpx;
  color: #888;
  font-weight: 500;
}

.table-row {
  font-size: 26rpx;
  color: #333;

  &:last-child {
    border-bottom: none;
  }
}

.col-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-num {
  width: 100rpx;
  text-align: center;
  flex-shrink: 0;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;
  gap: 16rpx;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #aaa;
}
</style>
