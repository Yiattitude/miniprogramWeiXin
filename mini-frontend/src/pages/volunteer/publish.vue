<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="form-card">
      <view class="form-item">
        <text class="form-label">活动名称 <text class="required">*</text></text>
        <input class="form-input" v-model="form.name" placeholder="请输入活动名称" maxlength="50" />
      </view>

      <view class="form-item">
        <text class="form-label">活动分类 <text class="required">*</text></text>
        <picker mode="selector" :range="categories" @change="onCategoryChange">
          <view class="picker-display" :class="{ placeholder: !form.category }">
            {{ form.category || '请选择活动分类' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">活动地点 <text class="required">*</text></text>
        <input class="form-input" v-model="form.location" placeholder="请输入活动地点" maxlength="100" />
      </view>

      <view class="form-item">
        <text class="form-label">开始时间 <text class="required">*</text></text>
        <view class="time-row">
          <picker mode="date" :value="form.startDate" @change="onStartDateChange">
            <view class="picker-display" :class="{ placeholder: !form.startDate }">
              {{ form.startDate || '选择日期' }}
            </view>
          </picker>
          <picker mode="time" :value="form.startClock" @change="onStartClockChange">
            <view class="picker-display" :class="{ placeholder: !form.startClock }">
              {{ form.startClock || '选择时间' }}
            </view>
          </picker>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">结束时间 <text class="required">*</text></text>
        <view class="time-row">
          <picker mode="date" :value="form.endDate" @change="onEndDateChange">
            <view class="picker-display" :class="{ placeholder: !form.endDate }">
              {{ form.endDate || '选择日期' }}
            </view>
          </picker>
          <picker mode="time" :value="form.endClock" @change="onEndClockChange">
            <view class="picker-display" :class="{ placeholder: !form.endClock }">
              {{ form.endClock || '选择时间' }}
            </view>
          </picker>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">名额上限 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model.number="form.maxCount"
          type="number"
          placeholder="请输入活动人数上限"
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
import { useAuth } from '@/composables/useAuth'

const { requireLogin } = useAuth()

const categories = ['传承红色文化', '参与基层治理', '服务企业发展', '实施以老助老', '其他服务']

const form = ref({
  name: '',
  category: '',
  location: '',
  startDate: '',
  startClock: '',
  endDate: '',
  endClock: '',
  maxCount: 0,
  description: '',
})

const submitting = ref(false)

function onCategoryChange(e: any) {
  form.value.category = categories[e.detail.value]
}

function onStartDateChange(e: any) {
  form.value.startDate = e.detail.value
}

function onStartClockChange(e: any) {
  form.value.startClock = e.detail.value
}

function onEndDateChange(e: any) {
  form.value.endDate = e.detail.value
}

function onEndClockChange(e: any) {
  form.value.endClock = e.detail.value
}

function toIsoString(dateStr: string, timeStr: string) {
  if (!dateStr || !timeStr) return ''
  const parts = dateStr.split('-').map(Number)
  const tparts = timeStr.split(':').map(Number)
  if (parts.length !== 3 || tparts.length < 2) return ''
  const dt = new Date(parts[0], parts[1] - 1, parts[2], tparts[0], tparts[1], 0)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString()
}

async function onSubmit() {
  const ok = await requireLogin({
    content: '发布活动需要先登录，是否立即登录？'
  })
  if (!ok) return

  const { name, category, location, startDate, startClock, endDate, endClock, maxCount } = form.value
  if (!name.trim()) return uni.showToast({ title: '请填写活动名称', icon: 'none' })
  if (!category) return uni.showToast({ title: '请选择活动分类', icon: 'none' })
  if (!location.trim()) return uni.showToast({ title: '请填写活动地点', icon: 'none' })
  if (!startDate || !startClock) return uni.showToast({ title: '请选择开始日期和时间', icon: 'none' })
  if (!endDate || !endClock) return uni.showToast({ title: '请选择结束日期和时间', icon: 'none' })
  if (!maxCount || maxCount <= 0) return uni.showToast({ title: '请填写正确的名额上限', icon: 'none' })

  const startTime = toIsoString(startDate, startClock)
  const endTime = toIsoString(endDate, endClock)
  if (!startTime || !endTime) return uni.showToast({ title: '时间格式不合法', icon: 'none' })
  if (new Date(startTime).getTime() >= new Date(endTime).getTime()) {
    return uni.showToast({ title: '结束时间必须晚于开始时间', icon: 'none' })
  }

  submitting.value = true
  try {
    await publishActivity({
      name: name.trim(),
      category,
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
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding: 16px;
  padding-bottom: 44px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.form-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 24px rgba(29, 55, 107, 0.1);
  animation: riseIn 0.45s ease-out both;
}

.form-item {
  padding: 18px 0;
  border-bottom: 1px solid #f0f2f5;

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  display: block;
  font-size: 15px;
  color: #1c2431;
  font-weight: 700;
  margin-bottom: 12px;
}

.required {
  color: #e74c3c;
}

.form-input {
  width: 100%;
  height: 48px;
  background: #f7f9fc;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 15px;
  color: #1c2431;
  box-sizing: border-box;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.form-input:focus {
  background: #fff;
  border-color: #2f62c6;
  box-shadow: 0 0 0 3px rgba(47, 98, 198, 0.1);
}

.form-textarea {
  width: 100%;
  min-height: 120px;
  background: #f7f9fc;
  border-radius: 12px;
  padding: 14px;
  font-size: 15px;
  color: #1c2431;
  box-sizing: border-box;
  line-height: 1.6;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.form-textarea:focus {
  background: #fff;
  border-color: #2f62c6;
  box-shadow: 0 0 0 3px rgba(47, 98, 198, 0.1);
}

.picker-display {
  height: 48px;
  line-height: 48px;
  background: #f7f9fc;
  border-radius: 12px;
  padding: 0 14px;
  font-size: 15px;
  color: #1c2431;
  transition: all 0.2s ease;

  &.placeholder {
    color: #a0aab5;
  }
}

.time-row {
  display: flex;
  gap: 12px;
}

.time-row .picker-display {
  flex: 1;
}

.btn-group {
  margin-top: 32px;
  animation: riseIn 0.45s ease-out both;
  animation-delay: 0.1s;
}

.btn-submit {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #2f62c6 0%, #3e7ae4 100%);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  border-radius: 26px;
  border: none;
  letter-spacing: 2px;
  box-shadow: 0 8px 20px rgba(47, 98, 198, 0.3);
  transition: all 0.3s ease;
}

.btn-submit:active {
  transform: scale(0.98);
}

@keyframes riseIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
