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
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 48%, #e9eef5 100%);
  padding-bottom: 100px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* 活动标题条 */
.activity-bar {
  background: linear-gradient(135deg, #eef6ff 0%, #e0efff 100%);
  padding: 14px 16px;
  box-shadow: 0 2px 12px rgba(47, 98, 198, 0.08);
}

.activity-name {
  font-size: 16px;
  font-weight: 700;
  color: #2f62c6;
}

/* 表单 */
.form-wrap {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-item {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 20px rgba(20, 28, 46, 0.08);
  animation: riseIn 0.45s ease-out both;
}

.form-item:nth-child(1) { animation-delay: 0.05s; }
.form-item:nth-child(2) { animation-delay: 0.1s; }
.form-item:nth-child(3) { animation-delay: 0.15s; }
.form-item:nth-child(4) { animation-delay: 0.2s; }

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 12px;
}

.required {
  color: #e74c3c;
}

.form-hint {
  display: block;
  font-size: 13px;
  color: #7a8797;
  margin-top: 6px;
  line-height: 1.5;
}

/* 输入框 */
.input-wrap {
  display: flex;
  align-items: center;
  border: 2px solid #e6ebf2;
  border-radius: 12px;
  padding: 0 14px;
  height: 52px;
  gap: 8px;
  background: #f7f9fc;
  transition: all 0.2s ease;
}

.input-wrap:focus-within {
  border-color: #2f62c6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(47, 98, 198, 0.1);
}

.input-wrap.input-error {
  border-color: #e74c3c;
  background: #fff5f5;
}

.form-input {
  flex: 1;
  font-size: 16px;
  color: #1c2431;
  background: transparent;
}

.input-unit {
  font-size: 14px;
  color: #7a8797;
  flex-shrink: 0;
  font-weight: 500;
}

.error-msg {
  display: block;
  font-size: 13px;
  color: #e74c3c;
  margin-top: 6px;
  font-weight: 500;
}

.placeholder {
  color: #a0aab5;
}

/* 文本域 */
.textarea-wrap {
  border: 2px solid #e6ebf2;
  border-radius: 12px;
  padding: 14px;
  background: #f7f9fc;
  transition: all 0.2s ease;
}

.textarea-wrap:focus-within {
  border-color: #2f62c6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(47, 98, 198, 0.1);
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  font-size: 15px;
  color: #1c2431;
  line-height: 1.6;
  background: transparent;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #a0aab5;
  margin-top: 6px;
}

/* 底部按钮 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: linear-gradient(to top, #fff 80%, rgba(255, 255, 255, 0.9));
  box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(10px);
}

.btn-submit {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, #2f62c6 0%, #3e7ae4 100%);
  color: #fff;
  border-radius: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 700;
  border: none;
  box-shadow: 0 8px 20px rgba(47, 98, 198, 0.3);
  transition: all 0.3s ease;
  letter-spacing: 1px;
}

.btn-submit:active {
  transform: scale(0.98);
}

.btn-submit.is-loading {
  opacity: 0.8;
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
