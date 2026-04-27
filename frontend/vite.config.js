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
      // ✅ Spring Boot (포트 8080)
      "/user": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        bypass: (req) => (req.headers.accept.indexOf("text/html") !== -1 ? "/index.html" : null), // 준호 추가
      },
      "/market": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        bypass: (req) => (req.headers.accept.indexOf("text/html") !== -1 ? "/index.html" : null), // 준호 추가
      },
      "/auth": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/stamp": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/admin": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        bypass: (req) => (req.headers.accept.indexOf("text/html") !== -1 ? "/index.html" : null),
      },
      "/chatbot": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/login": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/oauth2": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },

      // ✅ Python AI 서버 (포트 8000)
      "/recipe": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
},
});