<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="honor-card">
      <view class="honor-title">荣誉上传</view>
      <view class="form-item">
        <text class="form-label">荣誉级别 <text class="required">*</text></text>
        <picker mode="selector" :range="honorLevels" @change="onHonorChange">
          <view class="picker-display" :class="{ placeholder: !selectedHonor }">
            {{ selectedHonor || '请选择荣誉级别' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="form-label">对应积分</text>
        <view class="points-display">{{ honorPoints }} 分</view>
      </view>

      <view class="form-item">
        <text class="form-label">荣誉证明（图片或文件）</text>
        <text class="form-hint">图片最多 9 张；文件单个建议 ≤ 10MB</text>
        <uv-upload
          v-model:fileList="honorImages"
          :max-count="9"
          :max-size="10 * 1024 * 1024"
          upload-icon="camera"
          :preview-full-image="true"
        />
        <view class="proof-actions">
          <button class="proof-btn" @tap="chooseHonorFiles">上传文件</button>
        </view>
        <view v-if="honorFiles.length > 0" class="proof-files">
          <view v-for="(file, idx) in honorFiles" :key="file.path || idx" class="proof-file">
            <Icon name="file-text-line" size="16px" color="#6b7b8d" />
            <text class="proof-name">{{ file.name }}</text>
            <Icon class="proof-remove" name="close-line" size="16px" color="#c0392b" @tap="removeHonorFile(idx)" />
          </view>
        </view>
      </view>

      <button class="honor-submit" :disabled="honorSubmitting" @tap="submitHonor">
        {{ honorSubmitting ? '提交中...' : '提交荣誉信息' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { submitHonor as submitHonorApi } from '@/api/volunteer'
import { useAuth } from '@/composables/useAuth'
import { useUserStore } from '@/stores/user'

const honorSubmitting = ref(false)

// 荣誉级别与积分映射（固定业务规则）
const honorLevels = ['国家级荣誉', '省部级荣誉', '厅局级荣誉', '厂处级荣誉']
const honorMap: Record<string, number> = {
  '国家级荣誉': 20,
  '省部级荣誉': 16,
  '厅局级荣誉': 12,
  '厂处级荣誉': 10
}
const selectedHonor = ref('')
const honorPoints = ref(0)
const honorImages = ref<any[]>([])
const honorFiles = ref<Array<{ name: string; path: string; size?: number }>>([])

const { requireLogin } = useAuth()
const userStore = useUserStore()

function onHonorChange(e: any) {
  const level = honorLevels[e.detail.value]
  selectedHonor.value = level
  honorPoints.value = honorMap[level] || 0
}

function chooseHonorFiles() {
  uni.chooseMessageFile({
    count: 3,
    type: 'file',
    success(res) {
      const list = Array.isArray(res.tempFiles) ? res.tempFiles : []
      const mapped = list.map(item => ({
        name: item.name || '未命名文件',
        path: item.path,
        size: item.size
      }))
      honorFiles.value = [...honorFiles.value, ...mapped]
    }
  })
}

function removeHonorFile(index: number) {
  const list = [...honorFiles.value]
  list.splice(index, 1)
  honorFiles.value = list
}

// 提交荣誉信息
async function submitHonor() {
  const ok = await requireLogin({
    content: '提交荣誉信息需要先登录，是否立即登录？'
  })
  if (!ok) return

  if (!selectedHonor.value) {
    uni.showToast({ title: '请选择荣誉级别', icon: 'none' })
    return
  }

  const userInfo = userStore.userInfo || {}
  const userId = userInfo._id || userInfo.userId || userInfo.id || userInfo._openid || ''

  honorSubmitting.value = true
  try {
    const proofs = [
      ...honorImages.value.map(item => item.url || item.path).filter(Boolean),
      ...honorFiles.value.map(item => item.path).filter(Boolean)
    ]

    await submitHonorApi({
      userId,
      honorLevel: selectedHonor.value,
      honorPoints: honorPoints.value,
      proofs
    })

    uni.showToast({ title: '提交成功，等待审核', icon: 'success' })
    selectedHonor.value = ''
    honorPoints.value = 0
    honorImages.value = []
    honorFiles.value = []
  } catch (err: any) {
    uni.showToast({ title: err?.message || '提交失败，请重试', icon: 'none' })
  } finally {
    honorSubmitting.value = false
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

.honor-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 12px 24px rgba(29, 55, 107, 0.1);
  animation: riseIn 0.45s ease-out both;
}

.honor-title {
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
  margin-bottom: 16px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  color: #1c2431;
  font-weight: 700;
  margin-bottom: 10px;
}

.required {
  color: #e74c3c;
}

.form-hint {
  display: block;
  font-size: 12px;
  color: #7a8797;
  margin-bottom: 10px;
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
}

.picker-display.placeholder {
  color: #a0aab5;
}

.points-display {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  background: #f7f9fc;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #2f62c6;
}

.proof-actions {
  margin-top: 10px;
  display: flex;
  gap: 12px;
}

.proof-btn {
  flex: 1;
  height: 42px;
  line-height: 42px;
  border-radius: 10px;
  background: #eef6ff;
  color: #3a7bd5;
  font-size: 14px;
  font-weight: 600;
}

.proof-files {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.proof-file {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #f7f9fc;
  border-radius: 10px;
}

.proof-name {
  flex: 1;
  font-size: 13px;
  color: #5b6774;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.proof-remove {
  padding: 4px;
}

.honor-submit {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, #2f62c6 0%, #3e7ae4 100%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  border-radius: 26px;
  border: none;
  box-shadow: 0 8px 20px rgba(47, 98, 198, 0.3);
  letter-spacing: 1px;
  transition: all 0.2s ease;
}

.honor-submit:active {
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
