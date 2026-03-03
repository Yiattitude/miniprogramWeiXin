<script setup lang="ts">
/**
 * @page volunteer/statistics
 * @description 统计报表：时间 Tab + 个人/团队 Segment，两张表格，导出
 * @phase Phase 4 - 4-4
 */
import { ref, computed, watch } from 'vue'
import { onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import StatTable from '@/components/volunteer/StatTable.vue'
import type { TableColumn } from '@/components/volunteer/StatTable.vue'

const volunteerStore = useVolunteerStore()

// ────── 时间 Tab ──────
const TIME_TABS = [
  { label: '全部', value: 'all' },
  { label: '本月', value: 'month' },
  { label: '本季度', value: 'quarter' },
  { label: '本年', value: 'year' },
] as const

type PeriodType = typeof TIME_TABS[number]['value']
const activePeriod = ref<PeriodType>('all')

// ────── Segment：个人/团队 ──────
type ScopeType = 'personal' | 'team'
const activeScope = ref<ScopeType>('personal')

const loading = ref(false)
const exporting = ref(false)

// ────── 表格数据 ──────
const stats = computed(() => volunteerStore.statistics)

// 按类别汇总表格
const categoryColumns: TableColumn[] = [
  { label: '活动类别', align: 'left' },
  { label: '参与次数', align: 'center' },
  { label: '总时长(h)', align: 'center' },
]
const categoryRows = computed<string[][]>(() => {
  if (!stats.value?.byCategory) return []
  return stats.value.byCategory.map(r => [r.category, String(r.count), String(r.totalHours)])
})
const categoryTotalRow = computed<string[]>(() => {
  if (!stats.value?.byCategory || stats.value.byCategory.length === 0) return []
  const totalCount = stats.value.byCategory.reduce((s, r) => s + r.count, 0)
  const totalHours = stats.value.byCategory.reduce((s, r) => s + r.totalHours, 0)
  return ['合计', String(totalCount), String(totalHours)]
})

// 按活动明细表格（团队视图）
const activityColumns: TableColumn[] = [
  { label: '活动名称', align: 'left' },
  { label: '参与人数', align: 'center' },
  { label: '总时长(h)', align: 'center' },
]
const activityRows = computed<string[][]>(() => {
  if (!stats.value?.byActivity) return []
  return stats.value.byActivity.map(r => [r.activityName, String(r.personCount), String(r.totalHours)])
})
const activityTotalRow = computed<string[]>(() => {
  if (!stats.value?.byActivity || stats.value.byActivity.length === 0) return []
  const totalPerson = stats.value.byActivity.reduce((s, r) => s + r.personCount, 0)
  const totalHours = stats.value.byActivity.reduce((s, r) => s + r.totalHours, 0)
  return ['合计', String(totalPerson), String(totalHours)]
})

// ────── 加载数据 ──────
async function loadStats() {
  loading.value = true
  try {
    await volunteerStore.fetchStatistics({
      scope: activeScope.value,
      period: activePeriod.value,
    })
  } finally {
    loading.value = false
  }
}

onLoad(loadStats)
watch([activePeriod, activeScope], loadStats)

// ────── 导出 ──────
async function handleExport() {
  exporting.value = true
  try {
    const downloadUrl = await volunteerStore.exportReport({
      scope: activeScope.value,
      period: activePeriod.value,
      format: 'excel',
    })
    uni.downloadFile({
      url: downloadUrl,
      success(res) {
        if (res.statusCode === 200) {
          uni.openDocument({
            filePath: res.tempFilePath,
            showMenu: true,
            success() {
              uni.showToast({ title: '导出成功', icon: 'success' })
            },
            fail() {
              uni.showToast({ title: '文件已下载', icon: 'success' })
            },
          })
        }
      },
      fail() {
        uni.showToast({ title: '下载失败，请重试', icon: 'none' })
      },
    })
  } catch (e) {
    console.error('[statistics] exportReport error:', e)
  } finally {
    exporting.value = false
  }
}

// 刷新
onPullDownRefresh(() => {
  loadStats().finally(() => uni.stopPullDownRefresh())
})
</script>

<template>
  <view class="page">
    <!-- ── 时间 Tab ── -->
    <view class="tab-bar">
      <view
        v-for="tab in TIME_TABS"
        :key="tab.value"
        :class="['tab-item', activePeriod === tab.value ? 'tab-active' : '']"
        @click="activePeriod = tab.value"
      >
        {{ tab.label }}
      </view>
    </view>

    <!-- ── 个人/团队 Segment ── -->
    <view class="segment-bar">
      <view
        :class="['seg-item', activeScope === 'personal' ? 'seg-active' : '']"
        @click="activeScope = 'personal'"
      >
        个人统计
      </view>
      <view
        :class="['seg-item', activeScope === 'team' ? 'seg-active' : '']"
        @click="activeScope = 'team'"
      >
        团队统计
      </view>
    </view>

    <!-- ── 加载中 ── -->
    <view v-if="loading" class="loading-wrap">
      <uv-loading-icon size="40" />
      <text class="loading-text">数据加载中</text>
    </view>

    <scroll-view v-else scroll-y class="content-scroll">
      <!-- ── 汇总三格 ── -->
      <view v-if="stats" class="summary-card">
        <view class="sum-item">
          <text class="sum-num">{{ stats.totalHours }}</text>
          <text class="sum-label">{{ activeScope === 'personal' ? '我的时长(h)' : '总时长(h)' }}</text>
        </view>
        <view class="sum-divider" />
        <view class="sum-item">
          <text class="sum-num">{{ stats.totalCount }}</text>
          <text class="sum-label">参与次数</text>
        </view>
        <view class="sum-divider" />
        <view class="sum-item">
          <text class="sum-num">{{ stats.totalServed }}</text>
          <text class="sum-label">服务人次</text>
        </view>
      </view>

      <!-- 空统计 -->
      <view v-else class="empty">
        <text class="empty-icon">📊</text>
        <text class="empty-text">暂无统计数据</text>
        <text class="empty-sub">当前筛选条件下暂无数据，尝试切换时间范围</text>
      </view>

      <!-- ── 表格一：按类别汇总 ── -->
      <view v-if="stats" class="table-section">
        <view class="table-header">
          <text class="table-title">按类别统计</text>
        </view>
        <StatTable
          :columns="categoryColumns"
          :rows="categoryRows"
          :total-row="categoryTotalRow"
        />
      </view>

      <!-- ── 表格二：按活动明细（团队视图才显示）── -->
      <view v-if="stats && activeScope === 'team'" class="table-section">
        <view class="table-header">
          <text class="table-title">按活动明细</text>
        </view>
        <StatTable
          :columns="activityColumns"
          :rows="activityRows"
          :total-row="activityTotalRow"
        />
      </view>

      <!-- ── 导出按钮 ── -->
      <view v-if="stats" class="export-wrap">
        <view
          :class="['btn-export', exporting ? 'btn-disabled' : '']"
          @click="!exporting && handleExport()"
        >
          <text class="export-icon">📥</text>
          <text>{{ exporting ? '导出中...' : '导出 Excel 报表' }}</text>
        </view>
        <text class="export-hint">将生成 Excel 文件，可保存或分享</text>
      </view>

      <view class="bottom-pad" />
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #f0f2f5);
  display: flex;
  flex-direction: column;
}

/* 时间 Tab */
.tab-bar {
  display: flex;
  background: #fff;
  border-bottom: 1px solid var(--color-border, #e2e7ec);
}
.tab-item {
  flex: 1;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-base, 17px);
  color: var(--color-text-sub, #6b7b8d);
  position: relative;

  &.tab-active {
    color: var(--color-primary, #3a7bd5);
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60%;
      height: 3px;
      background: var(--color-primary, #3a7bd5);
      border-radius: 2px;
    }
  }
}

/* Segment */
.segment-bar {
  display: flex;
  margin: var(--space-md, 16px) var(--space-md, 16px) 0;
  background: var(--color-border, #e2e7ec);
  border-radius: 10px;
  padding: 3px;
}
.seg-item {
  flex: 1;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-base, 17px);
  color: var(--color-text-sub, #6b7b8d);
  border-radius: 8px;
  font-weight: 500;

  &.seg-active {
    background: #fff;
    color: var(--color-primary, #3a7bd5);
    font-weight: 700;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }
}

/* 加载 */
.loading-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 80px 0;
}
.loading-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-muted, #a0aab5);
}

/* 内容滚动区 */
.content-scroll {
  flex: 1;
}

/* 汇总卡片 */
.summary-card {
  background: #fff;
  margin: var(--space-md, 16px);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.sum-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.sum-num {
  font-size: var(--font-xl, 22px);
  font-weight: 700;
  color: var(--color-primary, #3a7bd5);
}
.sum-label {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-sub, #6b7b8d);
}
.sum-divider {
  width: 1px;
  height: 44px;
  background: var(--color-border, #e2e7ec);
}

/* 表格区 */
.table-section {
  margin: 0 var(--space-md, 16px) var(--space-md, 16px);
}
.table-header {
  padding: var(--space-sm, 12px) 0 var(--space-xs, 8px);
}
.table-title {
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
}

/* 导出按钮 */
.export-wrap {
  padding: var(--space-xs, 8px) var(--space-md, 16px) var(--space-md, 16px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.btn-export {
  width: 100%;
  height: 52px;
  background: var(--color-primary, #3a7bd5);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: var(--font-base, 17px);
  font-weight: 600;

  &.btn-disabled {
    background: var(--color-text-muted, #a0aab5);
  }
}
.export-icon { font-size: 20px; }
.export-hint {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
}

/* 空状态 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px var(--space-md, 16px) 30px;
  gap: 10px;
}
.empty-icon { font-size: 56px; }
.empty-text {
  font-size: var(--font-lg, 19px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
}
.empty-sub {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-muted, #a0aab5);
  text-align: center;
}

.bottom-pad { height: 40px; }
</style>