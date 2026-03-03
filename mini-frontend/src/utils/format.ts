/**
 * @file format.ts
 * @description 日期、数字格式化工具（由原 utils/util.ts 扩展而来）
 * @phase Phase 1 - 1-6
 */

/**
 * @file format.ts
 * @description 日期、数字格式化工具（由原 utils/util.ts 的 formatTime 扩展而来）
 */

/**
 * 将 Date 对象格式化为字符串（兼容原生模板 formatTime）
 * @example formatDate(new Date()) => '2026-03-02'
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化为日期 + 时间
 * @example formatDateTime(new Date()) => '2026-03-02 14:30'
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date)
  const base = formatDate(d)
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${base} ${hour}:${min}`
}

/**
 * 简洁时间展示（递进式）
 * - 不足 1 分钟 => '刚刚'
 * - 不足 1 小时 => 'N 分钟前'
 * - 不足 1 天 => 'N 小时前'
 * - 其他 => 格式化日期
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = Date.now()
  const target = new Date(date).getTime()
  const diff = Math.floor((now - target) / 1000) // 秒

  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return formatDate(date)
}

/**
 * 将数字格式化为保留一位小数（志愿时长展示）
 * @example formatHours(1.5) => '1.5 h'
 */
export function formatHours(hours: number): string {
  return `${Number(hours.toFixed(1))} h`
}

/**
 * 格式化活动时间段（列表卡片展示）
 * @example formatActivityTime('2026-03-02T09:00', '2026-03-02T12:00')
 *   => '03-02 09:00 — 12:00'
 */
export function formatActivityTime(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const sDate = `${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`
  const sTime = `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`
  const eTime = `${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`
  // 如果跨天，显示结束日期
  const eDate = `${String(e.getMonth() + 1).padStart(2, '0')}-${String(e.getDate()).padStart(2, '0')}`
  if (sDate !== eDate) {
    return `${sDate} ${sTime} — ${eDate} ${eTime}`
  }
  return `${sDate} ${sTime} — ${eTime}`
}

/**
 * 人数展示：大于 9999 时显示 "9999+"
 */
export function formatCount(n: number): string {
  return n > 9999 ? '9999+' : String(n)
}
// 保留原 util.ts 中的 formatTime 并扩展
