/**
 * @file useUpload.ts
 * @description 图片上传逻辑：chooseImage → uploadFile → 返回 URL
 * @phase Phase 1 - 1-7
 */

/**
 * @file useUpload.ts
 * @description 图片上传逻辑 Hook
 * 封装 uni.chooseImage + uploadImage，管理 uploading 状态和 URLs
 */

import { ref } from 'vue'
import { uploadImage } from '@/api/http'

/**
 * 图片上传 Hook
 * @param maxCount 最多上传张数，默认 9
 * @param maxSizeMB 单张最大 MB，默认 5
 */
export function useUpload(maxCount = 9, maxSizeMB = 5) {
  const urls = ref<string[]>([])        // 已上传成功的图片 URL 数组
  const uploading = ref(false)          // 是否正在上传

  /**
   * 选择并上传图片
   * @returns 上传成功的 URL 数组（副作用：更新 urls.value）
   */
  async function choose(): Promise<string[]> {
    const remaining = maxCount - urls.value.length
    if (remaining <= 0) {
      uni.showToast({ title: `最多上传 ${maxCount} 张`, icon: 'none' })
      return []
    }

    return new Promise((resolve) => {
      uni.chooseImage({
        count: remaining,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        async success(res) {
          // 校验文件大小（类型断言处理 uni-app 类型定义的联合类型）
          const tempFiles = (res.tempFiles as UniApp.ChooseImageSuccessCallbackResultFile[])
          const tempFilePaths = (res.tempFilePaths as string[])
          const oversized = tempFiles.find(
            (f: UniApp.ChooseImageSuccessCallbackResultFile) => f.size > maxSizeMB * 1024 * 1024
          )
          if (oversized) {
            uni.showToast({ title: `单张图片不能超过 ${maxSizeMB}MB`, icon: 'none' })
            resolve([])
            return
          }

          uploading.value = true
          try {
            const uploadedUrls = await Promise.all(
              tempFilePaths.map((path: string) => uploadImage(path))
            )
            urls.value.push(...uploadedUrls)
            resolve(uploadedUrls)
          } catch {
            resolve([])
          } finally {
            uploading.value = false
          }
        },
        fail() {
          resolve([])
        },
      })
    })
  }

  /** 删除指定索引的图片 */
  function remove(index: number) {
    urls.value.splice(index, 1)
  }

  /** 重置 */
  function reset() {
    urls.value = []
  }

  return { urls, uploading, choose, remove, reset }
}
