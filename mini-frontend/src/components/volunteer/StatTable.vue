<script setup lang="ts">
/**
 * @component StatTable
 * @description 通用统计表格：表头 + 数据行 + 可选合计行（高亮蓝色）
 * @props columns   TableColumn[]  表头配置
 * @props rows      string[][]     数据行（与 columns 顺序对应）
 * @props totalRow  string[]       合计行（可选，高亮显示）
 */

export interface TableColumn {
  label: string                        // 表头显示文字
  align?: 'left' | 'center' | 'right' // 对齐方式，默认 left
}

const props = withDefaults(defineProps<{
  columns: TableColumn[]
  rows: string[][]
  totalRow?: string[]
}>(), {
  totalRow: undefined,
})

function cellAlign(col: TableColumn): string {
  return col.align ?? 'left'
}
</script>

<template>
  <view class="stat-table">
    <!-- 表头 -->
    <view class="table-row table-head">
      <view
        v-for="(col, ci) in columns"
        :key="ci"
        class="table-cell head-cell"
        :style="{ textAlign: cellAlign(col) }"
      >
        {{ col.label }}
      </view>
    </view>

    <!-- 数据行 -->
    <view
      v-for="(row, ri) in rows"
      :key="ri"
      class="table-row"
      :class="{ 'row-odd': ri % 2 === 1 }"
    >
      <view
        v-for="(cell, ci) in row"
        :key="ci"
        class="table-cell body-cell"
        :style="{ textAlign: cellAlign(columns[ci]) }"
      >
        {{ cell }}
      </view>
    </view>

    <!-- 合计行（可选，高亮） -->
    <view v-if="totalRow && totalRow.length" class="table-row total-row">
      <view
        v-for="(cell, ci) in totalRow"
        :key="ci"
        class="table-cell total-cell"
        :style="{ textAlign: cellAlign(columns[ci]) }"
      >
        {{ cell }}
      </view>
    </view>

    <!-- 无数据 -->
    <view v-if="rows.length === 0" class="table-empty">
      <text class="empty-text">暂无数据</text>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.stat-table {
  background: #fff;
  border-radius: var(--radius-md, 10px);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.table-row {
  display: flex;
  border-bottom: 1px solid var(--color-border, #e2e7ec);

  &:last-child {
    border-bottom: none;
  }

  &.row-odd {
    background: #f8fafc;
  }
}

.table-cell {
  flex: 1;
  padding: 12px var(--space-sm, 12px);
  font-size: var(--font-sm, 15px);
  line-height: 1.5;
  word-break: break-all;
}

/* 表头 */
.table-head {
  background: var(--color-primary-bg, #eef3fc);
}

.head-cell {
  font-size: var(--font-sm, 15px);
  font-weight: 600;
  color: var(--color-primary, #3a7bd5);
}

/* 数据行 */
.body-cell {
  color: var(--color-text-main, #1e2a3a);
}

/* 合计行 */
.total-row {
  background: var(--color-primary, #3a7bd5);
  border-bottom: none;
}

.total-cell {
  font-size: var(--font-sm, 15px);
  font-weight: 600;
  color: #fff;
}

/* 空状态 */
.table-empty {
  padding: var(--space-lg, 24px);
  text-align: center;
}

.empty-text {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-muted, #a0aab5);
}
</style>
