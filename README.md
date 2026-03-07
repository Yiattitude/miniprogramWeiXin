# 银发人才平台 · 志愿活动统计小程序 · 前端

## 技术栈

| 分类 | 技术 | 版本 |
|------|------|------|
| 跨端框架 | [uni-app](https://uniapp.dcloud.net.cn) | 4.08 |
| 前端框架 | Vue 3 (Composition API) | ^3.4 |
| 构建工具 | Vite + `@dcloudio/vite-plugin-uni` | 5.2 |
| 语言 | TypeScript | ^5.0 |
| 状态管理 | Pinia | ^2.1 |
| UI 组件库 | [@climblee/uv-ui](https://www.uvui.cn) | ^1.1 |
| 日期处理 | Day.js | ^1.11 |
| 样式预处理 | Sass (SCSS) | ^1.69 |
| 云开发 | 微信云开发（云函数 + 云数据库） | — |
| 目标平台 | 微信小程序（`mp-weixin`） | — |

---

## 前置要求

### 1. 运行环境

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| Node.js | ≥ 18 | 推荐使用 LTS 版本 |
| Bun | 最新版 | 用于运行 `bun run` 脚本 |
| 微信开发者工具 | 最新稳定版 | 预览和调试小程序 |

### 2. 微信云开发环境

1. 登录 [微信公众平台](https://mp.weixin.qq.com)，确认小程序 AppID 为 `wx2b8ff48151cc1a2b`
2. 在微信开发者工具中开通**云开发**，记录云开发**环境 ID**
3. 打开 `src/App.vue`，确认 `wx.cloud.init` 中的 `env` 字段为真实环境 ID：
   ```js
   wx.cloud.init({
     env: 'cloud1-9gqeut4h5f964174',  // ← 确认此处为你的环境 ID
     traceUser: true,
   })
   ```

### 3. 部署云函数

在微信开发者工具中，右键点击 `cloudfunctions/volunteer-service` 目录：

> **「上传并部署：云端安装依赖」**

并在云开发控制台手动创建以下数据库集合（如不存在）：

| 集合名 | 用途 |
|--------|------|
| `activities` | 志愿活动 |
| `signups` | 报名记录 |
| `records` | 打卡记录 |

---

## 安装依赖

```bash
cd mini-frontend
npm install
# 或
bun install
```

---

## 编译运行

```bash
bun run dev:mp-weixin
```
# 或
```bash
npm run dev:mp-weixin
```

编译成功后，使用**微信开发者工具**导入以下目录进行预览：

```
mini-frontend/dist/dev/mp-weixin
```

> 编译过程中出现 Sass `@import` 废弃警告属正常现象，不影响运行。

---
