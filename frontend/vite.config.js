import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({

  server: {
    proxy: {
      '/api': 'http://localhost:8080' // /api로 시작하는 요청은 자바로 보낸다!
    }
  },
  plugins: [react()],
})
