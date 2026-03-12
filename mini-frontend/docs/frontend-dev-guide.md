# 银发人才平台小程序 —— 前端开发文档

> **适用模块**：2.3 志愿活动参加统计模块
> **技术栈**：  (uv-ui)
> **文档用途**：AI 辅助代码生成 / 开发规范参考 / 前后端接口协作
> **最后更新**：2026-03-02

---

## 目录

0. [分步开发规划](#0-分步开发规划)
1. [技术栈说明](#1-技术栈说明)
2. [项目目录结构](#2-项目目录结构)
3. [全局规范与编码约定](#3-全局规范与编码约定)
4. [状态管理（Pinia）设计](#4-状态管理pinia设计)
5. [路由与页面清单](#5-路由与页面清单)
6. [API 接口层设计](#6-api-接口层设计)
7. [2.3 志愿活动参加统计模块](#7-23-志愿活动参加统计模块)
8. [公共组件库](#8-公共组件库)
9. [适老化 UI 规范](#9-适老化-ui-规范)
10. [后端对接说明](#10-后端对接说明)

---

## 0. 分步开发规划

> 按"基础设施 → 公共组件 → 核心页面 → 复杂页面 → 收尾联调"五个阶段推进，
> 每个阶段完成后须通过编译并自测，再进入下一阶段。

---

### Phase 1 · 基础设施搭建（开发前置，无页面）

> 目标：所有页面都能复用的底层能力全部就绪。

| 步骤 | 任务 | 输出文件 | 说明 |
|------|------|----------|------|
| 1-1 | 初始化项目 & 安装依赖 | `package.json` / `manifest.json` | uni-app + Vue3 + Pinia + uView Plus + SCSS |
| 1-2 | 适老化样式变量 | `styles/variables.scss` | 颜色、字号、间距 CSS 变量，与 HTML 参考稿保持一致 |
| 1-3 | 全局样式 & Mixin | `styles/global.scss` `styles/mixins.scss` | reset、tap 最小尺寸、通用 flex 工具类 |
| 1-4 | TypeScript 类型定义 | `types/user.d.ts` `types/volunteer.d.ts` | `Activity` / `CheckinRecord` / `StatisticsData` 等全部接口类型 |
| 1-5 | HTTP 请求封装 | `api/http.ts` | BaseURL 注入、Token 拦截、统一错误处理、401 跳登录 |
| 1-6 | 工具函数 | `utils/format.ts` `utils/validator.ts` `utils/permission.ts` | 日期格式化、表单校验规则、角色判断 |
| 1-7 | 组合式函数 | `composables/useRequest.ts` `composables/usePagination.ts` `composables/useUpload.ts` | 通用 loading/error、分页逻辑、图片上传 |
| 1-8 | 志愿 API 模块 | `api/volunteer.ts` | 全量接口函数（与后端约定对齐） |
| 1-9 | Pinia Store | `stores/user.ts` `stores/volunteer.ts` | 用户信息 Store + 志愿活动 Store（含所有 Actions） |
| 1-10 | 路由配置 | `pages.json` | 注册全部页面路径及 TabBar |

**Phase 1 完成标志**：`uni-app` 能正常编译，无 TS 报错，`http.get` 可正常发出请求。

---

### Phase 2 · 公共组件开发

> 目标：先造好"零件"，后续页面直接组装。

| 步骤 | 任务 | 输出文件 | 关键 Props/功能 |
|------|------|----------|----------------|
| 2-1 | 空状态占位组件 | `components/common/EmptyState.vue` | `icon` `title` `subtitle`；适老化大图标+大字 |
| 2-2 | 上拉加载更多 | `components/common/LoadMore.vue` | `loading` `finished`；触底自动触发 emit |
| 2-3 | 适老化导航栏 | `components/common/NavBar.vue` | 自定义左侧返回、标题居中，字号 ≥ 17px |
| 2-4 | 图片上传组件 | `components/common/UploadImage.vue` | `v-model` 绑定 URL 数组，最多 9 张，尺寸校验，调用 `useUpload` |
| 2-5 | 活动列表卡片 | `components/volunteer/ActivityCard.vue` | 接收 `Activity` 对象，展示名称/时间/地点/状态徽标 |
| 2-6 | 打卡列表卡片 | `components/volunteer/CheckinCard.vue` | 接收 `Activity`，区分"已打卡"置灰与可点击状态 |
| 2-7 | 统计表格 | `components/volunteer/StatTable.vue` | `columns` `rows` `totalRow`；合计行高亮蓝色 |

**Phase 2 完成标志**：在测试页中挂载各组件，视觉与 HTML 参考稿一致，无控制台警告。

---

### Phase 3 · 核心流程页面（主链路）

> 目标：跑通"报名 → 打卡"完整用户主路径。

| 步骤 | 页面文件 | 功能重点 | 依赖 Phase |
|------|----------|----------|-----------|
| 3-1 | `pages/index/index.vue` | 应用首页，展示功能入口卡片（志愿活动入口） | 1 |
| 3-2 | `pages/volunteer/index.vue` | 志愿活动四格入口（打卡/发布/记录/报名），admin 才显示"发布" | 1, 2-5 |
| 3-3 | `pages/volunteer/signup-list.vue` | 活动列表，搜索栏（防抖 300ms）+ 时间/地点筛选面板 + 分页加载 | 1, 2-2, 2-5 |
| 3-4 | `pages/volunteer/signup-detail.vue` | 活动详情，报名人数进度条，已满/已报名状态联动按钮 | 1, 2-5 |
| 3-5 | `pages/volunteer/checkin-list.vue` | 已报名活动列表，已打卡置灰，未打卡可跳转填报 | 1, 2-6 |
| 3-6 | `pages/volunteer/checkin-form.vue` | 打卡填报：时长、人数、图片上传、备注，uv-form 校验后提交 | 1, 2-4 |

**Phase 3 完成标志**：从首页点击"报名"→找到活动→报名成功→打开打卡列表→提交打卡，全流程无断点。

---

### Phase 4 · 管理与统计页面

> 目标：完成发布、记录查看、个人统计、报表导出。

| 步骤 | 页面文件 | 功能重点 | 依赖 Phase |
|------|----------|----------|-----------|
| 4-1 | `pages/volunteer/publish.vue` | 发布活动表单，uv-datetime-picker 选时间，uv-form 全字段校验，仅 admin 可进入 | 1 |
| 4-2 | `pages/volunteer/record.vue` | 历史打卡记录列表（分页），展示时长/人数/状态徽标 | 1, 2-2 |
| 4-3 | `pages/volunteer/profile.vue` | 个人主页：头像/单位、三格汇总统计、菜单跳转入口 | 1 |
| 4-4 | `pages/volunteer/statistics.vue` | 统计报表：时间 Tab + 个人/团队 Segment，两张表格，导出按钮（downloadFile + openDocument） | 1, 2-7 |

**Phase 4 完成标志**：管理员可发布活动；普通用户可查看记录、个人统计；报表可正常导出或预览下载链接。

---

### Phase 5 · 收尾与联调

| 步骤 | 任务 | 说明 |
|------|------|------|
| 5-1 | 全局空状态接入 | 所有列表页数据为空时展示 `EmptyState.vue` |
| 5-2 | 下拉刷新接入 | 所有列表页添加 `onPullDownRefresh` 重置分页并重新拉取 |
| 5-3 | 骨架屏 / loading 状态 | 页面首次加载时展示 uv-skeleton 或 loading 占位，避免空白闪烁 |
| 5-4 | 权限守卫 | 在 `App.vue` 或页面 `onShow` 中校验 token，未登录跳转登录页 |
| 5-5 | 适老化走查 | 对照适老化 UI 规范（§9）逐页检查字号 / 点击区域 / 行高 |
| 5-6 | 前后端联调 | 将 Mock 数据替换为真实接口，逐接口验证请求/响应格式 |
| 5-7 | 编译 & 真机测试 | 微信开发者工具编译 → 真机预览 → 修复兼容问题 |

---

### 开发优先级总览

```
Phase 1（基础设施）
    │
    ▼
Phase 2（公共组件）
    │
    ▼
Phase 3（主链路页面）  ← 最高优先级，优先验收
    │
    ▼
Phase 4（管理统计页面）
    │
    ▼
Phase 5（收尾联调）
```

| 阶段 | 预计页面/文件数 | 优先级 |
|------|----------------|--------|
| Phase 1 | 10 个基础文件 | ★★★★★ |
| Phase 2 | 7 个组件 | ★★★★★ |
| Phase 3 | 6 个页面 | ★★★★★ |
| Phase 4 | 4 个页面 | ★★★★☆ |
| Phase 5 | 7 项收尾任务 | ★★★☆☆ |

---

## 0.5 原生模板与 uni-app 项目融合方案

> 当前 `mini-frontend/` 是微信官方 **原生 TypeScript 模板**（`Page()` / `Component()` / WXML / WXSS）。  
> 开发文档目标架构为 **uni-app + Vue 3 + Pinia + uView Plus**（`.vue` SFC / `pages.json`）。  
> 二者体系不兼容，不能直接混用，需在现有目录基础上原地迁移。

---

### 0.5.1 文件对照映射表

| 原生模板文件 | 处理方式 | 对应 uni-app 目标文件 | 说明 |
|---|---|---|---|
| `app.ts` | **改写** | `src/App.vue` + `src/main.ts` | `App.vue` 承接 `onLaunch` 生命周期；`main.ts` 注册 Pinia、uView Plus 并挂载 app |
| `app.json` | **改写** | `src/pages.json` + `src/manifest.json` | `pages.json` 管理路由与 TabBar；`manifest.json` 管理 appid 与编译配置 |
| `app.wxss` | **改写** | `src/styles/global.scss` | 全局基础样式迁移到 SCSS，原 `app.wxss` 内容若有保留价值直接复制后删除原文件 |
| `utils/util.ts` | **扩展** | `src/utils/format.ts` | 保留 `formatTime` 并扩展日期、数字格式化函数，删除原文件 |
| `typings/index.d.ts` | **保留参考** | `src/types/user.d.ts` | `IAppOption` 重构后移入 `user.d.ts`；uni-app 有自带 ts 类型，原 `typings/types/wx/` 不再需要 |
| `typings/types/wx/` | **删除** | ×（由 uni-app 官方类型包覆盖） | uni-app 通过 `@dcloudio/types` 提供 wx.* 类型，无需手动维护 |
| `tsconfig.json` | **替换** | `tsconfig.json`（根目录） | 替换为 uni-app Vue3 专用配置（见 0.5.3 节） |
| `package.json` | **替换** | `package.json` | 替换为 uni-app 项目依赖（见 0.5.4 节） |
| `project.config.json` | **修改** | `project.config.json` | 修改 `miniprogramRoot` 为 `dist/mp-weixin/`（uni-app 编译产物目录） |
| `project.private.config.json` | **保留** | `project.private.config.json` | 不改动，保留 appid 等本地私有配置 |
| `pages/index/` | **删除** | × | 官方模板演示页，全部删除 |
| `pages/logs/` | **删除** | × | 官方模板演示页，全部删除 |
| ×（新建） | **创建** | `src/` | 所有业务代码移入 `src/`，对应 §2 目录结构 |
| `docs/` | **保留** | `docs/` | 开发文档原地保留 |

---

### 0.5.2 迁移后的完整目录结构

```
mini-frontend/                    ← 项目根目录（保持不动）
│
├── src/                          ← 【新建】所有 uni-app 业务代码
│   ├── api/
│   │   ├── http.ts               ← 由 app.ts 中的 wx.login 逻辑拆分演化
│   │   └── volunteer.ts
│   ├── stores/
│   │   ├── user.ts               ← IAppOption.globalData 迁移至此
│   │   └── volunteer.ts
│   ├── pages/
│   │   ├── index/
│   │   │   └── index.vue         ← 替代原 pages/index/（原生版全部删除）
│   │   └── volunteer/
│   │       ├── index.vue
│   │       ├── publish.vue
│   │       ├── signup-list.vue
│   │       ├── signup-detail.vue
│   │       ├── checkin-list.vue
│   │       ├── checkin-form.vue
│   │       ├── record.vue
│   │       ├── profile.vue
│   │       └── statistics.vue
│   ├── components/
│   │   ├── common/
│   │   │   ├── NavBar.vue
│   │   │   ├── LoadMore.vue
│   │   │   ├── EmptyState.vue
│   │   │   └── UploadImage.vue
│   │   └── volunteer/
│   │       ├── ActivityCard.vue
│   │       ├── CheckinCard.vue
│   │       └── StatTable.vue
│   ├── composables/
│   │   ├── useRequest.ts
│   │   ├── usePagination.ts
│   │   └── useUpload.ts
│   ├── utils/
│   │   ├── format.ts             ← 由原 utils/util.ts 扩展而来
│   │   ├── validator.ts
│   │   └── permission.ts
│   ├── styles/
│   │   ├── variables.scss
│   │   ├── mixins.scss
│   │   └── global.scss           ← 原 app.wxss 内容迁移至此
│   ├── types/
│   │   ├── user.d.ts             ← 原 typings/index.d.ts 重构
│   │   └── volunteer.d.ts
│   ├── App.vue                   ← 原 app.ts onLaunch 迁移至此
│   ├── main.ts                   ← uni-app 入口，注册 Pinia + uView Plus
│   ├── pages.json                ← 替代原 app.json（路由配置）
│   └── manifest.json             ← uni-app 编译配置（含 appid）
│
├── dist/                         ← 【自动生成，gitignore】uni-app 编译产物
│   └── mp-weixin/                ← 微信开发者工具指向此目录
│
├── docs/
│   └── frontend-dev-guide.md     ← 本文档
│
├── project.config.json           ← 修改 miniprogramRoot → dist/mp-weixin/
├── project.private.config.json   ← 保留不动
├── tsconfig.json                 ← 替换为 uni-app Vue3 配置
├── package.json                  ← 替换为 uni-app 依赖
│
│ ── 以下原生模板文件迁移完成后删除 ──
│ app.ts         （迁移 → src/App.vue + src/main.ts）
│ app.json       （迁移 → src/pages.json + src/manifest.json）
│ app.wxss       （迁移 → src/styles/global.scss）
│ utils/util.ts  （迁移 → src/utils/format.ts）
│ typings/       （由 uni-app 官方类型包替代，整个目录删除）
│ pages/index/   （演示页，删除）
└ pages/logs/    （演示页，删除）
```

---

### 0.5.3 tsconfig.json 替换内容

将根目录 `tsconfig.json` 完整替换为以下内容（uni-app Vue3 专用）：

```jsonc
{
  "extends": "@vue/tsconfig/tsconfig.json",
  "compilerOptions": {
    "sourceMap": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]   // 路径别名，对应 src/ 目录
    },
    "lib": ["esnext", "dom"],
    "types": ["@dcloudio/types"]  // uni-app + wx.* 类型
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
```

---

### 0.5.4 package.json 替换内容

```json
{
  "name": "silver-talent-volunteer",
  "version": "1.0.0",
  "description": "银发人才平台 - 志愿活动统计小程序",
  "scripts": {
    "dev:mp-weixin":   "uni -p mp-weixin",
    "build:mp-weixin": "uni build -p mp-weixin"
  },
  "dependencies": {
    "@dcloudio/uni-app":        "^3.0.0",
    "pinia":                    "^2.1.0",
    "vue":                      "^3.4.0",
    "dayjs":                    "^1.11.0",
    "@climblee/uv-ui":          "^3.0.0"
  },
  "devDependencies": {
    "@dcloudio/types":          "*",
    "@vue/tsconfig":            "^0.5.0",
    "typescript":               "^5.0.0",
    "sass":                     "^1.69.0"
  }
}
```

---

### 0.5.5 project.config.json 完整修改方案

> ⚠️ **当前存在的问题**：原文件的 `miniprogramRoot` 为 `"miniprogram/"`，  
> 但该目录**并不存在**（文件都在根目录），用微信开发者工具打开当前项目也会报路径错误。  
> 迁移到 uni-app 后，同步修正此问题。

需修改以下字段（其余字段保留不动）：

```json5
{
  // ① 指向 uni-app 编译产物目录（原来是不存在的 "miniprogram/"）
  "miniprogramRoot": "dist/mp-weixin/",

  // ② 删除此行 —— uni-app 自己处理 TS，开发者工具不能再二次编译 TS，否则会报错
  //   "useCompilerPlugins": ["typescript"],   ← 删除

  // ③ 删除此行 —— uni-app 项目无"源码根目录"概念
  //   "srcMiniprogramRoot": "miniprogram/",   ← 删除

  // ④ appid 保留，值不变
  "appid": "wx8aa643e89ae9c5a9"
}
```

修改后 `setting` 块中关键字段应为：

```json
"setting": {
  "es6": false,
  "minified": false,
  "enhance": false,
  "packNpmManually": false,
  "ignoreUploadUnusedFiles": true
}
```

---

### 0.5.6 微信开发者工具预览流程

```
┌─────────────────────────────────────────────────────────────┐
│  终端（VSCode / PowerShell）          微信开发者工具           │
│                                                             │
│  npm run dev:mp-weixin  ──编译──▶  dist/mp-weixin/          │
│         │（监听模式，保持运行）           │                    │
│         │                        打开项目目录                 │
│         │                    mini-frontend/（整个根目录）      │
│         │                        │                          │
│         │              读取 project.config.json              │
│         │              miniprogramRoot = dist/mp-weixin/     │
│         │                        │                          │
│         └─── 改动 src/ 文件 ────▶ 自动重编译 ──▶ 模拟器热刷新   │
└─────────────────────────────────────────────────────────────┘
```

**具体步骤**：

```bash
# Step 1：安装依赖
npm install

# Step 2：启动编译监听（保持此终端运行，不要关闭）
npm run dev:mp-weixin
# 首次编译完成后，dist/mp-weixin/ 目录会出现

# Step 3：微信开发者工具 → 导入项目
#   项目目录：选 mini-frontend/（整个根目录，不是 dist/）
#   AppID：wx8aa643e89ae9c5a9（与 project.config.json 保持一致）
#   工具会自动读取 miniprogramRoot = dist/mp-weixin/ 作为小程序根目录

# Step 4：之后每次修改 src/ 下的文件
#   uni-app 自动重编译 → dist/mp-weixin/ 更新 → 开发者工具自动刷新预览
```

> **注意**：微信开发者工具导入的是 `mini-frontend/` 根目录，  
> **不是** `dist/mp-weixin/`。  
> 工具通过 `project.config.json` 中的 `miniprogramRoot` 字段定位小程序代码，  
> `project.private.config.json` 中的个人设置（热重载等）同样会自动生效。

---

### 0.5.7 初始化时删除原生模板旧文件

Phase 1 基础设施搭建完成、`npm run dev:mp-weixin` 首次编译成功后，执行清理：

```bash
# 删除原生模板演示页和已迁移的文件
Remove-Item -Recurse -Force pages/index
Remove-Item -Recurse -Force pages/logs
Remove-Item -Recurse -Force typings
Remove-Item app.ts, app.json, app.wxss
Remove-Item utils/util.ts
# utils/ 目录此时为空，也可一并删除
Remove-Item -Recurse -Force utils
```

> `docs/`、`project.config.json`、`project.private.config.json`、`tsconfig.json`、`package.json` 保留（已替换内容）。

---

## 1. 技术栈说明

| 层级 | 技术 | 版本要求 | 说明 |
|------|------|----------|------|
| 跨端框架 | uni-app | ≥ 3.x | 编译目标：微信小程序 |
| UI 框架 | Vue 3 | ≥ 3.4 | Composition API + `<script setup>` |
| 组件库 | uView Plus (uv-ui) | ≥ 3.x | 适配 Vue 3 的 uView 版本 |
| 状态管理 | Pinia | ≥ 2.x | 替代 Vuex，模块化 Store |
| HTTP 请求 | uni-app `uni.request` 封装 | — | 统一拦截器、Token 注入 |
| 样式方案 | SCSS + CSS 变量 | — | 遵循适老化设计规范 |
| 类型系统 | TypeScript | ≥ 5.x | 所有业务文件使用 TS |
| 工具库 | dayjs | ≥ 1.11 | 日期格式化 |

---

## 2. 项目目录结构

```
src/
├── api/                        # API 接口层（与后端 1:1 映射）
│   ├── http.ts                 # axios/uni.request 封装，含拦截器
│   └── volunteer.ts            # 2.3 志愿活动接口
│
├── stores/                     # Pinia 状态管理
│   ├── user.ts                 # 全局用户信息 Store
│   └── volunteer.ts            # 志愿模块 Store
│
├── pages/                      # 页面文件（与 pages.json 对应）
│   ├── index/                  # 小程序首页（功能入口）
│   │   └── index.vue
│   │
│   └── volunteer/              # ── 2.3 志愿活动 ──
│       ├── index.vue           # 志愿活动首页（四格入口）
│       ├── publish.vue         # 发布活动（管理员）
│       ├── signup-list.vue     # 报名—活动列表
│       ├── signup-detail.vue   # 报名详情 & 确认
│       ├── checkin-list.vue    # 打卡—已报名列表
│       ├── checkin-form.vue    # 打卡填报表单
│       ├── record.vue          # 历史记录列表
│       ├── profile.vue         # 个人统计主页
│       └── statistics.vue      # 表格统计 & 导出
│
├── components/                 # 公共/业务组件
│   ├── common/
│   │   ├── NavBar.vue          # 自定义导航栏（适老化）
│   │   ├── LoadMore.vue        # 上拉加载更多
│   │   ├── EmptyState.vue      # 空状态占位
│   │   └── UploadImage.vue     # 图片上传组件
│   └── volunteer/
│       ├── ActivityCard.vue    # 活动列表项
│       ├── CheckinCard.vue     # 打卡列表项
│       └── StatTable.vue       # 统计表格
│
├── composables/                # Vue 3 组合式函数（可复用逻辑）
│   ├── useRequest.ts           # 通用请求 Hook（loading/error 状态）
│   ├── usePagination.ts        # 分页逻辑封装
│   └── useUpload.ts            # 文件上传逻辑
│
├── utils/
│   ├── format.ts               # 日期、数字格式化工具
│   ├── validator.ts            # 表单校验规则
│   └── permission.ts           # 角色权限判断（管理员/普通用户）
│
├── styles/
│   ├── variables.scss          # CSS 变量（颜色/字号/间距）
│   ├── mixins.scss             # SCSS Mixin
│   └── global.scss             # 全局基础样式 & 适老化覆盖
│
├── types/                      # TypeScript 类型定义
│   ├── user.d.ts
│   └── volunteer.d.ts
│
├── App.vue
├── main.ts
├── pages.json                  # 路由配置
└── manifest.json
```

---

## 3. 全局规范与编码约定

### 3.1 文件命名

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 页面组件 | `kebab-case.vue` | `signup-detail.vue` |
| 公共组件 | `PascalCase.vue` | `CourseCard.vue` |
| Store | `camelCase.ts` | `volunteer.ts` |
| API 模块 | `camelCase.ts` | `course.ts` |
| 工具函数 | `camelCase.ts` | `format.ts` |

### 3.2 Vue 3 组件模板

所有页面和组件统一使用 `<script setup lang="ts">` 语法糖：

```vue
<script setup lang="ts">
/**
 * @page signup-detail
 * @description 报名详情页 —— 展示活动信息并支持用户确认报名
 * @module volunteer
 */

import { ref, computed, onMounted } from 'vue'
import { useVolunteerStore } from '@/stores/volunteer'
import type { Activity } from '@/types/volunteer'

// ────── Props ──────
const props = defineProps<{
  activityId: string // 活动 ID，由路由参数传入
}>()

// ────── Store ──────
const volunteerStore = useVolunteerStore()

// ────── 响应式数据 ──────
const activity = ref<Activity | null>(null)  // 当前活动详情
const loading = ref(false)                   // 加载状态

// ────── 计算属性 ──────
const isFull = computed(() =>
  activity.value ? activity.value.enrollCount >= activity.value.maxCount : false
)

// ────── 生命周期 ──────
onMounted(async () => {
  await fetchDetail()
})

// ────── 方法 ──────
/**
 * 获取活动详情
 */
async function fetchDetail() {
  loading.value = true
  try {
    activity.value = await volunteerStore.fetchActivityById(props.activityId)
  } finally {
    loading.value = false
  }
}

/**
 * 确认报名
 * 报名成功后跳转至打卡列表页
 */
async function handleSignup() {
  if (!activity.value) return
  await volunteerStore.signupActivity(activity.value.id)
  uni.navigateTo({ url: '/pages/volunteer/checkin-list' })
}
</script>
```

### 3.3 注释规范

```ts
// ① 文件头注释（每个 .ts / .vue 文件必须）
/**
 * @file volunteer.ts
 * @description 志愿活动模块 Pinia Store
 *              负责活动列表、报名、打卡、统计数据的状态管理
 * @author [开发者]
 */

// ② 函数注释（公开函数、API 函数必须）
/**
 * 获取志愿活动列表
 * @param params - 筛选参数（时间段、地点）
 * @returns Promise<Activity[]>
 */

// ③ 关键逻辑行内注释
const token = uni.getStorageSync('token') // 从本地缓存读取 JWT Token

// ④ TODO / FIXME 标记（预留接口处）
// TODO: 预留数字人教师接口，待后端提供 AI 课程录制 API 后对接
```

### 3.4 错误处理约定

```ts
// 所有 async 函数统一使用 try/catch，不允许吞掉错误
try {
  await someApi()
} catch (error) {
  // 统一通过 uv-ui Toast 展示错误信息
  uni.showToast({ title: '操作失败，请重试', icon: 'error' })
  console.error('[volunteer] fetchList error:', error)
}
```

---

## 4. 状态管理（Pinia）设计

### 4.1 用户 Store（`stores/user.ts`）

```ts
/**
 * @store userStore
 * @description 全局用户信息，登录态、角色权限
 */
interface UserState {
  token: string           // JWT Token
  userId: string          // 用户 ID
  nickname: string        // 昵称
  avatar: string          // 头像 URL
  unit: string            // 所属单位
  role: 'admin' | 'member' // admin=管理员可发布活动，member=普通银发人才
  // 统计汇总（来自后端，登录后缓存）
  totalHours: number      // 累计志愿时长（小时）
  totalCount: number      // 累计参与次数
  totalServed: number     // 累计服务人次
}
```

**Actions**：
- `login(code: string)` — 微信 code 换 token，写入本地缓存
- `logout()` — 清除 token 和本地缓存
- `fetchProfile()` — 拉取最新用户信息（含统计汇总）

---

### 4.2 志愿 Store（`stores/volunteer.ts`）

```ts
/**
 * @store volunteerStore
 * @description 志愿活动模块状态管理
 */
interface VolunteerState {
  activityList: Activity[]       // 活动列表（报名页）
  mySignups: Activity[]          // 我已报名的活动（打卡页用）
  myRecords: CheckinRecord[]     // 我的打卡记录
  statistics: StatisticsData | null // 统计报表数据
  // 筛选条件（与后端查询参数一一对应）
  filter: {
    timeRange: 'today' | 'week' | 'month' | 'custom'
    location: string   // 空字符串=全部
    startDate?: string
    endDate?: string
  }
}
```

**Actions**：
- `fetchActivityList(filter)` — 获取活动列表（含筛选）
- `fetchActivityById(id)` — 获取单个活动详情
- `publishActivity(form)` — 发布活动（管理员）
- `signupActivity(activityId)` — 报名参加活动
- `cancelSignup(activityId)` — 取消报名
- `fetchMySignups()` — 获取我已报名的活动
- `submitCheckin(form)` — 提交打卡（时长、人数、图片）
- `fetchMyRecords()` — 获取个人历史记录
- `fetchStatistics(params)` — 获取统计报表数据
- `exportReport(params)` — 导出报表（调用后端生成 Excel/PDF）

---

## 5. 路由与页面清单

在 `pages.json` 中配置：

```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationBarTitleText": "银发人才平台" } },

    // ── 2.3 志愿活动 ──
    { "path": "pages/volunteer/index",         "style": { "navigationBarTitleText": "志愿活动" } },
    { "path": "pages/volunteer/publish",       "style": { "navigationBarTitleText": "发布活动" } },
    { "path": "pages/volunteer/signup-list",   "style": { "navigationBarTitleText": "报名" } },
    { "path": "pages/volunteer/signup-detail", "style": { "navigationBarTitleText": "报名详情" } },
    { "path": "pages/volunteer/checkin-list",  "style": { "navigationBarTitleText": "打卡" } },
    { "path": "pages/volunteer/checkin-form",  "style": { "navigationBarTitleText": "打卡详情" } },
    { "path": "pages/volunteer/record",        "style": { "navigationBarTitleText": "记录" } },
    { "path": "pages/volunteer/profile",       "style": { "navigationBarTitleText": "个人" } },
    { "path": "pages/volunteer/statistics",    "style": { "navigationBarTitleText": "统计报表" } }
  ],
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index",       "text": "首页" },
      { "pagePath": "pages/volunteer/index",   "text": "志愿" },
      { "pagePath": "pages/volunteer/profile", "text": "我的" }
    ]
  }
}
```

### 页面间跳转参数说明

| 来源页 | 目标页 | 传递参数 |
|--------|--------|----------|
| signup-list | signup-detail | `?activityId=xxx` |
| signup-detail → 报名成功 | checkin-list | `uni.navigateTo` |
| checkin-list | checkin-form | `?activityId=xxx` |

---

## 6. API 接口层设计

### 6.1 请求封装（`api/http.ts`）

```ts
/**
 * @file http.ts
 * @description uni.request 封装，统一处理 BaseURL、Token、错误码
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL // 从环境变量读取

/** 通用响应结构（与后端约定） */
interface ApiResponse<T> {
  code: number    // 0=成功，其他=错误
  message: string
  data: T
}

/**
 * 封装 uni.request
 * 自动注入 Authorization Header
 * code !== 0 时自动 reject 并 Toast 提示
 */
function request<T>(options: UniApp.RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token')
    uni.request({
      ...options,
      url: BASE_URL + options.url,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.header,
      },
      success(res) {
        const result = res.data as ApiResponse<T>
        if (result.code === 0) {
          resolve(result.data)
        } else if (result.code === 401) {
          // Token 过期，跳转登录
          uni.navigateTo({ url: '/pages/login/index' })
          reject(new Error('登录已过期'))
        } else {
          uni.showToast({ title: result.message || '请求失败', icon: 'none' })
          reject(new Error(result.message))
        }
      },
      fail(err) {
        uni.showToast({ title: '网络异常，请检查连接', icon: 'none' })
        reject(err)
      },
    })
  })
}

export const http = {
  get: <T>(url: string, params?: object) =>
    request<T>({ url, method: 'GET', data: params }),
  post: <T>(url: string, data?: object) =>
    request<T>({ url, method: 'POST', data }),
  put: <T>(url: string, data?: object) =>
    request<T>({ url, method: 'PUT', data }),
  delete: <T>(url: string, data?: object) =>
    request<T>({ url, method: 'DELETE', data }),
}
```

---

### 6.2 志愿活动接口（`api/volunteer.ts`）

```ts
/**
 * @file volunteer.ts
 * @description 2.3 志愿活动参加统计接口定义
 *
 * 接口前缀：/api/volunteer
 * 后端请参考此文件定义对应 Controller
 */

import { http } from './http'
import type { Activity, CheckinRecord, StatisticsData } from '@/types/volunteer'

export const volunteerApi = {

  // ════════════════════
  //  活动管理
  // ════════════════════

  /**
   * 获取活动列表（支持筛选）
   * @param timeRange - 时间段：today / week / month / custom
   * @param location  - 地点关键词（空=全部）
   * @param startDate - 自定义开始日期（timeRange=custom 时必传）
   * @param endDate   - 自定义结束日期
   * @param keyword   - 搜索关键词
   */
  getActivityList: (params: {
    timeRange?: string
    location?: string
    startDate?: string
    endDate?: string
    keyword?: string
    page: number
    pageSize?: number
  }) =>
    http.get<{ list: Activity[]; total: number }>('/api/volunteer/activities', params),

  /** 获取单个活动详情 */
  getActivityById: (id: string) =>
    http.get<Activity>(`/api/volunteer/activities/${id}`),

  /**
   * 发布活动（仅管理员角色可调用）
   * 后端需校验 role === 'admin'
   */
  publishActivity: (data: {
    name: string          // 活动名称
    startTime: string     // 开始时间（ISO 8601）
    endTime: string       // 结束时间
    location: string      // 活动地点
    description: string   // 内容/需求
    maxCount: number      // 最大报名人数
  }) =>
    http.post<Activity>('/api/volunteer/activities', data),

  // ════════════════════
  //  报名管理
  // ════════════════════

  /** 确认报名某活动 */
  signup: (activityId: string) =>
    http.post<void>('/api/volunteer/signups', { activityId }),

  /** 取消报名 */
  cancelSignup: (activityId: string) =>
    http.delete<void>(`/api/volunteer/signups/${activityId}`),

  /** 获取当前用户已报名的活动列表（用于打卡页） */
  getMySignups: () =>
    http.get<Activity[]>('/api/volunteer/signups/mine'),

  // ════════════════════
  //  打卡管理
  // ════════════════════

  /**
   * 提交打卡
   * 图片通过 uni.uploadFile 上传后获得 URL，再随此接口一起提交
   */
  submitCheckin: (data: {
    activityId: string      // 关联活动 ID
    serviceHours: number    // 服务时长（小时，支持小数）
    serviceCount: number    // 服务人数
    photos: string[]        // 现场照片 URL 数组（最多 9 张）
    remark?: string         // 备注（可选）
  }) =>
    http.post<CheckinRecord>('/api/volunteer/checkins', data),

  // ════════════════════
  //  记录 & 统计
  // ════════════════════

  /** 获取当前用户历史打卡记录（分页） */
  getMyRecords: (params: { page: number; pageSize?: number }) =>
    http.get<{ list: CheckinRecord[]; total: number }>('/api/volunteer/records/mine', params),

  /**
   * 获取统计报表数据
   * @param scope - personal=个人，team=团队整体
   * @param period - all / month / quarter / year
   */
  getStatistics: (params: {
    scope: 'personal' | 'team'
    period: 'all' | 'month' | 'quarter' | 'year'
    startDate?: string
    endDate?: string
  }) =>
    http.get<StatisticsData>('/api/volunteer/statistics', params),

  /**
   * 导出统计报表
   * 后端返回下载链接或直接触发文件流
   * 前端使用 uni.downloadFile 保存或 webview 预览
   */
  exportReport: (params: {
    scope: 'personal' | 'team'
    period: string
    format: 'excel' | 'pdf'
  }) =>
    http.post<{ downloadUrl: string }>('/api/volunteer/statistics/export', params),
}
```

---

## 7. 2.3 志愿活动参加统计模块

### 7.1 TypeScript 类型定义（`types/volunteer.d.ts`）

```ts
/** 活动状态枚举 */
export type ActivityStatus = 'recruiting' | 'upcoming' | 'ongoing' | 'ended'

/** 志愿活动 */
export interface Activity {
  id: string
  name: string
  startTime: string            // ISO 8601
  endTime: string
  location: string
  description: string
  maxCount: number             // 最大报名人数
  enrollCount: number          // 当前报名人数
  status: ActivityStatus
  publisherId: string
  createdAt: string
  // 当前用户是否已报名（列表接口附带）
  isSignedUp?: boolean
  // 当前用户是否已打卡
  isCheckedIn?: boolean
}

/** 打卡记录 */
export interface CheckinRecord {
  id: string
  activityId: string
  activityName: string
  activityLocation: string
  serviceHours: number
  serviceCount: number
  photos: string[]
  remark: string
  checkedAt: string
  status: 'pending' | 'approved' | 'rejected' // 后端审核状态
}

/** 统计报表数据 */
export interface StatisticsData {
  // 个人 / 团队汇总
  totalHours: number
  totalCount: number
  totalServed: number
  // 按活动类型分组
  byCategory: Array<{
    category: string
    count: number
    totalHours: number
  }>
  // 按活动列表明细（团队统计页使用）
  byActivity: Array<{
    activityName: string
    personCount: number
    totalHours: number
  }>
}
```

### 7.2 各页面实现要点

#### `pages/volunteer/index.vue` — 首页（四格入口）

```
┌────────┬────────┐
│  ✅打卡 │  📢发布 │  ← 发布按钮仅 role==='admin' 时显示
├────────┼────────┤
│  📋记录 │  📝报名 │
└────────┴────────┘
```

- 用 `v-if="userStore.role === 'admin'"` 控制"发布"入口的显示
- 卡片点击用 `uni.navigateTo` 跳转对应页面

---

#### `pages/volunteer/publish.vue` — 发布活动

**表单字段**：

| 字段 | 组件 | 校验规则 |
|------|------|----------|
| 活动名称 | `uv-input` | 必填，≤ 50 字 |
| 活动开始时间 | `uv-datetime-picker` | 必填，不能早于今天 |
| 活动结束时间 | `uv-datetime-picker` | 必填，晚于开始时间 |
| 活动地点 | `uv-input` | 必填，≤ 100 字 |
| 最大报名人数 | `uv-number-box` | 必填，1-999 |
| 内容/需求 | `uv-textarea` | 必填，≤ 500 字 |

提交前使用 `uv-form` 内置校验，校验通过后调用 `volunteerApi.publishActivity()`。

---

#### `pages/volunteer/signup-list.vue` — 报名（活动列表）

- **搜索栏**：输入关键词实时调用 `fetchActivityList`（防抖 300ms）
- **筛选面板**：
  - 时间段：今天 / 本周 / 本月 / 自定义（选自定义显示日期选择器）
  - 地点：全部 / 多个预设地点（pills 多选）
- 活动卡片展示状态标签（颜色映射见下表）
- 下拉刷新 + 上拉加载更多

**状态颜色映射**：

```ts
const STATUS_MAP: Record<ActivityStatus, { text: string; color: string; bg: string }> = {
  recruiting: { text: '招募中',   color: '#3a7bd5', bg: '#eef3fc' },
  upcoming:   { text: '即将开始', color: '#e67e22', bg: '#fff3e0' },
  ongoing:    { text: '进行中',   color: '#27ae60', bg: '#e6f9f0' },
  ended:      { text: '已结束',   color: '#a0aab5', bg: '#f0f2f4' },
}
```

---

#### `pages/volunteer/signup-detail.vue` — 报名详情

- 展示活动完整信息（`ActivityCard` + 详情行）
- "报名人数"进度条：`enrollCount / maxCount`
- `isFull` 时"确认报名"按钮置灰并提示"名额已满"
- `isSignedUp` 时展示"已报名"徽标，按钮变"取消报名"

---

#### `pages/volunteer/checkin-list.vue` — 打卡（已报名列表）

- 拉取 `getMySignups()`，仅展示状态为 `upcoming` 或 `ongoing` 的活动
- `isCheckedIn === true` 的活动显示"已打卡"徽标，置灰不可点击
- 点击未打卡活动 → 跳转 `checkin-form?activityId=xxx`

---

#### `pages/volunteer/checkin-form.vue` — 打卡填报

**表单字段**：

| 字段 | 组件 | 校验规则 |
|------|------|----------|
| 服务时长 (h) | `uv-input` type=number | 必填，0.5-24，步长 0.5 |
| 服务人数 | `uv-input` type=number | 必填，≥ 1 |
| 现场照片 | `UploadImage.vue` | 可选，最多 9 张，单张 ≤ 5MB |
| 备注 | `uv-textarea` | 可选，≤ 200 字 |

图片上传流程：
```
uni.chooseImage → uni.uploadFile(/api/upload/image) → 返回 URL → 存入 photos[]
```

---

#### `pages/volunteer/statistics.vue` — 统计报表

- 顶部 Tab：全部时间 / 本月 / 本季度 / 本年
- Tab 切换时重新调用 `getStatistics()`
- "个人统计" / "团队统计" 两个 Segment 切换
- 表格由 `StatTable.vue` 组件渲染（传入表头和数据）
- **导出按钮**流程：
  ```
  调用 exportReport() → 获得 downloadUrl
  → uni.downloadFile 下载文件
  → uni.openDocument 预览（或保存到相册/文件管理器）
  ```

---

## 8. 公共组件库

### 8.1 `UploadImage.vue`

```vue
<!--
  @component UploadImage
  @description 图片上传组件，支持多图预览、删除、上传进度
  @props
    maxCount  Number  最大图片数量，默认 9
    maxSize   Number  单张最大 MB，默认 5
  @emits
    update:modelValue  上传成功后返回 URL 数组
-->
```

**Props / Emits**：

```ts
const props = defineProps<{
  modelValue: string[]   // 已上传图片 URL 数组（v-model）
  maxCount?: number      // 默认 9
  maxSize?: number       // 单张限制 MB，默认 5
}>()

const emit = defineEmits<{
  'update:modelValue': [urls: string[]]
}>()
```

---

### 8.2 `StatTable.vue`

```vue
<!--
  @component StatTable
  @description 通用统计表格，含合计行高亮
  @props
    columns  TableColumn[]  表头定义
    rows     any[][]        数据行
    totalRow any[]          合计行（可选，高亮显示）
-->
```

---

### 8.3 `EmptyState.vue`

```vue
<!--
  @component EmptyState
  @description 数据为空时的占位组件（适老化大图标 + 大字提示）
  @props    iconName String  Mingcute 图标名（推荐，如 calendar-line）    text     String  主提示文字    subText  String  副提示文字（可省略）
-->
```

---

## 9. 适老化 UI 规范

以下规范在 `styles/variables.scss` 中以 CSS 变量定义，全局生效：

```scss
// ── 字体大小（比普通小程序大 2-4px）──
--font-xs:   13px;   // 次要信息
--font-sm:   15px;   // 辅助文字
--font-base: 17px;   // 正文（默认）
--font-lg:   19px;   // 标题
--font-xl:   22px;   // 大标题

// ── 行高 ──
--line-height-base: 1.7;  // 宽松行距，方便阅读

// ── 点击区域最小尺寸 ──
--tap-min-size: 44px;     // iOS HIG 标准

// ── 间距 ──
--space-xs:  8px;
--space-sm:  12px;
--space-md:  16px;
--space-lg:  24px;

// ── 主题色（与 HTML 参考稿一致）──
--color-primary:     #3a7bd5;
--color-primary-bg:  #eef3fc;
--color-text-main:   #1e2a3a;
--color-text-sub:    #6b7b8d;
--color-text-muted:  #a0aab5;
--color-border:      #e2e7ec;
--color-bg-page:     #f0f2f5;
```

**组件适老化要点**：
- 所有按钮高度 ≥ 44px，圆角 10px
- 表单 input 高度 ≥ 44px，padding 充足
- 图标搭配文字说明，不单独使用图标
- 错误提示文字 ≥ 13px，颜色 `#e74c3c`
- 加载状态使用 uv-loading 大号图标

---

## 10. 后端对接说明

### 10.1 统一响应格式（后端需遵守）

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

错误码约定：

| code | 含义 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录 / Token 过期 |
| 403 | 权限不足（如普通用户访问管理员接口） |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

### 10.2 分页约定

- 请求参数：`page`（1-based）、`pageSize`（默认 10）
- 响应结构：`{ list: T[], total: number }`

---

### 10.3 文件上传

- 接口：`POST /api/upload/image`
- 请求：`multipart/form-data`，字段名 `file`
- 响应：`{ url: "https://cdn.example.com/xxx.jpg" }`
- 限制：单文件 ≤ 5MB，支持 jpg/png/webp

---

### 10.4 权限控制

- 前端通过 `userStore.role` 控制 UI 显示（如发布按钮）
- **后端必须二次校验**，不可信任前端传入的角色信息
- 建议后端在 JWT payload 中携带 `role` 字段

---

### 10.5 数字人教师预留接口（待定）

```ts
// 前端预留调用点位于 pages/course/detail.vue 底部
// 待后端提供 AI 课程生成能力后，补充以下接口：
//
// POST /api/course/ai-lesson
// Body: { script: string, teacherModel: string }
// Response: { taskId: string }  <- 轮询任务状态
//
// GET /api/course/ai-lesson/:taskId
// Response: { status: 'pending'|'done'|'error', videoUrl?: string }
```

---

*文档结束 · 如有更新请同步修改此文件并注明变更日期*
