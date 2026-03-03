/**
 * @file http.ts
 * @description uni.request 封装，统一处理 BaseURL、Token、错误码
 * @phase Phase 1 - 1-5
 */

/**
 * @file http.ts
 * @description uni.request 封装——统一处理 BaseURL、Token、错误码、401 跳登录
 */

/** BaseURL 从环境变量读取，开发时在 .env.development 中配置 */
const BASE_URL: string =
  (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** 统一响应结构（与后端约定） */
interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

interface RequestOptions {
  url: string
  method?: HttpMethod
  data?: object | string
  header?: Record<string, string>
}

/**
 * 核心请求函数
 * - 自动拼接 BaseURL
 * - 自动注入 Authorization Token
 * - code !== 0 时自动 reject 并 Toast 提示
 * - 401 时跳转登录页
 */
function request<T = unknown>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') as string | undefined

    uni.request({
      url: BASE_URL + options.url,
      method: options.method ?? 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.header,
      },
      success(res) {
        const result = res.data as ApiResponse<T>
        if (result.code === 0) {
          resolve(result.data)
        } else if (result.code === 401) {
          uni.removeStorageSync('token')
          uni.reLaunch({ url: '/pages/login/index' })
          reject(new Error('登录已过期，请重新登录'))
        } else {
          uni.showToast({ title: result.message || '请求失败', icon: 'none' })
          reject(new Error(result.message))
        }
      },
      fail(err) {
        uni.showToast({ title: '网络异常，请检查连接', icon: 'none' })
        reject(err)
      },
    })
  })
}

/** 封装后的 http 对象 */
export const http = {
  get<T = unknown>(url: string, params?: object): Promise<T> {
    // 过滤掉 undefined / null / 空字符串，避免 query string 出现 "param=undefined"
    const cleanParams = params
      ? Object.fromEntries(
          Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
        )
      : undefined
    return request<T>({ url, method: 'GET', data: cleanParams })
  },
  post<T = unknown>(url: string, data?: object): Promise<T> {
    return request<T>({ url, method: 'POST', data })
  },
  put<T = unknown>(url: string, data?: object): Promise<T> {
    return request<T>({ url, method: 'PUT', data })
  },
  delete<T = unknown>(url: string, data?: object): Promise<T> {
    return request<T>({ url, method: 'DELETE', data })
  },
}

/**
 * 图片上传（uni.uploadFile 封装）
 * @returns 上传成功后的图片 URL
 */
export function uploadImage(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token') as string | undefined
    uni.uploadFile({
      url: BASE_URL + '/api/upload/image',
      filePath,
      name: 'file',
      header: token ? { Authorization: `Bearer ${token}` } : {},
      success(res) {
        try {
          const result = JSON.parse(res.data) as ApiResponse<{ url: string }>
          if (result.code === 0) {
            resolve(result.data.url)
          } else {
            uni.showToast({ title: result.message || '上传失败', icon: 'none' })
            reject(new Error(result.message))
          }
        } catch {
          reject(new Error('解析失败'))
        }
      },
      fail(err) {
        uni.showToast({ title: '图片上传失败', icon: 'none' })
        reject(err)
      },
    })
  })
}
