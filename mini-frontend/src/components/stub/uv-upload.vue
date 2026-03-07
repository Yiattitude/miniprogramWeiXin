<template>
  <view class="uv-upload">
    <view class="grid">
      <!-- 已选图片 -->
      <view
        v-for="(item, index) in fileList"
        :key="index"
        class="thumb-wrap"
        @tap="onPreview(index)"
      >
        <image :src="item.url || item.path" class="thumb" mode="aspectFill" />
        <view class="remove-btn" @tap.stop="onRemove(index)">
          <text class="remove-icon">×</text>
        </view>
      </view>

      <!-- 添加按钮 -->
      <view
        v-if="fileList.length < maxCount"
        class="add-btn"
        @tap="onChoose"
      >
        <text class="add-icon">+</text>
        <text class="add-text">照片</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    fileList?: any[]
    maxCount?: number
    maxSize?: number
    uploadIcon?: string
    previewFullImage?: boolean
  }>(),
  {
    fileList: () => [],
    maxCount: 9,
    maxSize: 5 * 1024 * 1024,
    previewFullImage: true,
  }
)

const emit = defineEmits<{
  (e: 'update:fileList', val: any[]): void
}>()

function onChoose() {
  const remaining = props.maxCount - props.fileList.length
  uni.chooseImage({
    count: remaining,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      const paths: string[] = Array.isArray(res.tempFilePaths)
        ? res.tempFilePaths
        : [res.tempFilePaths]
      const newFiles = paths.map((path: string) => ({ path, url: '' }))
      emit('update:fileList', [...props.fileList, ...newFiles])
    },
  })
}

function onRemove(index: number) {
  const list = [...props.fileList]
  list.splice(index, 1)
  emit('update:fileList', list)
}

function onPreview(index: number) {
  if (!props.previewFullImage) return
  const urls = props.fileList.map((f: any) => f.url || f.path).filter(Boolean)
  if (!urls.length) return
  uni.previewImage({ urls, current: urls[index] })
}
</script>

<style scoped>
.uv-upload {
  width: 100%;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.thumb-wrap {
  position: relative;
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
  overflow: hidden;
}

.thumb {
  width: 100%;
  height: 100%;
}

.remove-btn {
  position: absolute;
  top: 0;
  right: 0;
  width: 44rpx;
  height: 44rpx;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom-left-radius: 8rpx;
}

.remove-icon {
  color: #fff;
  font-size: 32rpx;
  line-height: 1;
}

.add-btn {
  width: 200rpx;
  height: 200rpx;
  background: #f5f7fa;
  border: 2rpx dashed #d0d5dd;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
}

.add-icon {
  font-size: 56rpx;
  color: #aab;
  line-height: 1;
}

.add-text {
  font-size: 24rpx;
  color: #aab;
}
</style>
