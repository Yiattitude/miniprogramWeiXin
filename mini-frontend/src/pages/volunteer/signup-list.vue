<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <Icon class="search-icon" name="search-line" size="16px" />
        <input 
          class="search-input" 
          placeholder="搜索活动名称或地点" 
          placeholder-class="placeholder" 
          v-model="keyword"
          @input="onSearch"
        />
      </view>
      <view class="filter-btn" @tap="showFilter = !showFilter">
        <text class="filter-text">筛选</text>
        <text class="filter-arrow">{{ showFilter ? '▲' : '▼' }}</text>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view v-if="showFilter" class="filter-panel">
      <text class="filter-label">时间段</text>
      <view class="filter-chips">
        <view 
          v-for="item in timeOptions" 
          :key="item.value" 
          class="chip" 
          :class="{ 'chip-active': selectedTime === item.value }"
          @tap="selectTime(item.value)"
        >
          {{ item.label }}
        </view>
      </view>

      <text class="filter-label" style="margin-top: 10px">地点</text>
      <view class="filter-chips">
        <view 
          v-for="loc in locationOptions" 
          :key="loc" 
          class="chip" 
          :class="{ 'chip-active': selectedLocation === loc }"
          @tap="selectLocation(loc)"
        >
          {{ loc }}
        </view>
      </view>
    </view>

    <view class="list-meta">
      <text class="meta-text">共 {{ total }} 个活动</text>
    </view>

    <!-- 列表内容 -->
    <view class="list-wrap">
      <view v-if="loading && list.length === 0" class="loading-wrap">
        <uv-loading-icon size="36" />
        <text class="loading-text">加载中...</text>
      </view>

      <ActivityCard 
        v-for="item in list" 
        :key="item._id" 
        :activity="item" 
        @click="onCardClick" 
      />

      <view v-if="!loading && list.length === 0" class="empty">
        <Icon class="empty-icon" name="calendar-line" size="64px" />
        <text class="empty-text">暂无符合条件的活动</text>
      </view>

      <uv-load-more 
        v-if="list.length > 0"
        :status="finished ? 'nomore' : loading ? 'loading' : 'loadmore'" 
        @loadmore="onLoadMore" 
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onPullDownRefresh, onLoad } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import ActivityCard from '@/components/volunteer/ActivityCard.vue'
import type { Activity } from '@/types/volunteer'

const volunteerStore = useVolunteerStore()
const keyword = ref('')
const showFilter = ref(false)
const selectedTime = ref('month')
const selectedLocation = ref('全部地点')

const timeOptions = [
  { label: '今天', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]

const locationOptions = ['全部地点', '市中心', '社区服务站', '医院', '学校', '公园']

const list = ref<Activity[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const finished = ref(false)
let debounceTimer: any = null

onLoad(() => {
  loadList(true)
})

async function loadList(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    finished.value = false
    list.value = []
  }
  if (finished.value && !reset) return

  loading.value = true
  try {
    volunteerStore.filter.keyword = keyword.value
    volunteerStore.filter.timeRange = selectedTime.value
    volunteerStore.filter.location = selectedLocation.value === '全部地点' ? '' : selectedLocation.value
    
    const result = await volunteerStore.fetchActivityList(page.value)
    list.value = reset ? result.list : [...list.value, ...result.list]
    total.value = result.total
    
    if (list.value.length >= result.total) {
      finished.value = true
    } else {
      page.value++
    }
  } catch (e: any) {
    console.error('[signup-list] loadList error:', e)
    uni.showToast({ title: e?.message || '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadList(true), 300)
}

function selectTime(val: string) {
  selectedTime.value = selectedTime.value === val ? '' : val
  loadList(true)
}

function selectLocation(loc: string) {
  selectedLocation.value = selectedLocation.value === loc ? '' : loc
  loadList(true)
}

function onCardClick(activity: Activity) {
  uni.navigateTo({ url: `/pages/volunteer/signup-detail?activityId=${activity._id}` })
}

function onLoadMore() {
  if (!finished.value) loadList()
}

onPullDownRefresh(async () => {
  await loadList(true)
  uni.stopPullDownRefresh()
})
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding-bottom: 44px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f7f9fc;
  border-radius: 22px;
  padding: 0 16px;
  height: 44px;
  gap: 8px;
  transition: background 0.2s ease;
}

.search-icon {
  font-size: 16px;
  flex-shrink: 0;
  color: #7a8797;
}

.search-input {
  flex: 1;
  font-size: 15px;
  color: #1c2431;
  background: transparent;
}

.placeholder {
  color: #a0aab5;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #eef3fc;
  transition: all 0.2s ease;
}

.filter-text {
  font-size: 14px;
  color: #2f62c6;
  font-weight: 500;
}

.filter-arrow {
  font-size: 11px;
  color: #2f62c6;
}

/* 筛选面板 */
.filter-panel {
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #e6ebf2;
  animation: slideDown 0.3s ease-out both;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1c2431;
  margin-bottom: 10px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #7a8797;
  background: #f7f9fc;
  transition: all 0.2s ease;
}

.chip-active {
  background: linear-gradient(135deg, #d4e9fc 0%, #c0dffe 100%);
  color: #2f62c6;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(47, 98, 198, 0.15);
}

/* 统计 */
.list-meta {
  padding: 16px 16px 8px;
}

.meta-text {
  font-size: 14px;
  color: #7a8797;
  font-weight: 500;
}

/* 列表 */
.list-wrap {
  padding: 0 16px;
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 12px;
}

.loading-text {
  font-size: 14px;
  color: #7a8797;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  gap: 14px;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: #7a8797;
  font-weight: 500;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
