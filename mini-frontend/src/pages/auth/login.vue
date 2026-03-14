<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view class="hero">
      <view class="hero-badge">银发人才服务平台</view>
      <text class="hero-title">欢迎加入银发志愿服务</text>
      <text class="hero-sub">新用户需先完成微信登录后才能使用全部功能</text>
    </view>

    <view class="card">
      <view class="card-header">
        <view class="avatar-wrap">
          <image class="avatar" src="/static/default-avatar.png" mode="aspectFill" />
        </view>
        <text class="card-title">微信一键登录</text>
        <text class="card-desc">授权后即可报名活动、提交打卡与查看服务记录</text>
      </view>

      <button class="wechat-btn" :loading="loading" @tap="handleWechatLogin">
        {{ loading ? '登录中...' : '微信授权登录' }}
      </button>

      <view class="tip-list">
        <view class="tip-item">仅用于展示头像昵称与统计信息</view>
        <view class="tip-item">平台不会保存微信密码</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
declare const wx: any
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { loginWithWeChat } from '@/api/auth'

const userStore = useUserStore()
const loading = ref(false)

function showToast(title: string) {
  uni.showToast({ title, icon: 'none' })
}

async function handleWechatLogin() {
  if (loading.value) return
  loading.value = true
  try {
    const profileRes = await new Promise<any>((resolve, reject) => {
      wx.getUserProfile({
        desc: '用于完善志愿者资料',
        success: resolve,
        fail: reject,
      })
        })

    const wechatUser = profileRes.userInfo || {}
    const profile = await loginWithWeChat(wechatUser)
    const token = profile.openid || profile._openid || 'logged'
    const mergedProfile = { ...profile, ...wechatUser }
    userStore.login({ token, userInfo: mergedProfile })\r\n    uni.setStorageSync('token', token)\r\n    uni.setStorageSync('userInfo', mergedProfile)

    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/index/index' })
    }, 300)
  } catch (err: any) {
    const msg = err?.errMsg || err?.message || ''
    if (msg.includes('cancel')) {
      showToast('已取消授权')
    } else {
      showToast('登录失败，请稍后重试')
      console.error('wechat login failed', err)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  padding: 28px 20px 32px;
  background: linear-gradient(180deg, #f7f9fc 0%, #eef2f7 50%, #e9eef5 100%);
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: "HarmonyOS Sans", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.hero {
  padding: 20px 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #142c67 0%, #1f4696 45%, #2d61bf 100%);
  color: #fff;
  position: relative;
  overflow: hidden;
  box-shadow: 0 16px 28px rgba(20, 44, 99, 0.26);
}

.hero::after {
  content: '';
  position: absolute;
  right: -30px;
  top: -40px;
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0) 70%);
}

.hero-badge {
  display: inline-block;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 1px;
}

.hero-title {
  display: block;
  margin-top: 14px;
  font-size: 22px;
  font-weight: 700;
}

.hero-sub {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.82);
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 22px 18px 24px;
  box-shadow: 0 12px 26px rgba(24, 36, 58, 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 10px;
}

.avatar-wrap {
  width: 76px;
  height: 76px;
  border-radius: 24px;
  background: #f0f4fb;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(45, 97, 191, 0.08);
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 18px;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  color: #1c2431;
}

.card-desc {
  font-size: 13px;
  color: #7a8797;
}

.wechat-btn {
  width: 100%;
  height: 48px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #2ecc71 0%, #23b061 100%);
  box-shadow: 0 12px 20px rgba(34, 176, 97, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wechat-btn::after {
  border: none;
}

.tip-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: #8b97a8;
}

.tip-item {
  text-align: center;
}
</style>
