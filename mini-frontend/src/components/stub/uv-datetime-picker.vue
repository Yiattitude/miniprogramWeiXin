<template>
  <view></view>
</template>

<script setup lang="ts">
// uv-datetime-picker 与 Vue 3 不兼容，此处用原生 picker 代替
// 如需日期时间选择，请直接使用微信原生 <picker mode="date"> 或 <picker mode="time">
defineProps<{
  show?: boolean
  value?: string
  minDate?: number
  maxDate?: number
  title?: string
}>()
const emit = defineEmits(['confirm', 'cancel', 'close', 'change'])
</script>
