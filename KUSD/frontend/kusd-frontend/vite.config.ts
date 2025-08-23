import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 开放外部访问
    port: 5173,
    cors: true
  },
  preview: {
    host: true,
    port: 4173,
    cors: true
  }
})
