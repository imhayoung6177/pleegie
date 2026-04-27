import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // 1️⃣ Spring Boot 서버 (포트 8080) 연동
      // /user, /market, /chatbot 등 스프링으로 보내야 하는 경로들
      '/user': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/market': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/stamp': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/chatbot': {  // ✅ 챗봇 요청은 스프링부트(8080)가 먼저 받아서 처리함
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

      // 2️⃣ Python AI 서버 (포트 8000) 직접 연동 필요 시
      // 만약 레시피 추천 등을 파이썬에서 직접 가져온다면 사용
      '/recipe': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})