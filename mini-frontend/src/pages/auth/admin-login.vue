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
  background: radial-gradient(circle at 50% -20%, #ffffff 0%, #eef4fb 45%, #e8eff8 100%);
  padding: 36px 20px 56px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.panel {
  width: 100%;
  max-width: 620rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  border-radius: 32rpx;
  padding: 46rpx 36rpx 50rpx;
  box-shadow: 0 18px 50px rgba(21, 40, 92, 0.18);
}

.header {
  text-align: center;
  padding: 18px 0 28px;

  .icon-wrap {
    width: 110rpx;
    height: 110rpx;
    border-radius: 28rpx;
    margin: 0 auto 18px;
    background: #f2f6ff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 2px rgba(31, 79, 178, 0.08);
  }

  .header-title {
    display: block;
    font-size: 34rpx;
    font-weight: 800;
    color: #0b2f6b;
    margin: 10px 0 10px 0;
  }

  .header-sub {
    font-size: 26rpx;
    color: #6b7b8d;
    line-height: 1.5;
  }
}

.form-wrap {
  margin-top: 6px;
}

.form-item {
  margin-bottom: 32px;

  .form-label {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #1a2a3a;
    margin-bottom: 12px;

    .required {
      color: #ff4d4f;
      margin-left: 4px;
    }
  }

  .form-input {
    width: 100%;
    box-sizing: border-box;
    height: 88rpx;
    border: 2px solid #cfd7e3;
    border-radius: 18rpx;
    padding: 0 24rpx;
    font-size: 28rpx;
    color: #1c2431;
    background: #fff;
    transition: border-color 0.2s ease;

    &:focus {
      border-color: #2f62c6;
      outline: none;
      box-shadow: 0 0 0 3px rgba(47, 98, 198, 0.12);
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
  gap: 14px;
  margin-top: 10px;
  align-items: center;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(90deg, #17c1f3 0%, #1f4ed6 100%);
  color: #fff;
  border-radius: 999px;
  height: 96rpx;
  font-size: 32rpx;
  font-weight: 800;
  box-shadow: 0 16px 30px rgba(31, 78, 214, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn {
  width: 100%;
  background: #f3f6fb;
  color: #334155;
  border-radius: 999px;
  height: 90rpx;
  font-size: 30rpx;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(31, 79, 178, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
