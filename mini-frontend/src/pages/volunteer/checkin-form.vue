<script setup lang="ts">
/**
 * @page volunteer/checkin-form
 * @description 打卡填报：服务时长、服务人数、现场照片（uv-upload）、备注
 * 路由参数：activityId
 */
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'

const volunteerStore = useVolunteerStore()

// 路由参数（通过 onLoad 正确获取）
const activityId = ref('')

// 活动标题（用于顶部展示）
const activityName = ref('')

// 表单数据
const serviceHours = ref('')
const serviceCount = ref('')
const remark = ref('')
const fileList = ref<{ url: string }[]>([])

// 提交状态
const submitting = ref(false)

// 校验错误
const errors = ref<Record<string, string>>({})

onLoad(async (options) => {
  const id = options?.activityId as string ?? ''
  activityId.value = id
  if (!id) return
  try {
    const activity = await volunteerStore.fetchActivityById(id)
    activityName.value = activity.name
  } catch (e) {
    console.error('[checkin-form] fetchActivityById error:', e)
  }
})

function validate(): boolean {
  errors.value = {}
  const hours = parseFloat(serviceHours.value)
  if (!serviceHours.value) {
    errors.value.hours = '请填写服务时长'
  } else if (isNaN(hours) || hours < 0.5 || hours > 24) {
    errors.value.hours = '服务时长须在 0.5 ~ 24 小时之间'
  } else if ((hours * 10) % 5 !== 0) {
    errors.value.hours = '步长为 0.5 小时'
  }
  const count = parseInt(serviceCount.value)
  if (!serviceCount.value) {
    errors.value.count = '请填写服务人数'
  } else if (isNaN(count) || count < 1) {
    errors.value.count = '服务人数至少 1 人'
  }
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return
  submitting.value = true
  try {
    await volunteerStore.submitCheckin({
      activityId: activityId.value,
      serviceHours: parseFloat(serviceHours.value),
      serviceCount: parseInt(serviceCount.value),
      photos: fileList.value.map(f => f.url),
      remark: remark.value || undefined,
    })
    uni.showToast({ title: '打卡成功！', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (e) {
    console.error('[checkin-form] submitCheckin error:', e)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view class="page">
    <!-- 活动标题条 -->
    <view v-if="activityName" class="activity-bar">
      <text class="activity-name">{{ activityName }}</text>
    </view>

    <view class="form-wrap">
      <!-- 服务时长 -->
      <view class="form-item">
        <text class="form-label">服务时长 <text class="required">*</text></text>
        <view class="input-wrap" :class="{ 'input-error': errors.hours }">
          <input
            class="form-input"
            v-model="serviceHours"
            type="digit"
            placeholder="请输入服务时长（小时，步长 0.5）"
            placeholder-class="placeholder"
          />
          <text class="input-unit">小时</text>
        </view>
        <text v-if="errors.hours" class="error-msg">{{ errors.hours }}</text>
        <text class="form-hint">范围 0.5 ~ 24 小时，步长 0.5</text>
      </view>

      <!-- 服务人数 -->
      <view class="form-item">
        <text class="form-label">服务人数 <text class="required">*</text></text>
        <view class="input-wrap" :class="{ 'input-error': errors.count }">
          <input
            class="form-input"
            v-model="serviceCount"
            type="number"
            placeholder="请输入服务人数"
            placeholder-class="placeholder"
          />
          <text class="input-unit">人</text>
        </view>
        <text v-if="errors.count" class="error-msg">{{ errors.count }}</text>
      </view>

      <!-- 现场照片 -->
      <view class="form-item">
        <text class="form-label">现场照片</text>
        <text class="form-hint" style="margin-bottom: 8px;">最多 9 张，单张 ≤ 5MB</text>
        <uv-upload
          v-model:fileList="fileList"
          :max-count="9"
          :max-size="5 * 1024 * 1024"
          upload-icon="camera"
          :preview-full-image="true"
        />
      </view>

      <!-- 备注 -->
      <view class="form-item">
        <text class="form-label">备注（可选）</text>
        <view class="textarea-wrap">
          <textarea
            class="form-textarea"
            v-model="remark"
            placeholder="填写本次志愿服务的感受或备注"
            placeholder-class="placeholder"
            maxlength="200"
            auto-height
          />
          <text class="char-count">{{ remark.length }}/200</text>
        </view>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="bottom-bar">
      <view
        class="btn-submit"
        :class="{ 'btn-loading': submitting }"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交打卡' }}
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #f0f2f5);
  padding-bottom: 100px;
}

/* 活动标题条 */
.activity-bar {
  background: var(--color-primary-bg, #eef3fc);
  padding: var(--space-sm, 12px) var(--space-md, 16px);
  border-bottom: 1px solid var(--color-border, #e2e7ec);
}
.activity-name {
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-primary, #3a7bd5);
}

/* 表单 */
.form-wrap {
  padding: var(--space-sm, 12px) var(--space-md, 16px);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 12px);
}
.form-item {
  background: #fff;
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.form-label {
  display: block;
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  margin-bottom: 10px;
}
.required { color: var(--color-danger, #e74c3c); }
.form-hint {
  display: block;
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
  margin-top: 4px;
}

/* 输入框 */
.input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--color-border, #e2e7ec);
  border-radius: var(--radius-sm, 6px);
  padding: 0 12px;
  height: 52px;
  gap: 8px;
  &.input-error { border-color: var(--color-danger, #e74c3c); }
}
.form-input {
  flex: 1;
  font-size: var(--font-base, 17px);
  color: var(--color-text-main, #1e2a3a);
}
.input-unit {
  font-size: var(--font-sm, 15px);
  color: var(--color-text-sub, #6b7b8d);
  flex-shrink: 0;
}
.error-msg {
  display: block;
  font-size: var(--font-xs, 13px);
  color: var(--color-danger, #e74c3c);
  margin-top: 4px;
}
.placeholder { color: var(--color-text-muted, #a0aab5); }

/* 文本域 */
.textarea-wrap {
  border: 1.5px solid var(--color-border, #e2e7ec);
  border-radius: var(--radius-sm, 6px);
  padding: 12px;
}
.form-textarea {
  width: 100%;
  min-height: 100px;
  font-size: var(--font-base, 17px);
  color: var(--color-text-main, #1e2a3a);
  line-height: 1.6;
}
.char-count {
  display: block;
  text-align: right;
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
  margin-top: 4px;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: #fff;
  padding: var(--space-sm, 12px) var(--space-md, 16px);
  padding-bottom: calc(var(--space-sm, 12px) + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 8px rgba(0,0,0,0.06);
}
.btn-submit {
  width: 100%;
  height: 52px;
  line-height: 52px;
  text-align: center;
  background: var(--color-primary, #3a7bd5);
  color: #fff;
  font-size: var(--font-lg, 19px);
  font-weight: 600;
  border-radius: var(--radius-md, 10px);
  &.btn-loading { opacity: 0.7; }
}
</style>
