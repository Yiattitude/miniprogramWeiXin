<template>
  <view class="page">
    <view v-if="activityName" class="activity-bar">
      <text class="activity-name">{{ activityName }}</text>
    </view>

    <view class="form-wrap">
      <view class="form-item">
        <text class="form-label">服务时长 <text class="required">*</text></text>
        <view class="input-wrap" :class="{ 'input-error': errors.hours }">
          <input 
            class="form-input" 
            type="digit" 
            placeholder="请输入服务时长（小时，步长 0.5）" 
            placeholder-class="placeholder" 
            v-model="serviceHours"
          />
          <text class="input-unit">小时</text>
        </view>
        <text v-if="errors.hours" class="error-msg">{{ errors.hours }}</text>
        <text class="form-hint">范围 0.5 ~ 24 小时，步长 0.5</text>
      </view>

      <view class="form-item">
        <text class="form-label">服务人数 <text class="required">*</text></text>
        <view class="input-wrap" :class="{ 'input-error': errors.count }">
          <input 
            class="form-input" 
            type="number" 
            placeholder="请输入服务人数" 
            placeholder-class="placeholder" 
            v-model="serviceCount"
          />
          <text class="input-unit">人</text>
        </view>
        <text v-if="errors.count" class="error-msg">{{ errors.count }}</text>
      </view>

      <view class="form-item">
        <text class="form-label">现场照片</text>
        <text class="form-hint" style="margin-bottom: 8px">最多 9 张，单张 ≤ 5MB</text>
        <uv-upload 
          :max-count="9"
          :max-size="5 * 1024 * 1024"
          upload-icon="camera"
          :preview-full-image="true"
          v-model:fileList="fileList"
        />
      </view>

      <view class="form-item">
        <text class="form-label">备注（可选）</text>
        <view class="textarea-wrap">
          <textarea 
            class="form-textarea" 
            placeholder="填写本次志愿服务的感受或备注" 
            placeholder-class="placeholder" 
            maxlength="200" 
            auto-height 
            v-model="remark"
          />
          <text class="char-count">{{ remark.length }}/200</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <button 
        class="btn-submit" 
        :class="{ 'is-loading': submitting }" 
        :disabled="submitting"
        @tap="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交打卡' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'

const volunteerStore = useVolunteerStore()
const activityId = ref('')
const activityName = ref('')
const serviceHours = ref('')
const serviceCount = ref('')
const remark = ref('')
const fileList = ref<any[]>([])
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

onLoad(async (options: any) => {
  const id = options?.activityId || ''
  activityId.value = id
  if (!id) return

  try {
    const activity = await volunteerStore.fetchActivityById(id)
    activityName.value = activity.name
  } catch (e) {
    console.error('[checkin-form] fetchActivity error:', e)
  }
})

function validate() {
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
    // 处理上传图片逻辑（这里简化，实际开发中可能需要先上传到云存储）
    const photoUrls = fileList.value.map(f => f.url || f.path)
    
    await volunteerStore.submitCheckin({
      activityId: activityId.value,
      serviceHours: parseFloat(serviceHours.value),
      serviceCount: parseInt(serviceCount.value),
      photos: photoUrls,
      remark: remark.value || undefined
    })
    
    uni.showToast({ title: '打卡成功！', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (e: any) {
    console.error('[checkin-form] submit error:', e)
  } finally {
    submitting.value = false
  }
}
</script>

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-label {
  display: block;
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  margin-bottom: 10px;
}

.required {
  color: var(--color-danger, #e74c3c);
}

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
}

.input-wrap.input-error {
  border-color: var(--color-danger, #e74c3c);
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

.placeholder {
  color: var(--color-text-muted, #a0aab5);
}

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
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.btn-submit {
  width: 100%;
  height: 48px;
  background: var(--color-primary, #3a7bd5);
  color: #fff;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 600;
  border: none;
}

.btn-submit.is-loading {
  opacity: 0.8;
}
</style>
