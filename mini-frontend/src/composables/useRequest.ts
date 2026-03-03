/**
 * @file useRequest.ts
 * @description 通用请求 Hook：统一管理 loading / error 状态
 * @phase Phase 1 - 1-7
 */

/**
 * @file useRequest.ts
 * @description 通用异步请求 Hook，封装 loading / error 状态
 */

import { ref } from 'vue'

/**
 * 通用请求 Hook
 * @param fn 异步请求函数
 * @example
 *   const { loading, error, execute } = useRequest(volunteerApi.getActivityList)
 *   await execute({ page: 1 })
 */
export function useRequest<Args extends unknown[], T>(
  fn: (...args: Args) => Promise<T>
) {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)

  async function execute(...args: Args): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      const result = await fn(...args)
      data.value = result as T
      return result
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
      console.error('[useRequest] error:', e)
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, data, execute }
}
