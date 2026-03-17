<template>
  <page-meta root-font-size="system"/>
  <view class="bind-page">
    <view class="header">
      <Icon name="user-add-line" size="64px" color="#2f62c6" />
      <text class="header-title">完善个人信息</text>
      <text class="header-sub">请填写您的真实姓名和手机号进行验证</text>
    </view>

    <form class="form-wrap" @submit="onSubmit">
      <view class="form-item">
        <text class="form-label">真实姓名 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="form.realName"
          placeholder="请输入真实姓名"
          maxlength="20"
          type="text"
        />
        <text v-if="errors.realName" class="error-msg">{{ errors.realName }}</text>
      </view>

      <view class="form-item">
        <text class="form-label">手机号码 <text class="required">*</text></text>
        <input
          class="form-input"
          v-model="form.phone"
          placeholder="请输入11位手机号码"
          maxlength="11"
          type="number"
        />
        <text v-if="errors.phone" class="error-msg">{{ errors.phone }}</text>
      </view>

      <view class="form-actions">
        <button
          class="submit-btn"
          form-type="submit"
          :disabled="loading"
          :loading="loading"
        >
          {{ loading ? '验证中...' : '确认绑定' }}
        </button>

        <button
          class="cancel-btn"
          @tap="onCancel"
          :disabled="loading"
        >
          取消
        </button>
      </view>
    </form>

    <view class="tip-section">
      <text class="tip-title">温馨提示</text>
      <text class="tip-content">
        • 请确保填写的信息与银发人才库记录一致{'\n'}
        • 手机号将用于身份验证和活动通知{'\n'}
        • 信息仅用于平台认证，我们会严格保密
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Icon from '@/components/common/Icon.vue'

const emit = defineEmits(['bind-success', 'cancel'])

const loading = ref(false)
const form = reactive({
  realName: '',
  phone: ''
})

const errors = reactive({
  realName: '',
  phone: ''
})

// 实时表单验证
watch(() => form.realName, validateRealName)
watch(() => form.phone, validatePhone)

function validateRealName(value: string) {
  if (!value.trim()) {
    errors.realName = '请输入真实姓名'
  } else if (value.length < 2) {
    errors.realName = '姓名至少2个字符'
  } else if (!/^[\u4e00-\u9fa5]{2,}$/.test(value)) {
    errors.realName = '请输入正确的中文姓名'
  } else {
    errors.realName = ''
  }
}

function validatePhone(value: string) {
  if (!value) {
    errors.phone = '请输入手机号码'
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    errors.phone = '请输入正确的手机号码'
  } else {
    errors.phone = ''
  }
}

function validateForm(): boolean {
  validateRealName(form.realName)
  validatePhone(form.phone)

  return !errors.realName && !errors.phone && form.realName && form.phone
}

async function onSubmit() {
  if (!validateForm()) {
    uni.showToast({
      title: '请检查输入信息',
      icon: 'none'
    })
    return
  }

  loading.value = true

  try {
    // TODO: 调用后端API验证用户信息
    const result = await bindUserInfo({
      realName: form.realName,
      phone: form.phone
    })

    if (result.success) {
      uni.showToast({
        title: '绑定成功',
        icon: 'success'
      })
      emit('bind-success', result.token)
    } else {
      uni.showToast({
        title: result.message || '绑定失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

function onCancel() {
  emit('cancel')
}

// 模拟API调用
async function bindUserInfo(data: any) {
  // TODO: 实现实际的API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        token: 'mock_binding_token_' + Date.now(),
        message: '绑定成功'
      })
    }, 1500)
  })
}
</script>

<style lang="scss" scoped>
.bind-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 100%);
  padding-bottom: 44px;
}

.header {
  text-align: center;
  padding: 60px 32px 40px;

  .header-title {
    display: block;
    font-size: 32rpx;
    font-weight: 700;
    color: #1c2431;
    margin: 24px 0 12px 0;
  }

  .header-sub {
    font-size: 26rpx;
    color: #7a8797;
    line-height: 1.5;
  }
}

.form-wrap {
  margin: 0 32px;
  background: #fff;
  border-radius: 24rpx;
  padding: 32px 24px;
  box-shadow: 0 8px 32px rgba(20, 28, 46, 0.08);
}

.form-item {
  margin-bottom: 32px;

  .form-label {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #1c2431;
    margin-bottom: 12px;

    .required {
      color: #ff4d4f;
      margin-left: 4px;
    }
  }

  .form-input {
    width: 100%;
    height: 88rpx;
    border: 2px solid #e6ebf2;
    border-radius: 16rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #1c2431;
    background: #fff;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: #2f62c6;
      outline: none;
    }

    &.input-error {
      border-color: #ff4d4f;
    }
  }

  .error-msg {
    display: block;
    font-size: 24rpx;
    color: #ff4d4f;
    margin-top: 8px;
  }
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;

  .submit-btn {
    height: 88rpx;
    background: linear-gradient(135deg, #2f62c6 0%, #3e7ae4 100%);
    color: #fff;
    border-radius: 44rpx;
    font-size: 28rpx;
    font-weight: 600;
    transition: transform 0.2s ease;

    &:active:not(:disabled) {
      transform: scale(0.98);
    }

    &[disabled] {
      opacity: 0.6;
    }
  }

  .cancel-btn {
    height: 88rpx;
    background: #f5f7fa;
    color: #7a8797;
    border-radius: 44rpx;
    font-size: 28rpx;
    font-weight: 600;
  }
}

.tip-section {
  margin: 40px 32px 0;
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 24px;

  .tip-title {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: #2f62c6;
    margin-bottom: 12px;
  }

  .tip-content {
    font-size: 24rpx;
    color: #7a8797;
    line-height: 1.6;
  }
}
</style>