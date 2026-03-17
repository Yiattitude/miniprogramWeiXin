/**
 * @file http.ts
 * @description 微信云开发云函数调用封装
 */

export interface CloudResponse<T = any> {
  code: number
  message: string
  data: T
}

let cloudInited = false

function ensureCloudInit() {
  // 兜底初始化：避免页面先于 App.onLaunch 调用云 API
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wxAny = wx as any
    if (!wxAny?.cloud) return
    if (cloudInited) return

    wxAny.cloud.init({
      // 与 App.vue 保持一致；若你后续改 env，请同步这里
      env: 'cloud1-9gqeut4h5f964174',
      traceUser: true,
    })
    cloudInited = true
  } catch (e) {
    // init 失败时不阻断，交给后续 callFunction 抛错
    console.warn('[cloud] init failed:', e)
  }
}

/**
 * 封装 wx.cloud.callFunction
 * @param action - 业务动作名
 * @param data - 业务数据
 * @param functionName - 云函数名，默认为 volunteer-service
 */
export async function cloudCall<T = any>(
  action: string,
  data: any = {},
  functionName: string = 'volunteer-service'
): Promise<T> {
  try {
    ensureCloudInit()
    const res = await wx.cloud.callFunction({
      name: functionName,
      data: {
        action,
        data
      }
    })

    const result = res.result as CloudResponse<T>
    
    if (result.code === 0) {
      return result.data
    } else {
      // 业务错误处理
      uni.showToast({
        title: result.message || '操作失败',
        icon: 'none'
      })
      throw new Error(result.message)
    }
  } catch (error) {
    // 网络或系统级别错误
    console.error(`[Cloud Function Error] ${action}:`, error)
    if (!action.includes('silent')) { // 可选：静默请求不弹窗
      uni.showToast({
        title: '服务暂时不可用',
        icon: 'error'
      })
    }
    throw error
  }
}
