import { createSSRApp } from 'vue'
import * as Pinia from 'pinia'
import App from './App.vue'
import 'mingcute_icon/font/Mingcute.css'

export function createApp() {
  const app = createSSRApp(App)
  
  const pinia = Pinia.createPinia()
  app.use(pinia)
  
  return {
    app,
    pinia
  }
}
