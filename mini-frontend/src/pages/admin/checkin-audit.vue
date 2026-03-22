<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="tabs-wrap">
      <view class="custom-tabs">
        <view 
          v-for="(tab, index) in tabList" 
          :key="tab.value" 
          class="custom-tab" 
          :class="{ 'custom-tab-active': currentTab === index }"
          @tap="onTabChange({ index: index, name: tab.name, value: tab.value })"
        >
          {{ tab.name }}
          <view class="custom-tab-line" v-if="currentTab === index"></view>
        </view>
      </view>
    </view>

    <view class="stat-bar">
      <text class="stat-bar-text">共 {{ total }} 条打卡记录</text>
    </view>

    <view v-if="loading && list.length === 0" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>

    <scroll-view v-else scroll-y class="scroll-wrap" @scrolltolower="loadMore">
      <view v-if="list.length === 0 && !loading" class="empty">
        <Icon class="empty-icon" name="file-text-line" size="72px" />
        <text class="empty-text">暂无相关记录</text>
      </view>

      <view v-else class="list-wrap">
        <view v-for="(item, index) in list" :key="item._id" class="record-card">
          <view class="card-head">
            <view class="user-wrap">
              <Icon name="user-3-line" size="20px" style="margin-right: 6px; color:#3a7bd5;" />
              <text class="user-name">{{ item.realName || '未知用户' }}</text>
              <text class="user-phone">{{ item.phone }}</text>
            </view>
            <view class="status-badge" :style="{ color: statusInfo(item.status).color, background: statusInfo(item.status).bg }">
              {{ statusInfo(item.status).text }}
            </view>
          </view>

          <view class="activity-name">{{ item.activityName }}</view>

          <view class="card-row">
            <Icon class="row-icon" name="star-line" size="16px" />
            <text class="row-text">活动类型: {{ item.activityCategory || '未分类' }}</text>
          </view>
          
          <view class="card-row">
            <Icon class="row-icon" name="coin-2-line" size="16px" />
            <text class="row-text" style="color:#e74c3c;font-weight:bold;">申报积分: {{ item.declaredPoints }} 分</text>
          </view>

          <!-- 审批操作区 -->
          <view class="action-footer">
            <view class="action-btn btn-detail" @tap="showDetail(item, index)">查看详情</view>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-wrap">
        <uv-loading-icon size="28" />
      </view>
      <view v-else-if="finished && list.length > 0" class="no-more">已显示全部记录</view>
    </scroll-view>

    <!-- 详情弹窗原生实现 -->
    <view class="native-popup-mask" v-if="isDetailOpen" @tap="closeDetail">
      <view class="native-popup-content" @tap.stop>
        <view class="popup-header">
          <text class="popup-title">打卡详情</text>
          <Icon name="close-line" size="24px" color="#999" @tap="closeDetail" />
        </view>
        <scroll-view scroll-y class="popup-scroll">
          <view v-if="currentDetail">
            <view class="detail-item">
              <text class="detail-label">申请人：</text>
              <text class="detail-value">{{ currentDetail.realName }} ({{ currentDetail.phone }})</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">活动名称：</text>
              <text class="detail-value">{{ currentDetail.activityName }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">活动类型：</text>
              <text class="detail-value">{{ currentDetail.activityCategory || '未分类' }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">申报积分：</text>
              <text class="detail-value" style="color:#e74c3c;font-weight:bold;">{{ currentDetail.declaredPoints }} 分</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">打卡时间：</text>
              <text class="detail-value">{{ formatCheckedAt(currentDetail.checkedAt) }}</text>
            </view>
            <view class="detail-item" v-if="currentDetail.remark">
              <text class="detail-label">用户备注：</text>
              <text class="detail-value remark-text">{{ currentDetail.remark }}</text>
            </view>
            <view class="detail-item" v-if="currentDetail.rejectReason">
              <text class="detail-label" style="color: #e74c3c;">驳回原因：</text>
              <text class="detail-value" style="color: #c0392b;">{{ currentDetail.rejectReason }}</text>
            </view>
            
            <view class="detail-item" v-if="currentDetail.photos && currentDetail.photos.length > 0">
              <text class="detail-label">现场照片：</text>
              <view class="photos-wrap">
                <image 
                  v-for="(url, idx) in currentDetail.photos" 
                  :key="idx" 
                  :src="url" 
                  mode="aspectFill" 
                  class="photo-item"
                  @tap="previewPhoto(currentDetail.photos, idx)"
                />
              </view>
            </view>

            <!-- 审批操作区 -->
            <view v-if="currentDetail.status === 'pending'" class="action-footer">
              <view class="action-btn btn-reject" @tap="onReject(currentDetail, currentDetailIndex)">驳回</view>
              <view class="action-btn btn-approve" @tap="onApprove(currentDetail, currentDetailIndex)">通过</view>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { formatDateTime } from '@/utils/format'
import { getAdminCheckins, auditCheckin } from '@/api/admin'
import type { AdminCheckinRecord } from '@/api/admin'

const loading = ref(false)
const page = ref(1)
const finished = ref(false)
const list = ref<AdminCheckinRecord[]>([])
const total = ref(0)
const PAGE_SIZE = 10

const isDetailOpen = ref(false)
const currentDetail = ref<AdminCheckinRecord | null>(null)
const currentDetailIndex = ref<number>(-1)

const tabList = [
  { name: '待审核', value: 'pending' },
  { name: '已通过', value: 'approved' },
  { name: '已驳回', value: 'rejected' }
]
const currentTab = ref(0)
const currentStatus = ref('pending')

const STATUS_MAP = {
  pending: { text: '待审核', color: '#e67e22', bg: '#fff3e0' },
  approved: { text: '已通过', color: '#27ae60', bg: '#e6f9f0' },
  rejected: { text: '已驳回', color: '#e74c3c', bg: '#fde8e8' }
}

function statusInfo(status: string) {
  return STATUS_MAP[status as keyof typeof STATUS_MAP] || { text: status, color: '#a0aab5', bg: '#f0f2f4' }
}

function onTabChange(e: { index: number; name: string; value: string }) {
  currentTab.value = e.index
  currentStatus.value = tabList[e.index].value
  loadFirst()
}

function formatCheckedAt(value: string | number | Date) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return formatDateTime(date)
}

onLoad(() => loadFirst())

onPullDownRefresh(async () => {
  await loadFirst()
  uni.stopPullDownRefresh()
})

async function loadFirst() {
  page.value = 1
  finished.value = false
  list.value = []
  await loadMore()
}

async function loadMore() {
  if (loading.value || finished.value) return
  loading.value = true
  try {
    const result = await getAdminCheckins({ page: page.value, pageSize: PAGE_SIZE, status: currentStatus.value })
    if (result.code === 0 && result.data) {
      list.value = page.value === 1 ? result.data.list : [...list.value, ...result.data.list]
      total.value = result.data.total
      if (list.value.length >= result.data.total) {
        finished.value = true
      } else {
        page.value++
      }
    }
  } catch (err) {
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function previewPhoto(photos: string[], index: number) {
  uni.previewImage({
    urls: photos,
    current: photos[index]
  })
}

function showDetail(item: AdminCheckinRecord, index: number) {
  currentDetail.value = item
  currentDetailIndex.value = index
  isDetailOpen.value = true
}

function closeDetail() {
  isDetailOpen.value = false
  setTimeout(() => {
    currentDetail.value = null
    currentDetailIndex.value = -1
  }, 300)
}

function onApprove(item: AdminCheckinRecord, index: number) {
  uni.showModal({
    title: '确认通过',
    content: `确定通过 ${item.realName} 的 ${item.declaredPoints} 积分申报吗？核实无误后将自动发放积分。`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '处理中' })
        try {
          const resp = await auditCheckin({ recordId: item._id, pass: true })
          if (resp.code === 0) {
            uni.showToast({ title: '已通过' })
            closeDetail()
            list.value.splice(index, 1)
            total.value--
          }
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

function onReject(item: AdminCheckinRecord, index: number) {
  uni.showModal({
    title: '驳回审核',
    content: '请输入驳回理由：',
    editable: true,
    placeholderText: '例如：照片不清晰/未按要求打卡',
    success: async (res) => {
      if (res.confirm) {
        if (!res.content) {
          uni.showToast({ title: '必须填写驳回理由', icon: 'none' })
          return
        }
        uni.showLoading({ title: '处理中' })
        try {
          const resp = await auditCheckin({ recordId: item._id, pass: false, rejectReason: res.content })
          if (resp.code === 0) {
            uni.showToast({ title: '已驳回' })
            closeDetail()
            list.value.splice(index, 1)
            total.value--
          }
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  display: flex;
  flex-direction: column;
}

.tabs-wrap {
  background: #fff;
  border-bottom: 1rpx solid #eee;
}

.stat-bar {
  background: linear-gradient(135deg, #eef6ff 0%, #e0efff 100%);
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(47, 98, 198, 0.08);
}

.stat-bar-text {
  font-size: 14px;
  color: #2f62c6;
  font-weight: 700;
}

.scroll-wrap {
  flex: 1;
  height: 0;
  min-height: calc(100vh - 88px);
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

.list-wrap {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.record-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 20px rgba(20, 28, 46, 0.08);
  animation: riseIn 0.45s ease-out both;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.user-wrap {
  display: flex;
  align-items: center;
}

.user-name {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-right: 8px;
}

.user-phone {
  font-size: 14px;
  color: #7a8797;
}

.status-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
}

.activity-name {
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 10px;
}

.card-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.row-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.row-text {
  font-size: 14px;
  color: #7a8797;
}

.metrics-row {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f7f9fc 0%, #eef3fc 100%);
  border-radius: 14px;
  padding: 16px 0;
  margin: 14px 0;
}

.metric-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.metric-num {
  font-size: 24px;
  font-weight: 700;
  color: #2f62c6;
}

.metric-label {
  font-size: 12px;
  color: #7a8797;
}

.metric-divider {
  width: 1px;
  height: 32px;
  background: #e6ebf2;
}

.remark-row {
  display: flex;
  margin-top: 12px;
  background: linear-gradient(135deg, #fffcf5 0%, #fff9eb 100%);
  padding: 12px;
  border-radius: 10px;
}
.reason-row {
  background: #fdf2f1;
}

.remark-label {
  font-size: 13px;
  color: #a0aab5;
  flex-shrink: 0;
  font-weight: 600;
}

.remark-text {
  font-size: 14px;
  color: #6b7b8d;
  line-height: 1.6;
}

.photos-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.photo-item {
  width: calc((100% - 20px) / 3);
  height: 90px;
  border-radius: 10px;
  background: #f7f9fc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1rpx dashed #eee;
}

.action-btn {
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}

.btn-reject {
  color: #e74c3c;
  background: #fde8e8;
}

.btn-approve {
  color: #fff;
  background: #3a7bd5;
  box-shadow: 0 4px 10px rgba(58, 123, 213, 0.3);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 16px;
  gap: 14px;
}

.empty-icon {
  font-size: 72px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  font-weight: 700;
  color: #7a8797;
}

.no-more {
  text-align: center;
  padding: 24px 0;
  font-size: 13px;
  color: #a0aab5;
}

.btn-detail {
  color: #3a7bd5;
  background: #eef6ff;
}

/* 原生弹窗与自定义 Tabs 样式 */
.custom-tabs {
  display: flex;
  height: 44px;
  background: #fff;
  align-items: center;
  justify-content: space-around;
}

.custom-tab {
  position: relative;
  font-size: 14px;
  color: #666;
  padding: 10px 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.custom-tab-active {
  color: #3a7bd5;
  font-weight: 700;
}

.custom-tab-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #3a7bd5;
  border-radius: 2px;
}

.native-popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.native-popup-content {
  background: #fff;
  border-radius: 20px 20px 0 0;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  max-height: 80vh;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 16px;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.popup-scroll {
  flex: 1;
  padding: 20px;
  max-height: calc(80vh - 60px);
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  line-height: 1.5;
}

.detail-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  color: #7a8797;
}

.detail-value {
  flex: 1;
  font-size: 14px;
  color: #333;
  word-break: break-all;
}

@keyframes riseIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
