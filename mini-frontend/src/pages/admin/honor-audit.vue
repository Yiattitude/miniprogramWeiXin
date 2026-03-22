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
          @tap="onTabChange({ index: index, value: tab.value })"
        >
          {{ tab.name }}
          <view class="custom-tab-line" v-if="currentTab === index"></view>
        </view>
      </view>
    </view>

    <view class="stat-bar">
      <text class="stat-bar-text">共 {{ total }} 条荣誉记录</text>
    </view>

    <view v-if="loading && list.length === 0" class="loading-wrap">
      <uv-loading-icon size="36" />
    </view>

    <scroll-view v-else scroll-y class="scroll-wrap" @scrolltolower="loadMore">
      <view v-if="list.length === 0 && !loading" class="empty">
        <Icon class="empty-icon" name="medal-line" size="72px" />
        <text class="empty-text">暂无荣誉记录</text>
      </view>

      <view v-else class="list-wrap">
        <view v-for="(item, index) in list" :key="item.id || (item as any)._id" class="honor-card">
          <view class="card-head">
            <view class="user-wrap">
              <Icon name="user-3-line" size="20px" style="margin-right: 6px; color:#3a7bd5;" />
              <text class="user-name">{{ displayName(item) }}</text>
              <text class="user-phone">{{ displayPhone(item) }}</text>
            </view>
            <view class="status-badge" :style="{ color: statusInfo(item.status).color, background: statusInfo(item.status).bg }">
              {{ statusInfo(item.status).text }}
            </view>
          </view>

          <view class="card-row">
            <Icon class="row-icon" name="medal-line" size="16px" />
            <text class="row-text">荣誉类型: {{ displayHonor(item) }}</text>
          </view>

          <view class="card-row">
            <Icon class="row-icon" name="coin-2-line" size="16px" />
            <text class="row-text" style="color:#e74c3c;font-weight:bold;">对应积分: {{ displayPoints(item) }} 分</text>
          </view>

          <view class="card-row">
            <Icon class="row-icon" name="time-line" size="16px" />
            <text class="row-text">提交时间: {{ formatCreatedAt(item.createdAt) }}</text>
          </view>

          <view v-if="item.rejectReason" class="reject-row">
            <text class="reject-label">驳回原因：</text>
            <text class="reject-text">{{ item.rejectReason }}</text>
          </view>

          <view v-if="item.proofs && item.proofs.length > 0" class="proof-row">
            <text class="proof-label">材料数量：</text>
            <text class="proof-text">{{ item.proofs.length }} 份</text>
            <view class="proof-btn" @tap="previewProofs(item.proofs)">查看材料</view>
          </view>

          <view v-if="item.status === 'pending'" class="action-footer">
            <view class="action-btn btn-reject" @tap="onReject(item, index)">驳回</view>
            <view class="action-btn btn-approve" @tap="onApprove(item, index)">通过</view>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-wrap">
        <uv-loading-icon size="28" />
      </view>
      <view v-else-if="finished && list.length > 0" class="no-more">已显示全部记录</view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { getAdminHonors, auditHonor } from '@/api/admin'
import { formatDateTime } from '@/utils/format'
import type { AdminHonorRecord } from '@/api/admin'

const loading = ref(false)
const page = ref(1)
const finished = ref(false)
const list = ref<AdminHonorRecord[]>([])
const total = ref(0)
const PAGE_SIZE = 10

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

function displayName(item: AdminHonorRecord) {
  return item.userName || (item as any).realName || '未知用户'
}

function displayPhone(item: AdminHonorRecord) {
  return item.phone || (item as any).userPhone || ''
}

function displayHonor(item: AdminHonorRecord) {
  return item.honorLevel || (item as any).honor_type || '未填写'
}

function displayPoints(item: AdminHonorRecord) {
  return Number(item.honorPoints ?? (item as any).honor_points ?? 0)
}

function onTabChange(e: { index: number; value: string }) {
  currentTab.value = e.index
  currentStatus.value = tabList[e.index].value
  loadFirst()
}

function formatCreatedAt(value: string) {
  if (!value) return ''
  return formatDateTime(new Date(value))
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
    const result = await getAdminHonors({ page: page.value, pageSize: PAGE_SIZE, status: currentStatus.value })
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

function previewProofs(urls: string[]) {
  if (!urls || urls.length === 0) return
  const images = urls.filter(url => /\.(png|jpe?g|gif|webp)$/i.test(url))
  if (images.length === 0) {
    uni.showToast({ title: '仅支持图片预览', icon: 'none' })
    return
  }
  uni.previewImage({
    urls: images,
    current: images[0]
  })
}

function onApprove(item: AdminHonorRecord, index: number) {
  const recordId = item.id || (item as any)._id
  uni.showModal({
    title: '确认通过',
    content: `确定通过 ${displayName(item)} 的荣誉审核并发放 ${displayPoints(item)} 积分吗？`,
    success: async (res) => {
      if (res.confirm) {
        uni.showLoading({ title: '处理中' })
        try {
          const resp = await auditHonor({ id: recordId, pass: true })
          if (resp.code === 0) {
            uni.showToast({ title: '已通过' })
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

function onReject(item: AdminHonorRecord, index: number) {
  const recordId = item.id || (item as any)._id
  uni.showModal({
    title: '驳回审核',
    content: '请输入驳回理由：',
    editable: true,
    placeholderText: '例如：材料不清晰/无法核验',
    success: async (res) => {
      if (res.confirm) {
        if (!res.content) {
          uni.showToast({ title: '必须填写驳回理由', icon: 'none' })
          return
        }
        uni.showLoading({ title: '处理中' })
        try {
          const resp = await auditHonor({ id: recordId, pass: false, rejectReason: res.content })
          if (resp.code === 0) {
            uni.showToast({ title: '已驳回' })
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

.honor-card {
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

.reject-row {
  display: flex;
  margin-top: 10px;
  background: #fdf2f1;
  padding: 10px;
  border-radius: 10px;
}

.reject-label {
  font-size: 13px;
  color: #e74c3c;
  font-weight: 600;
  flex-shrink: 0;
}

.reject-text {
  font-size: 13px;
  color: #c0392b;
  line-height: 1.5;
}

.proof-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.proof-label {
  font-size: 13px;
  color: #7a8797;
}

.proof-text {
  font-size: 13px;
  color: #1c2431;
  font-weight: 600;
}

.proof-btn {
  margin-left: auto;
  font-size: 12px;
  color: #3a7bd5;
  background: #eef6ff;
  padding: 4px 10px;
  border-radius: 12px;
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

@keyframes riseIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
