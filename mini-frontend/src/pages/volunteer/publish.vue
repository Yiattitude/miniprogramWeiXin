<template>
  <view class="page">
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">活动名称 <text class="required">*</text></text>
        <input class="form-input" v-model="form.name" placeholder="请输入活动名称" maxlength="50" />
      </view>

      <view class="form-item">
        <text class="form-label">活动地点 <text class="required">*</text></text>
        <input class="form-input" v-model="form.location" placeholder="请输入活动地点" maxlength="100" />
      </view>

      <view class="form-item">
        <text class="form-label">开始时间 <text class="required">*</text></text>
        <picker mode="dateTime" :value="form.startTime" @change="onStartTimeChange">
          <view class="picker-display" :class="{ placeholder: !form.startTime }">
            {{ form.startTime || '请选择开始时间' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">结束时间 <text class="required">*</text></text>
        <picker mode="dateTime" :value="form.endTime" @change="onEndTimeChange">
          <view class="picker-display" :class="{ placeholder: !form.endTime }">
            {{ form.endTime || '请选择结束时间' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">名额上限 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model.number="form.maxCount"
          type="number"
          placeholder="请输入报名人数上限"
        />
      </view>

      <view class="form-item">
        <text class="form-label">活动简介</text>
        <textarea
          class="form-textarea"
          v-model="form.description"
          placeholder="请输入活动简介（选填）"
          maxlength="500"
          auto-height
        />
      </view>
    </view>

    <view class="btn-group">
      <button class="btn-submit" :loading="submitting" @tap="onSubmit">发 布 活 动</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { publishActivity } from '../../api/volunteer'

const form = ref({
  name: '',
  location: '',
  startTime: '',
  endTime: '',
  maxCount: 0,
  description: '',
})

const submitting = ref(false)

function onStartTimeChange(e: any) {
  form.value.startTime = e.detail.value
}

function onEndTimeChange(e: any) {
  form.value.endTime = e.detail.value
}

async function onSubmit() {
  const { name, location, startTime, endTime, maxCount } = form.value
  if (!name.trim()) return uni.showToast({ title: '请填写活动名称', icon: 'none' })
  if (!location.trim()) return uni.showToast({ title: '请填写活动地点', icon: 'none' })
  if (!startTime) return uni.showToast({ title: '请选择开始时间', icon: 'none' })
  if (!endTime) return uni.showToast({ title: '请选择结束时间', icon: 'none' })
  if (!maxCount || maxCount <= 0) return uni.showToast({ title: '请填写正确的名额上限', icon: 'none' })

  submitting.value = true
  try {
    await publishActivity({
      name: name.trim(),
      location: location.trim(),
      startTime,
      endTime,
      maxCount,
      description: form.value.description.trim(),
    })
    uni.showToast({ title: '发布成功', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (err: any) {
    uni.showToast({ title: err?.message || '发布失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  padding: 24rpx;
}

.form-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 16rpx;
}

.required {
  color: #e53935;
}

.form-input {
  width: 100%;
  height: 72rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.picker-display {
  height: 72rpx;
  line-height: 72rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333;

  &.placeholder {
    color: #aaa;
  }
}

.btn-group {
  margin-top: 48rpx;
}

.btn-submit {
  width: 100%;
  height: 96rpx;
  background: #3a7bd5;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  letter-spacing: 8rpx;
}
</style>
