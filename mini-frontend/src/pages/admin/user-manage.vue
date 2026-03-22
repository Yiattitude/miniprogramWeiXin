<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="search-header">
      <view class="search-box">
        <Icon name="search-2-line" size="18px" color="#99a2aa" />
        <input 
          class="search-input" 
          placeholder="请输入姓名或手机号搜索" 
          v-model="keyword" 
          confirm-type="search"
          @confirm="onSearch"
        />
        <Icon 
          v-if="keyword" 
          name="close-circle-fill" 
          size="16px" 
          color="#ccc" 
          @tap="clearSearch"
        />
      </view>
    </view>

    <view class="stat-bar">
      <text class="stat-bar-text">共找到 {{ total }} 位用户</text>
    </view>

    <scroll-view scroll-y class="scroll-wrap" @scrolltolower="loadMore">
      <view class="list-wrap">
        <view 
          v-for="item in list" 
          :key="item._id" 
          class="user-card"
          @tap="goDetail(item)"
        >
          <view class="card-head">
            <view class="name-wrap">
              <text class="real-name">{{ item.realName || '未绑名' }}</text>
              <view v-if="item.role === 'admin'" class="role-tag">管理员</view>
            </view>
            <view class="points-badge">
              <text class="pts-num">{{ item.totalPoints }}</text>
              <text class="pts-unit">积分</text>
            </view>
          </view>
          
          <view class="info-row">
            <Icon name="phone-line" size="16px" color="#7a8797" />
            <text class="info-text">{{ item.phone || '未绑定手机号' }}</text>
          </view>
          
          <view class="info-row">
            <Icon name="checkbox-line" size="16px" color="#7a8797" />
            <text class="info-text">总打卡次数：{{ item.checkinCount }} 次</text>
          </view>
        </view>
      </view>

      <view v-if="loading" class="loading-wrap">
        <uv-loading-icon size="28" />
      </view>
      <view v-else-if="finished && list.length > 0" class="no-more">底线到了，没有更多用户了</view>
      <view v-if="list.length === 0 && !loading" class="empty">
        <Icon name="ghost-line" size="64px" color="#dce1e6" />
        <text class="empty-text">未能找到匹配的用户</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { getAdminUsers } from '@/api/admin'
import type { AdminUser } from '@/api/admin'

const keyword = ref('')
const loading = ref(false)
const page = ref(1)
const finished = ref(false)
const list = ref<AdminUser[]>([])
const total = ref(0)
const PAGE_SIZE = 15

onLoad(() => loadFirst())

onPullDownRefresh(async () => {
  await loadFirst()
  uni.stopPullDownRefresh()
})

function onSearch() {
  loadFirst()
}

function clearSearch() {
  keyword.value = ''
  loadFirst()
}

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
    const result = await getAdminUsers({ page: page.value, pageSize: PAGE_SIZE, keyword: keyword.value })
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

function goDetail(item: AdminUser) {
  // Pass user details strictly via URL storage or simple params. 
  // Here we pass basic json via URL for mock purposes.
  // In real app, just pass ID and redownload.
  const payload = encodeURIComponent(JSON.stringify(item))
  uni.navigateTo({
    url: `/pages/admin/user-detail?payload=${payload}`
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f4f6f9;
  display: flex;
  flex-direction: column;
}

.search-header {
  background: #fff;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
  z-index: 10;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f0f2f5;
  height: 40px;
  border-radius: 20px;
  padding: 0 16px;
}

.search-input {
  flex: 1;
  font-size: 14px;
  margin: 0 10px;
  color: #333;
}

.stat-bar {
  padding: 12px 16px;
  font-size: 13px;
  color: #6b7b8d;
}

.scroll-wrap {
  flex: 1;
  height: 0;
}

.list-wrap {
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.name-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.real-name {
  font-size: 18px;
  font-weight: 700;
  color: #222;
}

.role-tag {
  font-size: 10px;
  padding: 2px 6px;
  background: #fff0e5;
  color: #f37b1d;
  border-radius: 4px;
}

.points-badge {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.pts-num {
  font-size: 22px;
  font-weight: 800;
  color: #3a7bd5;
}

.pts-unit {
  font-size: 12px;
  color: #7a8797;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.info-text {
  font-size: 14px;
  color: #555;
}

.loading-wrap {
  padding: 20px 0;
  display: flex;
  justify-content: center;
}

.no-more {
  text-align: center;
  padding: 20px 0;
  font-size: 13px;
  color: #aaa;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
}

.empty-text {
  margin-top: 12px;
  font-size: 14px;
  color: #a0aab5;
}
</style>
