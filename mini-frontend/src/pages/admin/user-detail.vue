<template>
  <page-meta root-font-size="system"/>
  <view class="page">
    <view v-if="user" class="header-card">
      <view class="user-main">
        <view class="avatar-ph">
          <Icon name="user-3-fill" size="36px" color="#fff" />
        </view>
        <view class="user-info">
          <text class="real-name">{{ user.realName || '未名氏' }}</text>
          <text class="user-phone">{{ user.phone || '无电话记录' }}</text>
        </view>
        <view class="points-box">
          <text class="pts-num">{{ user.totalPoints }}</text>
          <text class="pts-label">当前总积分</text>
        </view>
      </view>
      <view class="user-sub">
        <text>注册时间：{{ formatTime(user.bindAt) }}</text>
        <text style="margin-left: 20px;">共打卡：{{ user.checkinCount }} 次</text>
      </view>
    </view>

    <!-- 积分人工操作区 -->
    <view class="op-card">
      <view class="card-title">
        <Icon name="edit-box-line" size="18px" color="#3a7bd5" />
        <text style="margin-left: 8px;">手动调整积分</text>
      </view>
      <view class="form-row">
        <text class="label">操作类型</text>
        <view class="radio-group">
          <view 
            class="radio-btn" 
            :class="{ active: adjType === 'add' }"
            @tap="adjType = 'add'"
          >增加积分 (+)</view>
          <view 
            class="radio-btn" 
            :class="{ active: adjType === 'sub', sub: true }"
            @tap="adjType = 'sub'"
          >扣减积分 (-)</view>
        </view>
      </view>
      <view class="form-row">
        <text class="label">调整数值</text>
        <input class="form-input" type="number" placeholder="请输入数值" v-model="adjAmount" />
      </view>
      <view class="form-row" style="align-items: flex-start;">
        <text class="label" style="margin-top: 8px;">操作原因</text>
        <textarea 
          class="form-textarea" 
          placeholder="必填，填写调整积分的具体依据" 
          v-model="adjReason"
          :maxlength="100"
        />
      </view>
      <view class="submit-btn" @tap="submitAdjust">确认调整</view>
    </view>

    <!-- 积分流水 / 打卡流水 -->
    <view class="list-section">
      <view class="section-title">积分与打卡明细</view>
      
      <view v-if="loading" class="loading-wrap">
        <uv-loading-icon size="28" />
      </view>
      
      <view v-else-if="logs.length === 0" class="empty">暂无任何记录</view>
      
      <view v-else class="log-list">
        <view v-for="log in logs" :key="log._id" class="log-item">
          <view class="log-head">
            <text class="log-reason">{{ log.reason }}</text>
            <text class="log-amt" :class="log.changeAmount > 0 ? 'pos' : 'neg'">
              {{ log.changeAmount > 0 ? '+' : '' }}{{ log.changeAmount }}
            </text>
          </view>
          <view class="log-sub">
            <text>类型: {{ log.type === 'audit_pass' ? '打卡自动结算' : '人工调整' }}</text>
            <text>{{ formatDateTimeRaw(log.createdAt) }}</text>
          </view>
          <view class="log-balance">操作后结余：{{ log.afterPoints }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Icon from '@/components/common/Icon.vue'
import { onLoad } from '@dcloudio/uni-app'
import { formatDateTime } from '@/utils/format'
import { getPointsLogs, adjustUserPoints } from '@/api/admin'
import type { AdminUser, PointsLog } from '@/api/admin'

const user = ref<AdminUser | null>(null)
const logs = ref<PointsLog[]>([])
const loading = ref(false)

// 调整表单
const adjType = ref<'add'|'sub'>('add')
const adjAmount = ref('')
const adjReason = ref('')

onLoad((options: any) => {
  if (options.payload) {
    try {
      user.value = JSON.parse(decodeURIComponent(options.payload))
      loadLogs()
    } catch {}
  }
})

function formatTime(val: string) {
  if (!val) return ''
  return val.substring(0, 10)
}

function formatDateTimeRaw(val: string) {
  if (!val) return ''
  return formatDateTime(new Date(val))
}

async function loadLogs() {
  if (!user.value) return
  loading.value = true
  try {
    const res = await getPointsLogs(user.value._id)
    if (res.code === 0 && res.data) {
      logs.value = res.data.list
    }
  } finally {
    loading.value = false
  }
}

async function submitAdjust() {
  const amount = Number(adjAmount.value)
  const reason = adjReason.value.trim()

  if (!amount || amount <= 0) {
    uni.showToast({ title: '请输入有效的调整数值', icon: 'none' })
    return
  }
  if (!reason) {
    uni.showToast({ title: '必须填写操作原因', icon: 'none' })
    return
  }

  const actAmount = adjType.value === 'add' ? amount : -amount

  uni.showModal({
    title: '二次确认',
    content: `确认要为该用户 ${actAmount > 0 ? '增加' : '扣除'} ${Math.abs(actAmount)} 积分吗？`,
    success: async (res) => {
      if (res.confirm && user.value) {
        uni.showLoading({ title: '提交中' })
        try {
          const resp = await adjustUserPoints({ targetUserId: user.value._id, amount: actAmount, reason })
          if (resp.code === 0) {
            uni.showToast({ title: '操作成功' })
            // 模拟刷新界面数据
            user.value.totalPoints += actAmount
            adjAmount.value = ''
            adjReason.value = ''
            await loadLogs()
          }
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: #f4f6f9;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-card {
  background: linear-gradient(135deg, #4f8cec 0%, #2f62c6 100%);
  border-radius: 16px;
  padding: 24px 20px;
  color: #fff;
  box-shadow: 0 8px 16px rgba(47, 98, 198, 0.2);
}

.user-main {
  display: flex;
  align-items: center;
}

.avatar-ph {
  width: 56px;
  height: 56px;
  border-radius: 28px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.real-name {
  font-size: 20px;
  font-weight: 700;
}

.user-phone {
  font-size: 14px;
  opacity: 0.8;
}

.points-box {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.pts-num {
  font-size: 32px;
  font-weight: 800;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.pts-label {
  font-size: 12px;
  opacity: 0.8;
  margin-top: 4px;
}

.user-sub {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1rpx solid rgba(255,255,255,0.15);
  font-size: 12px;
  opacity: 0.9;
}

.op-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.04);
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
  color: #222;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.label {
  width: 70px;
  font-size: 14px;
  color: #555;
  flex-shrink: 0;
}

.radio-group {
  display: flex;
  gap: 12px;
  flex: 1;
}

.radio-btn {
  flex: 1;
  text-align: center;
  padding: 8px 0;
  background: #f0f2f5;
  color: #666;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid transparent;
  transition: all 0.2s;
  
  &.active {
    background: #eef6ff;
    color: #3a7bd5;
    border-color: #3a7bd5;
  }
  
  &.sub.active {
    background: #fdf2f1;
    color: #e74c3c;
    border-color: #e74c3c;
  }
}

.form-input {
  flex: 1;
  height: 40px;
  background: #f9fafc;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}

.form-textarea {
  flex: 1;
  height: 80px;
  background: #f9fafc;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  width: auto;
}

.submit-btn {
  background: #3a7bd5;
  color: #fff;
  text-align: center;
  border-radius: 24px;
  height: 48px;
  line-height: 48px;
  font-size: 16px;
  font-weight: 600;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(58, 123, 213, 0.3);
}
.submit-btn:active {
  transform: scale(0.98);
}

.list-section {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin-bottom: 12px;
  padding-left: 4px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.03);
}

.log-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.log-reason {
  flex: 1;
  font-size: 15px;
  font-weight: 600;
  color: #222;
  margin-right: 12px;
  line-height: 1.4;
}

.log-amt {
  font-size: 20px;
  font-weight: 800;
  &.pos { color: #27ae60; }
  &.neg { color: #e74c3c; }
}

.log-sub {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.log-balance {
  font-size: 13px;
  color: #555;
  background: #f7f9fc;
  padding: 6px 10px;
  border-radius: 6px;
  display: inline-block;
}

.loading-wrap {
  display: flex;
  justify-content: center;
  padding: 30px 0;
}
.empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 14px;
}
</style>
