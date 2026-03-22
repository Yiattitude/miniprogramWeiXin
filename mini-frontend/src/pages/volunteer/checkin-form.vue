<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view v-if="activityName" class="activity-bar">
      <text class="activity-name">{{ activityName }}</text>
    </view>

    <view class="form-wrap">
      <view class="form-item">
        <text class="form-label">申报积分 <text class="required">*</text></text>
        <view class="input-wrap" :class="{ 'input-error': errors.points }">
          <input 
            class="form-input" 
            type="number" 
            placeholder="请输入申报积分" 
            placeholder-class="placeholder" 
            v-model="declaredPoints"
          />
          <text class="input-unit">分</text>
        </view>
        <text v-if="errors.points" class="error-msg">{{ errors.points }}</text>
        <text class="form-hint" v-if="activityCategory">
          当前活动分类: {{ activityCategory }} (可申报 {{ pointsLimitText }} 分)
        </text>
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
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useVolunteerStore } from '@/stores/volunteer'
import { useAuth } from '@/composables/useAuth'

const volunteerStore = useVolunteerStore()
const { requireLogin } = useAuth()
const activityId = ref('')
const activityName = ref('')
const activityCategory = ref('')
const declaredPoints = ref('')
const remark = ref('')
const fileList = ref<any[]>([])
const submitting = ref(false)
const errors = ref<Record<string, string>>({})

const pointsLimitText = computed(() => {
  const cat = activityCategory.value
  if (cat === '传承红色文化' || cat === '服务企业发展') return '3-10'
  return '1-5' // 参与基层治理, 实施以老助老, 其他服务
})

onLoad(async (options: any) => {
  const id = options?.activityId || ''
  activityId.value = id
  if (!id) return

  try {
    const activity = await volunteerStore.fetchActivityById(id)
    activityName.value = activity.name
    activityCategory.value = activity.category || '其他服务'
  } catch (e) {
    console.error('[checkin-form] fetchActivity error:', e)
  }
})

function validate() {
  errors.value = {}
  const points = parseInt(declaredPoints.value)
  if (!declaredPoints.value) {
    errors.value.points = '请填写申报积分'
  } else if (isNaN(points)) {
    errors.value.points = '申报积分必须为数字'
  } else {
    let min = 1
    let max = 5
    const cat = activityCategory.value
    if (cat === '传承红色文化' || cat === '服务企业发展') {
      min = 3
      max = 10
    }
    if (points < min || points > max) {
      errors.value.points = `申报积分须在 ${min} ~ ${max} 之间`
    }
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  const ok = await requireLogin({
    content: '提交打卡需要先登录，是否立即登录？'
  })
  if (!ok) return

  if (!validate()) return
  submitting.value = true
  try {
    // 处理上传图片逻辑（这里简化，实际开发中可能需要先上传到云存储）
    const photoUrls = fileList.value.map(f => f.url || f.path)
    
    await volunteerStore.submitCheckin({
      activityId: activityId.value,
      declaredPoints: parseInt(declaredPoints.value),
      activityCategory: activityCategory.value,
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
