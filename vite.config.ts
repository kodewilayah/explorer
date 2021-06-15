import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      plugins: [visualizer()]
    }
  }
})
