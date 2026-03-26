import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
  plugins: [uni()],
  // Ensure optional chaining / nullish coalescing are transpiled for real devices
  esbuild: {
    target: 'es2015',
  },
  build: {
    target: 'es2015',
  },
})
