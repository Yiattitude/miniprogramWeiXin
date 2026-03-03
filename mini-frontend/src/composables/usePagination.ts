/**
 * @file usePagination.ts
 * @description 分页逻辑封装：page / pageSize / total / loadMore / reset
 * @phase Phase 1 - 1-7
 */

/**
 * @file usePagination.ts
 * @description 分页逻辑封装 Hook
 * 内置 loadMore / refresh / reset 方法，并管理 loading / finished 状态
 */

import { ref } from 'vue'
import type { PageResult } from '@/types/volunteer'

/**
 * 分页 Hook
 * @param fetcher 分页报文函数，需返回 { list, total }
 * @param pageSize 每页条数，默认 10
 * @example
 *   const { list, loading, finished, loadMore, refresh } = usePagination(
 *     (page, size) => getActivityList({ page, pageSize: size })
 *   )
 */
export function usePagination<T>(
  fetcher: (page: number, pageSize: number) => Promise<PageResult<T>>,
  pageSize = 10
) {
  const page = ref(1)
  const list = ref<T[]>([]) as { value: T[] }
  const total = ref(0)
  const loading = ref(false)
  const finished = ref(false)
  const refreshing = ref(false)

  /** 加载下一页（上拉加载更多）  */
  async function loadMore() {
    if (loading.value || finished.value) return
    loading.value = true
    try {
      const result = await fetcher(page.value, pageSize)
      list.value.push(...result.list)
      total.value = result.total
      if (list.value.length >= result.total) {
        finished.value = true
      } else {
        page.value++
      }
    } catch (e) {
      console.error('[usePagination] loadMore error:', e)
    } finally {
      loading.value = false
    }
  }

  /** 下拉刷新：重置后重新拉取第一页 */
  async function refresh() {
    refreshing.value = true
    reset()
    await loadMore()
    refreshing.value = false
    uni.stopPullDownRefresh()
  }

  /** 重置状态（切换筛选条件后调用） */
  function reset() {
    page.value = 1
    list.value = []
    total.value = 0
    finished.value = false
    loading.value = false
  }

  return { list, total, loading, finished, refreshing, page, loadMore, refresh, reset }
}
