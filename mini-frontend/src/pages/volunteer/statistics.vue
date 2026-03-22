<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view v-if="loading" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>

    <view v-else>
      <!-- 汇总卡片 -->
      <view class="summary-card">
        <view class="summary-title">📊 个人统计</view>
        <view class="summary-grid">
          <view class="summary-item">
            <text class="summary-num">{{ data.totalPoints ?? 0 }}</text>
            <text class="summary-label">积分总数</text>
          </view>
          <view class="summary-item">
            <text class="summary-num">{{ data.totalCheckins ?? 0 }}</text>
            <text class="summary-label">打卡总数</text>
          </view>
          <view class="summary-item">
            <text class="summary-num">{{ data.totalHonors ?? 0 }}</text>
            <text class="summary-label">荣誉总数</text>
          </view>
        </view>
      </view>

      <!-- 打卡记录 -->
      <view class="section-title">打卡记录</view>

      <view v-if="!data.checkinRecords || data.checkinRecords.length === 0" class="empty">
        <Icon class="empty-icon" name="list-check-line" size="72px" />
        <text class="empty-text">暂无打卡记录</text>
      </view>

      <view v-else class="table-card">
        <view class="table-header">
          <text class="col-name">活动名称</text>
          <text class="col-num">积分</text>
          <text class="col-num">状态</text>
          <text class="col-num">时间</text>
        </view>
        <view
          v-for="item in data.checkinRecords"
          :key="item._id || item.id"
          class="table-row"
        >
          <text class="col-name" :title="item.activityName">{{ item.activityName }}</text>
          <text class="col-num">{{ item.points ?? item.declaredPoints ?? 0 }}</text>
          <text class="col-num">{{ statusText(item.status) }}</text>
          <text class="col-num">{{ formatShortDate(item.checkedAt) }}</text>
        </view>
      </view>

      <!-- 荣誉提交记录 -->
      <view class="section-title" style="margin-top: 18px;">荣誉提交记录</view>

      <view v-if="!data.honorRecords || data.honorRecords.length === 0" class="empty">
        <Icon class="empty-icon" name="medal-line" size="72px" />
        <text class="empty-text">暂无荣誉提交记录</text>
      </view>

      <view v-else class="table-card">
        <view class="table-header">
          <text class="col-name">荣誉类型</text>
          <text class="col-num">积分</text>
          <text class="col-num">状态</text>
          <text class="col-num">时间</text>
        </view>
        <view
          v-for="item in data.honorRecords"
          :key="item.id || item._id"
          class="table-row"
        >
          <text class="col-name" :title="item.honorLevel">{{ item.honorLevel }}</text>
          <text class="col-num">{{ item.honorPoints ?? 0 }}</text>
          <text class="col-num">{{ statusText(item.status) }}</text>
          <text class="col-num">{{ formatShortDate(item.createdAt) }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
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

function statusText(status: string) {
  if (status === 'approved') return '已通过'
  if (status === 'rejected') return '已驳回'
  return '审核中'
}

function formatShortDate(value: string) {
  if (!value) return ''
  return value.slice(0, 10)
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding: 16px;
  padding-bottom: 44px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding-top: 100px;
}

.summary-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 12px 24px rgba(29, 55, 107, 0.1);
  animation: riseIn 0.45s ease-out both;
}

.summary-title {
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 18px;
  letter-spacing: 0.5px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 18px 0;
  position: relative;
}

.summary-num {
  font-size: 36px;
  font-weight: 700;
  color: #2f62c6;
  line-height: 1;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 13px;
  color: #7a8797;
  font-weight: 500;
}


.section-title {
  font-size: 17px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 12px;
  padding-left: 4px;
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.1s;
}

.table-card {
  background: #fff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(20, 28, 46, 0.08);
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.15s;
}

.table-header,
.table-row {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f5;
}

.table-header {
  background: linear-gradient(135deg, #f7f9fc 0%, #eef3fc 100%);
  font-size: 13px;
  color: #7a8797;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.table-row {
  font-size: 14px;
  color: #1c2431;
  transition: background 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: #f7f9fc;
  }
}

.col-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.col-num {
  width: 60px;
  text-align: center;
  flex-shrink: 0;
  font-weight: 600;
  color: #2f62c6;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  gap: 14px;
  animation: fadeIn 0.5s ease-out both;
}

.empty-icon {
  font-size: 72px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #7a8797;
  font-weight: 500;
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

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
