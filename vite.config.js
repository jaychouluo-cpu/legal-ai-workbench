import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 单文件打包：构建产物为一个自包含 HTML，可直接在内网/离线环境双击打开，
// 契合整合方案「数据不出域 · 内网私有化」的部署红线。
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    target: 'es2018',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 8000,
  },
})
