/**
 * @file validator.ts
 * @description 表单校验规则（uv-form rules 格式）
 * @phase Phase 1 - 1-6
 */

/**
 * @file validator.ts
 * @description uv-form 表单校验规则工具
 */

export type RuleItem = {
  required?: boolean
  message?: string
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: RuleItem, value: unknown) => boolean | Promise<boolean>
}

/** 必填规则 */
export function required(message = '此项为必填项'): RuleItem {
  return { required: true, message }
}

/** 字符串长度范围 */
export function strLength(min: number, max: number, message?: string): RuleItem {
  return {
    min,
    max,
    message: message ?? `长度应在 ${min} – ${max} 字之间`,
  }
}

/** 数字范围校验 */
export function numRange(min: number, max: number, message?: string): RuleItem {
  return {
    validator(_rule, value) {
      const n = Number(value)
      return !isNaN(n) && n >= min && n <= max
    },
    message: message ?? `应在 ${min} – ${max} 之间`,
  }
}

/** 服务时长校验（小数，步长 0.5） */
export function serviceHoursRule(): RuleItem {
  return {
    validator(_rule, value) {
      const n = Number(value)
      return !isNaN(n) && n >= 0.5 && n <= 24 && n % 0.5 === 0
    },
    message: '请输入0.5-24小时，步长0.5h',
  }
}

/** 服务人数校验（必须大于 0 的整数） */
export function serviceCountRule(): RuleItem {
  return {
    validator(_rule, value) {
      const n = Number(value)
      return Number.isInteger(n) && n >= 1
    },
    message: '人数必须为大于 0 的整数',
  }
}

/** 活动名称规则 */
export const activityNameRules: RuleItem[] = [
  required('请输入活动名称'),
  strLength(2, 50),
]

/** 地点规则 */
export const locationRules: RuleItem[] = [
  required('请输入活动地点'),
  strLength(2, 100),
]

/** 简介规则 */
export const descriptionRules: RuleItem[] = [
  required('请输入活动内容'),
  strLength(5, 500),
]

/** 开始时间规则 */
export const startTimeRules: RuleItem[] = [
  required('请选择开始时间'),
  {
    validator(_rule, value) {
      return new Date(value as string) > new Date()
    },
    message: '开始时间不能早于当前',
  },
]

/** 结束时间规则（需配合 startTime） */
export function endTimeRules(startTime: string): RuleItem[] {
  return [
    required('请选择结束时间'),
    {
      validator(_rule, value) {
        if (!startTime) return true
        return new Date(value as string) > new Date(startTime)
      },
      message: '结束时间必须晚于开始时间',
    },
  ]
}
