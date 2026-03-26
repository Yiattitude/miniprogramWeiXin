<template>
  <page-meta root-font-size="system" />
  <view class="admin-login">
    <view class="panel">
      <view class="header">
        <view class="icon-wrap">
          <Icon name="user-setting-line" size="64px" color="#0b2f6b" />
        </view>
        <text class="header-title">管理员登录</text>
        <text class="header-sub">请输入管理员账号与密码</text>
      </view>

      <form class="form-wrap" @submit="onSubmit">
        <view class="form-item">
          <text class="form-label">账号 <text class="required">*</text></text>
          <input
            class="form-input"
            v-model="form.account"
            placeholder="请输入管理员账号"
            maxlength="32"
            type="text"
          />
          <text v-if="errors.account" class="error-msg">{{ errors.account }}</text>
        </view>

        <view class="form-item">
          <text class="form-label">密码 <text class="required">*</text></text>
          <input
            class="form-input"
            v-model="form.password"
            placeholder="请输入密码"
            maxlength="32"
            password
          />
          <text v-if="errors.password" class="error-msg">{{ errors.password }}</text>
        </view>

        <view class="form-actions">
          <button
            class="submit-btn"
            form-type="submit"
            :disabled="loading"
            :loading="loading"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <button
            class="cancel-btn"
            @tap="onCancel"
            :disabled="loading"
          >
            返回
          </button>
        </view>
      </form>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'
import { cloudCall } from '@/api/http'

const userStore = useUserStore()
const loading = ref(false)
const redirect = ref('/pages/admin/statistics')

const form = reactive({
  account: '',
  password: ''
})

const errors = reactive({
  account: '',
  password: ''
})

onLoad((query) => {
  const r = (query?.redirect as string) || ''
  if (r) redirect.value = decodeURIComponent(r)
})

function validateAccount(value: string) {
  if (!value.trim()) errors.account = '请输入账号'
  else errors.account = ''
}

function validatePassword(value: string) {
  if (!value.trim()) errors.password = '请输入密码'
  else errors.password = ''
}

function validateForm() {
  validateAccount(form.account)
  validatePassword(form.password)
  return !errors.account && !errors.password
}

function isTabPage(url: string) {
  return (
    url === '/pages/index/index' ||
    url === '/pages/volunteer/index' ||
    url === '/pages/volunteer/profile'
  )
}

async function onSubmit() {
  if (!validateForm()) {
    uni.showToast({ title: '请检查输入信息', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await cloudCall<{ token: string; userInfo?: any }>('adminLogin', {
      account: form.account.trim(),
      password: form.password
    })

    if (!res?.token) {
      uni.showToast({ title: '登录失败，请重试', icon: 'none' })
      return
    }

    userStore.token = res.token
    if (res.userInfo) userStore.syncUserInfo(res.userInfo)

    uni.showToast({ title: '登录成功', icon: 'success' })

    const url = redirect.value || '/pages/admin/statistics'
    if (isTabPage(url)) {
      uni.switchTab({ url })
    } else {
      uni.redirectTo({ url })
    }
  } catch (error) {
    // cloudCall 已处理提示
  } finally {
    loading.value = false
  }
}

function onCancel() {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.admin-login {
  min-height: 100vh;
  background: radial-gradient(circle at 50% -20%, #ffffff 0%, #edf3fb 45%, #e7eef7 100%);
  padding: 32px 18px 56px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.panel {
  width: 100%;
  max-width: 660rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
  border-radius: 28rpx;
  padding: 42rpx 32rpx 48rpx;
  box-shadow:
    0 18px 44px rgba(21, 40, 92, 0.16),
    inset 0 0 0 1px rgba(31, 79, 178, 0.04);
}

.header {
  text-align: center;
  padding: 10px 0 26px;

  .icon-wrap {
    width: 104rpx;
    height: 104rpx;
    border-radius: 26rpx;
    margin: 0 auto 16px;
    background: #f1f5ff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 2px rgba(31, 79, 178, 0.1);
  }

  .header-title {
    display: block;
    font-size: 33rpx;
    font-weight: 800;
    color: #0b2f6b;
    margin: 8px 0 8px 0;
  }

  .header-sub {
    font-size: 24rpx;
    color: #6a7a8c;
    line-height: 1.5;
  }
}

.form-wrap {
  margin-top: 4px;
}

.form-item {
  margin-bottom: 26px;

  .form-label {
    display: block;
    font-size: 26rpx;
    font-weight: 700;
    color: #1a2a3a;
    margin-bottom: 10px;

    .required {
      color: #ff4d4f;
      margin-left: 4px;
    }
  }

  .form-input {
    width: 100%;
    box-sizing: border-box;
    height: 84rpx;
    border: 2px solid #d4dbe6;
    border-radius: 16rpx;
    padding: 0 24rpx;
    font-size: 27rpx;
    color: #1c2431;
    background: #fff;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: #2f62c6;
      outline: none;
      box-shadow: 0 0 0 3px rgba(47, 98, 198, 0.1);
    }
  }

  .error-msg {
    display: block;
    font-size: 22rpx;
    color: #ff4d4f;
    margin-top: 8px;
  }
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 6px;
  align-items: center;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(90deg, #17c1f3 0%, #1f4ed6 100%);
  color: #fff;
  border-radius: 999px;
  height: 94rpx;
  font-size: 32rpx;
  font-weight: 800;
  box-shadow: 0 16px 30px rgba(31, 78, 214, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  width: 100%;
  background: #f4f7fc;
  color: #334155;
  border-radius: 999px;
  height: 88rpx;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(31, 79, 178, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
