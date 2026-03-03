/**
 * @file main.ts
 * @description uni-app Vue3 应用入口，注册 Pinia 状态管理和 uView Plus 组件库
 */

import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// uv-ui 采用按需引入，无需在此全局注册
// 若需全局注册，取消注释以下两行：
// import uvui from '@climblee/uv-ui'
// app.use(uvui)

export function createApp() {
  const app = createSSRApp(App)

  // 注册 Pinia
  const pinia = createPinia()
  app.use(pinia)

  return { app, pinia }
}
