/**
 * @file format.ts
 * @description 格式化工具函数
 */

/**
 * 格式化日期：YYYY-MM-DD
 */
export function formatDate(date: string | number | Date): string {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 格式化日期时间：YYYY-MM-DD HH:mm
 */
export function formatDateTime(date: string | number | Date): string {
  const d = new Date(date)
  const base = formatDate(d)
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${base} ${hour}:${min}`
}

/**
 * 格式化活动时间范围
 */
export function formatActivityTime(start: string | number | Date, end: string | number | Date): string {
  const s = new Date(start)
  const e = new Date(end)
  
  const sDate = `${String(s.getMonth() + 1).padStart(2, '0')}-${String(s.getDate()).padStart(2, '0')}`
  const sTime = `${String(s.getHours()).padStart(2, '0')}:${String(s.getMinutes()).padStart(2, '0')}`
  const eTime = `${String(e.getHours()).padStart(2, '0')}:${String(e.getMinutes()).padStart(2, '0')}`
  const eDate = `${String(e.getMonth() + 1).padStart(2, '0')}-${String(e.getDate()).padStart(2, '0')}`

  if (sDate !== eDate) {
    return `${sDate} ${sTime} — ${eDate} ${eTime}`
  }
  return `${sDate} ${sTime} — ${eTime}`
}
