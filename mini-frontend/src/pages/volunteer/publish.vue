<script setup lang="ts">
/**
 * @page volunteer/publish
 * @description 发布活动表单，仅管理员可进入
 * @phase Phase 4 - 4-1
 */
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useVolunteerStore } from '@/stores/volunteer'
import type { PublishActivityForm } from '@/types/volunteer'

const userStore = useUserStore()
const volunteerStore = useVolunteerStore()

// 权限守卫：非管理员直接返回
onMounted(() => {
  if (!userStore.isAdmin) {
    uni.showToast({ title: '权限不足', icon: 'none' })
    uni.navigateBack()
  }
})

// ────── 表单数据 ──────
const form = reactive<PublishActivityForm>({
  name: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  maxCount: 10,
})

// 日期選擇器顯示用的格式化文本
const startTimeText = ref('')
const endTimeText = ref('')

// 日期選擇器 refs
const startPickerRef = ref<any>(null)
const endPickerRef = ref<any>(null)
const submitting = ref(false)

// ────── 表单校验规则 ──────
const rules = {
  name: [
    { required: true, message: '请输入活动名称' },
    { max: 50, message: '活动名称不超过50字' },
  ],
  startTime: [{ required: true, message: '请选择开始时间' }],
  endTime: [{ required: true, message: '请选择结束时间' }],
  location: [
    { required: true, message: '请输入活动地点' },
    { max: 100, message: '地点不超过100字' },
  ],
  maxCount: [{ required: true, message: '请输入最大报名人数' }],
  description: [
    { required: true, message: '请填写活动内容/需求' },
    { max: 500, message: '描述不超过500字' },
  ],
}

const formRef = ref<any>(null)

// ────── 日期选择 ──────
function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function onStartPickerConfirm(e: any) {
  // uv-datetime-picker confirm 返回 { value: timestamp(ms) }
  const ts: number = typeof e.value === 'number' ? e.value : new Date(e.value).getTime()
  const formatted = formatTimestamp(ts)
  form.startTime = formatted
  startTimeText.value = formatted
  showStartPicker.value = false
}

function onEndPickerConfirm(e: any) {
  const ts: number = typeof e.value === 'number' ? e.value : new Date(e.value).getTime()
  const formatted = formatTimestamp(ts)
  form.endTime = formatted
  endTimeText.value = formatted
  showEndPicker.value = false
}

// maxCount 输入
function onMaxCountInput(val: string) {
  const n = parseInt(val)
  form.maxCount = isNaN(n) ? 1 : Math.min(999, Math.max(1, n))
}

// ────── 提交 ──────
async function handleSubmit() {
  // 手动校验
  if (!form.name.trim()) return uni.showToast({ title: '请输入活动名称', icon: 'none' })
  if (form.name.length > 50) return uni.showToast({ title: '活动名称不超过50字', icon: 'none' })
  if (!form.startTime) return uni.showToast({ title: '请选择开始时间', icon: 'none' })
  if (!form.endTime) return uni.showToast({ title: '请选择结束时间', icon: 'none' })
  if (form.endTime <= form.startTime) return uni.showToast({ title: '结束时间须晚于开始时间', icon: 'none' })
  if (!form.location.trim()) return uni.showToast({ title: '请输入活动地点', icon: 'none' })
  if (!form.description.trim()) return uni.showToast({ title: '请填写活动内容/需求', icon: 'none' })
  if (form.maxCount < 1 || form.maxCount > 999) return uni.showToast({ title: '报名人数须在1-999之间', icon: 'none' })

  submitting.value = true
  try {
    await volunteerStore.publishActivity(form)
    uni.showToast({ title: '发布成功！', icon: 'success' })
    setTimeout(() => uni.navigateBack(), 1500)
  } catch (e) {
    console.error('[publish] error:', e)
  } finally {
    submitting.value = false
  }
}

function handleReset() {
  form.name = ''
  form.startTime = ''
  form.endTime = ''
  form.location = ''
  form.description = ''
  form.maxCount = 10
  startTimeText.value = ''
  endTimeText.value = ''
}
</script>

<template>
  <view class="page">
    <scroll-view scroll-y class="scroll-wrap">
      <!-- ── 管理员标识条 ── -->
      <view class="admin-bar">
        <text class="admin-icon">🔐</text>
        <text class="admin-text">管理员专属 · 发布新活动</text>
      </view>

      <!-- ── 表单卡片 ── -->
      <view class="form-card">

        <!-- 活动名称 -->
        <view class="form-item">
          <text class="form-label required">活动名称</text>
          <input
            class="form-input"
            v-model="form.name"
            placeholder="请输入活动名称（最多50字）"
            placeholder-class="placeholder"
            maxlength="50"
          />
          <text class="char-count">{{ form.name.length }}/50</text>
        </view>

        <!-- 开始时间 -->
        <view class="form-item" @click="startPickerRef?.open()">
          <text class="form-label required">开始时间</text>
          <view class="form-picker-row">
            <text :class="['picker-text', startTimeText ? 'has-val' : 'no-val']">
              {{ startTimeText || '请选择开始时间' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </view>

        <!-- 结束时间 -->
        <view class="form-item" @click="endPickerRef?.open()">
          <text class="form-label required">结束时间</text>
          <view class="form-picker-row">
            <text :class="['picker-text', endTimeText ? 'has-val' : 'no-val']">
              {{ endTimeText || '请选择结束时间' }}
            </text>
            <text class="picker-arrow">›</text>
          </view>
        </view>

        <!-- 活动地点 -->
        <view class="form-item">
          <text class="form-label required">活动地点</text>
          <input
            class="form-input"
            v-model="form.location"
            placeholder="请输入活动地点（最多100字）"
            placeholder-class="placeholder"
            maxlength="100"
          />
        </view>

        <!-- 最大报名人数 -->
        <view class="form-item">
          <text class="form-label required">最大报名人数</text>
          <view class="counter-row">
            <view class="counter-btn" @click="form.maxCount = Math.max(1, form.maxCount - 1)">－</view>
            <input
              class="counter-input"
              type="number"
              :value="String(form.maxCount)"
              @input="onMaxCountInput(($event as any).detail.value)"
            />
            <view class="counter-btn" @click="form.maxCount = Math.min(999, form.maxCount + 1)">＋</view>
          </view>
          <text class="form-hint">范围：1 – 999 人</text>
        </view>

        <!-- 活动内容/需求 -->
        <view class="form-item">
          <text class="form-label required">活动内容/需求</text>
          <textarea
            class="form-textarea"
            v-model="form.description"
            placeholder="请描述活动内容、要求及注意事项（最多500字）"
            placeholder-class="placeholder"
            maxlength="500"
            auto-height
          />
          <text class="char-count">{{ form.description.length }}/500</text>
        </view>
      </view>

      <!-- ── 操作按钮 ── -->
      <view class="btn-group">
        <view class="btn btn-outline" @click="handleReset">重置</view>
        <view
          :class="['btn', 'btn-primary', submitting ? 'btn-disabled' : '']"
          @click="!submitting && handleSubmit()"
        >
          <text v-if="submitting">发布中…</text>
          <text v-else>发布活动</text>
        </view>
      </view>
    </scroll-view>

    <!-- 开始时间选择器 -->
    <uv-datetime-picker
      ref="startPickerRef"
      mode="datetime"
      title="选择开始时间"
      @confirm="onStartPickerConfirm"
    />

    <!-- 结束时间选择器 -->
    <uv-datetime-picker
      ref="endPickerRef"
      mode="datetime"
      title="选择结束时间"
      @confirm="onEndPickerConfirm"
    />
  </view>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;
  background: var(--color-bg-page, #f0f2f5);
}

.scroll-wrap {
  height: 100vh;
  padding-bottom: 60px;
}

/* 管理员标识条 */
.admin-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff3cd;
  padding: var(--space-sm, 12px) var(--space-md, 16px);
  border-bottom: 1px solid #ffc107;
}
.admin-icon { font-size: 18px; }
.admin-text {
  font-size: var(--font-sm, 15px);
  color: #856404;
  font-weight: 600;
}

/* 表单卡片 */
.form-card {
  background: #fff;
  margin: var(--space-md, 16px);
  border-radius: var(--radius-md, 10px);
  padding: var(--space-md, 16px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.form-item {
  margin-bottom: var(--space-md, 16px);
  &:last-child { margin-bottom: 0; }
}

.form-label {
  display: block;
  font-size: var(--font-base, 17px);
  font-weight: 600;
  color: var(--color-text-main, #1e2a3a);
  margin-bottom: 8px;

  &.required::before {
    content: '* ';
    color: #e74c3c;
  }
}

.form-input {
  width: 100%;
  height: 48px;
  border: 1px solid var(--color-border, #e2e7ec);
  border-radius: 8px;
  padding: 0 12px;
  font-size: var(--font-base, 17px);
  color: var(--color-text-main, #1e2a3a);
  background: #fafbfc;
  box-sizing: border-box;
}

.form-textarea {
  width: 100%;
  min-height: 100px;
  border: 1px solid var(--color-border, #e2e7ec);
  border-radius: 8px;
  padding: 12px;
  font-size: var(--font-base, 17px);
  color: var(--color-text-main, #1e2a3a);
  background: #fafbfc;
  box-sizing: border-box;
  line-height: 1.6;
}

.placeholder { color: var(--color-text-muted, #a0aab5); }

.char-count {
  display: block;
  text-align: right;
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
  margin-top: 4px;
}

.form-hint {
  font-size: var(--font-xs, 13px);
  color: var(--color-text-muted, #a0aab5);
  margin-top: 4px;
}

/* 时间选择器行 */
.form-picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 48px;
  border: 1px solid var(--color-border, #e2e7ec);
  border-radius: 8px;
  padding: 0 12px;
  background: #fafbfc;
}
.picker-text {
  font-size: var(--font-base, 17px);
  &.has-val { color: var(--color-text-main, #1e2a3a); }
  &.no-val  { color: var(--color-text-muted, #a0aab5); }
}
.picker-arrow {
  font-size: 22px;
  color: var(--color-text-muted, #a0aab5);
}

/* 计数器 */
.counter-row {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--color-border, #e2e7ec);
  border-radius: 8px;
  overflow: hidden;
  width: fit-content;
}
.counter-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--color-primary, #3a7bd5);
  background: var(--color-primary-bg, #eef3fc);
  font-weight: 600;
}
.counter-input {
  width: 72px;
  height: 48px;
  text-align: center;
  font-size: var(--font-lg, 19px);
  font-weight: 700;
  color: var(--color-text-main, #1e2a3a);
  border: none;
  border-left: 1px solid var(--color-border, #e2e7ec);
  border-right: 1px solid var(--color-border, #e2e7ec);
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: var(--space-sm, 12px);
  padding: 0 var(--space-md, 16px) var(--space-lg, 24px);
}

.btn {
  flex: 1;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: var(--font-base, 17px);
  font-weight: 600;
}

.btn-primary {
  background: var(--color-primary, #3a7bd5);
  color: #fff;
}

.btn-outline {
  background: #fff;
  color: var(--color-primary, #3a7bd5);
  border: 1px solid var(--color-primary, #3a7bd5);
}

.btn-disabled {
  background: var(--color-text-muted, #a0aab5);
  color: #fff;
  pointer-events: none;
}
</style>
