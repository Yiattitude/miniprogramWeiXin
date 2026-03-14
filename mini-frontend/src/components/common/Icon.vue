<template>
  <text
    class="mgc"
    :class="iconClass"
    :style="iconStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string
  size?: string | number
  color?: string
  rotate?: number
}>(), {
  size: '24px',
})

const iconClass = computed(() => {
  const name = props.name?.trim()
  if (!name) return ''
  const normalized = name.replace(/^mgc[-_]/, '').replace(/-/g, '_')
  return `mgc_${normalized}`
})

const iconStyle = computed(() => {
  const size = props.size
  const fontSize = typeof size === 'number' ? `${size}px` : size
  const style: Record<string, string> = {
    'font-size': fontSize,
  }
  if (props.color) style.color = props.color
  if (props.rotate) style.transform = `rotate(${props.rotate}deg)`
  return style
})
</script>

<style scoped>
.mgc {
  display: inline-block;
  line-height: 1;
  vertical-align: middle;
}
</style>
