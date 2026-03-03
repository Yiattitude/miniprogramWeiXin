<script setup lang="ts">
/**
 * @page volunteer/signup-list
 * @description 活动列表：搜索栏（防抖 300ms）+ 时间/地点筛选 + 分页加载
 */
import { ref, onMounted } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import ActivityCard from '@/components/volunteer/ActivityCard.vue'
import type { Activity, ActivityStatus } from '@/types/volunteer'

const volunteerStore = useVolunteerStore()

// ── 搜索 & 筛选 ──
const keyword = ref('')
const showFilter = ref(false)
const selectedTime = ref<'today' | 'week' | 'month' | 'custom' | ''>('')
const selectedLocation = ref('')
const locationOptions = ['全部地点', '市中心', '社区服务站', '医院', '学校', '公园']

// ── 分页 ──
const list = ref<Activity[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(false)
const finished = ref(false)

let debounceTimer: ReturnType<typeof setTimeout> | null = null

// onLoad + onMounted 双保险（onLoad 仅 page 组件触发，onMounted 作为兜底）
onLoad(() => { loadList(true) })
onMounted(() => { if (list.value.length === 0 && !loading.value) loadList(true) })

async function loadList(reset = false) {
  if (loading.value) return
  if (reset) {
    page.value = 1
    finished.value = false
    list.value = []
  }
  if (finished.value) return
  loading.value = true
  try {
    volunteerStore.filter.keyword = keyword.value
    volunteerStore.filter.timeRange = selectedTime.value || 'month'
    volunteerStore.filter.location = selectedLocation.value === '全部地点' ? '' : selectedLocation.value
    const result = await volunteerStore.fetchActivityList(page.value)
    list.value = reset ? result.list : [...list.value, ...result.list]
    total.value = result.total
    if (list.value.length >= result.total) finished.value = true
    else page.value++
  } catch (e: any) {
    console.error('[signup-list] loadList error:', e)
    uni.showToast({ title: e?.message ?? '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function onSearch() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => loadList(true), 300)
}

function onCardClick(activity: Activity) {
  uni.navigateTo({ url: `/pages/volunteer/signup-detail?activityId=${activity.id}` })
}

function onLoadMore() {
  if (!finished.value) loadList()
}

// 下拉刷新（pages.json 须开启 enablePullDownRefresh）
onPullDownRefresh(() => {
  loadList(true).finally(() => uni.stopPullDownRefresh())
})
</script>

<template>
  <view class="page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="keyword"
          placeholder="搜索活动名称或地点"
          placeholder-class="placeholder"
          @input="onSearch"
        />
      </view>
      <view class="filter-btn" @click="showFilter = !showFilter">
        <text class="filter-text">筛选</text>
        <text class="filter-arrow">{{ showFilter ? '▲' : '▼' }}</text>
      </view>
    </view>

    <!-- 筛选面板 -->
    <view v-if="showFilter" class="filter-panel">
      <text class="filter-label">时间段</text>
      <view class="filter-chips">
        <view
          v-for="item in [
            { label: '今天', value: 'today' },
            { label: '本周', value: 'week' },
            { label: '本月', value: 'month' },
          ]"
          :key="item.value"
          class="chip"
          :class="{ 'chip-active': selectedTime === item.value }"
          @click="selectedTime = (selectedTime === item.value ? '' : item.value) as any; loadList(true)"
        >
          {{ item.label }}
        </view>
      </view>
      <text class="filter-label" style="margin-top: 10px;">地点</text>
      <view class="filter-chips">
        <view
          v-for="loc in locationOptions"
          :key="loc"
          class="chip"
          :class="{ 'chip-active': selectedLocation === loc }"
          @click="selectedLocation = selectedLocation === loc ? '' : loc; loadList(true)"
        >
          {{ loc }}
        </view>
      </view>
    </view>

    <!-- 统计 -->
    <view class="list-meta">
      <text class="meta-text">共 {{ total }} 个活动</text>
    </view>

    <!-- 列表 -->
    <view class="list-wrap">
      <!-- 初始加载中 -->
      <view v-if="loading && list.length === 0" class="loading-wrap">
        <uv-loading-icon size="36" />
        <text class="loading-text">加载中...</text>
      </view>

      <ActivityCard
        v-for="item in list"
        :key="item.id"
        :activity="item"
        @click="onCardClick"
      />

      <!-- 空状态 -->
      <view v-if="!loading && list.length === 0" class="empty">
        <text class="empty-icon">📭</text>
        <text class="empty-text">暂无符合条件的活动</text>
      </view>

      <!-- 加载更多 -->
      <uv-load-more
        :status="finished ? 'nomore' : loading ? 'loading' : 'loadmore'"
        @loadmore="onLoadMore"
      />
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #f0f2f5);
  padding-bottom: 40px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm, 12px);
  padding: var(--space-sm, 12px) var(--space-md, 16px);
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 10;
}
.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--color-bg-page, #f0f2f5);
  border-radius: 22px;
  padding: 0 14px;
  height: 44px;
  gap: 8px;
}
.search-icon { font-size: 16px; flex-shrink: 0; }
.search-input {
  flex: 1;
  font-size: var(--font-base, 17px);
  color: var(--color-text-main, #1e2a3a);
  background: transparent;
}
.placeholder { color: var(--color-text-muted, #a0aab5); }
.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 56px;
}
.filter-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-primary, #3a7bd5);
}
.filter-arrow { font-size: 11px; color: var(--color-primary, #3a7bd5); }

/* 筛选面板 */
.filter-panel {
  background: #fff;
  padding: var(--space-sm, 12px) var(--space-md, 16px);
  border-bottom: 1px solid var(--color-border, #e2e7ec);
}
.filter-label {
  display: block;
  font-size: var(--font-sm, 15px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  margin-bottom: 8px;
}
.filter-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.chip {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
  background: var(--color-bg-page, #f0f2f5);
}
.chip-active {
  background: var(--color-primary-bg, #eef3fc);
  color: var(--color-primary, #3a7bd5);
  font-weight: 500;
}

/* 统计 */
.list-meta {
  padding: var(--space-sm, 12px) var(--space-md, 16px) var(--space-xs, 8px);
}
.meta-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
}

/* 列表 */
.list-wrap {
  padding: 0 var(--space-md, 16px);
}

.loading-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 12px;
}
.loading-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-muted, #a0aab5);
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  gap: 12px;
}
.empty-icon { font-size: 52px; }
.empty-text {
  font-size: var(--font-base, 17px);
  color: var(--color-text-muted, #a0aab5);
}
</style>
