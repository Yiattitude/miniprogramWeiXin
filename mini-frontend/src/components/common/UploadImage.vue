<template>
  <view class="upload-wrap">
    <!-- 已上传预览 -->
    <view v-for="(url, index) in modelValue" :key="url" class="upload-item">
      <image class="upload-img" :src="url" mode="aspectFill" @click="previewImage(index)" />
      <view class="upload-delete" @click="remove(index)">
        <text class="upload-delete-icon">✕</text>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view
      v-if="modelValue.length < max"
      class="upload-add"
      @click="chooseImage"
    >
      <text class="upload-add-icon">＋</text>
      <text class="upload-add-text">上传照片</text>
      <text class="upload-add-hint">{{ modelValue.length }}/{{ max }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * @component UploadImage
 * @description v-model 绑定 URL 数组，最多 max 张，选后直接使用本地临时路径
 *              后端就绪后，将 chooseImage 中的 tempFilePath 上传 OSS 并替换为远程 URL
 */
const props = withDefaults(defineProps<{
  modelValue: string[]
  max?: number
}>(), {
  max: 9,
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

function chooseImage() {
  const remain = props.max - props.modelValue.length
  uni.chooseImage({
    count: remain,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success(res) {
      // TODO: 后端就绪后在此处上传至 OSS，替换 tempFilePaths 为远程 URL
      const newList = [...props.modelValue, ...res.tempFilePaths]
      emit('update:modelValue', newList)
    },
  })
}

function remove(index: number) {
  const newList = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newList)
}

function previewImage(index: number) {
  uni.previewImage({
    current: props.modelValue[index],
    urls: props.modelValue,
  })
}
</script>

<style lang="scss" scoped>
.upload-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

$item-size: 90px;

.upload-item {
  position: relative;
  width: $item-size;
  height: $item-size;
  border-radius: 10px;
  overflow: hidden;
}
.upload-img {
  width: 100%;
  height: 100%;
}
.upload-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-delete-icon {
  font-size: 12px;
  color: #fff;
  line-height: 1;
}

.upload-add {
  width: $item-size;
  height: $item-size;
  border-radius: 10px;
  border: 2px dashed #c8d0da;
  background: #f7f9fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
}
.upload-add-icon {
  font-size: 28px;
  color: #9aa5b4;
  line-height: 1;
}
.upload-add-text {
  font-size: 14px;
  color: #6b7b8d;
}
.upload-add-hint {
  font-size: 12px;
  color: #b0bac4;
}
</style>
