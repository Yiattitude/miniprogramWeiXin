# Icon 组件使用指南（Mingcute）

项目已切换为 Mingcute Icon Font（npm 包 `mingcute_icon`），不再需要在 `/src/static/icons/` 下手动创建 SVG。

## 1. 安装与引入

- 依赖：`package.json` 已包含 `mingcute_icon`
- 全局样式：已在 `src/main.ts` 引入 `mingcute_icon/font/Mingcute.css`

## 2. 组件用法

```vue
<script setup>
import Icon from '@/components/common/Icon.vue'
</script>

<template>
  <Icon name="calendar-line" size="24px" />
  <Icon name="check-circle-line" size="24px" color="#2db57d" />
  <Icon name="arrow-right-line" size="20px" />
</template>
```

### 命名规则

- 直接使用 Mingcute 图标名（去掉 `mgc_` 前缀）
- 连字符 `-` 会自动转换为 `_`
- 支持 `-line` / `-fill` 风格
- 也可以传入 `mgc_calendar_line` 或 `mgc-calendar-line`，组件会自动标准化

示例：

- `calendar-line` → `mgc_calendar_line`
- `check-circle-line` → `mgc_check_circle_line`

## 3. 常用图标（示例）

| 名称 | 含义 |
| --- | --- |
| `edit-2-line` | 编辑 / 报名 |
| `checkbox-line` | 打卡 / 已选 |
| `check-circle-line` | 完成 / 成功 |
| `file-text-line` | 记录 / 文档 |
| `chart-bar-line` | 统计 |
| `time-line` | 时间 |
| `location-line` | 地点 |
| `group-line` | 人数 |
| `search-line` | 搜索 |
| `add-circle-line` | 添加 |
| `close-line` | 删除 / 关闭 |
| `arrow-right-line` | 进入 / 前往 |
| `calendar-line` | 日期 |

## 4. 直接使用类名（可选）

如果不想用组件，可以直接写：

```vue
<text class="mgc mgc_calendar_line"></text>
```

## 5. 常见问题

1. 图标不显示：
   - 确认已执行 `npm install`
   - 确认 `src/main.ts` 已引入 `mingcute_icon/font/Mingcute.css`
   - 确认图标名拼写正确（以 Mingcute 官网为准）
