import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
      '/manifest.json': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: () => '/api/v1/pwa/manifest',
      }
    }
  }
})

