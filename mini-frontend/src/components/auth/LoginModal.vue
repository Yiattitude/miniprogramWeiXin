<template>
  <view class="login-modal" :class="{ show }">
    <view class="modal-mask"></view>
    <view class="modal-content">
      <view class="btn-group">
        <button
          class="login-btn admin-btn"
          :disabled="!agreed"
          :class="{ 'is-disabled': !agreed }"
          @tap="handleAdminEntry"
        >
          管理员入口
        </button>

        <button
          class="login-btn one-key-btn"
          :type="'primary' as any"
          open-type="getUserInfo"
          :disabled="!agreed"
          :class="{ 'is-disabled': !agreed }"
          @getuserinfo="handleLogin"
        >
          一键登录
        </button>
      </view>

      <view class="modal-tip" @tap="toggleAgree">
        <view class="agree-box" :class="{ checked: agreed }" aria-hidden="true">
          <view v-if="agreed" class="check-mark" />
        </view>
        <view class="tip-text">
          <text>点击登录即表示同意</text>
          <text class="tip-link">《服务协议》</text>
          <text>和</text>
          <text class="tip-link">《隐私政策》</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'wechat-code', code: string): void
  (e: 'admin'): void
  (e: 'close'): void
}>()

// 该组件被渲染出来（v-if）时，默认就应显示弹窗
const show = ref(true)
// 默认同意协议（可点击取消/再勾选）
const agreed = ref(true)

function open() {
  show.value = true
}

function close() {
  show.value = false
  emit('close')
}

async function handleLogin() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意服务协议与隐私政策', icon: 'none' })
    return
  }
  try {
    // 1. 调用微信小程序登录API
    const loginResult = await uni.login({
      provider: 'weixin'
    })

    if (loginResult.code) {
      emit('wechat-code', loginResult.code)
      close()
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  }
}

function handleAdminEntry() {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意服务协议与隐私政策', icon: 'none' })
    return
  }
  emit('admin')
}

function toggleAgree() {
  agreed.value = !agreed.value
}

defineExpose({ open, close })
</script>

<style lang="scss" scoped>
.login-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s ease;

  &.show {
    opacity: 1;
    pointer-events: auto;
  }

  .modal-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.62);
  }

    .modal-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    width: 88%;
    max-width: 620rpx;
    background: linear-gradient(180deg, #ffffff 0%, #f5f8ff 100%);
    border-radius: 32rpx;
    padding: 64rpx 44rpx 64rpx;
    text-align: center;
      box-shadow:
        0 20px 60px rgba(15, 35, 80, 0.18),
        inset 0 0 0 1px rgba(31, 79, 178, 0.04);
      min-height: 420rpx;
      display: flex;
      flex-direction: column;

    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .login-btn {
      width: 100%;
      min-height: 48px;
      height: 48px;
      border-radius: 26px;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 2rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0;
      transition: transform 0.2s ease;

      &.is-disabled {
        opacity: 0.6;
      }

      &:active {
        transform: scale(0.98);
      }
    }

    .admin-btn {
      background: #0b2fa8;
      color: #fff;
      box-shadow: 0 12px 24px rgba(11, 47, 168, 0.24);
    }

    .one-key-btn {
      background: #2fb14b;
      color: #fff;
      box-shadow: 0 12px 24px rgba(47, 177, 75, 0.22);
    }

    .modal-tip {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #475569;
      line-height: 1.6;
      padding: 10px 0 0;
      flex-wrap: nowrap;
      margin-top: auto;

      .agree-box {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid #7a8797;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-top: 2px;

        &.checked {
          border-color: #2f62c6;
          background: rgba(47, 98, 198, 0.08);
        }
      }

      .check-mark {
        width: 8px;
        height: 12px;
        border-right: 3px solid #2f62c6;
        border-bottom: 3px solid #2f62c6;
        transform: rotate(45deg);
        margin-top: -2px;
      }

      .tip-text {
        display: flex;
        justify-content: center;
        flex-wrap: nowrap;
        gap: 8rpx;
        
        text-align: left;
        white-space: nowrap;
      }

      .tip-link {
        color: #1f5ed6;
        font-weight: 700;
      }
    }
  }
}
</style>
