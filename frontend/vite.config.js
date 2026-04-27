// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       // 경로가 /user로 시작하는 요청을 백엔드 서버로 보냅니다.
//       '/user': {
//         target: 'http://localhost:8080', // 내 스프링 부트 서버 주소
//         changeOrigin: true,
//         secure: false,
//       },
//       // 다른 API 경로가 더 있다면 여기에 추가할 수 있습니다.
//       '/api': {
//         target: 'http://localhost:8080',
//         changeOrigin: true,
//       }
//     }
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // ✅ Spring Boot (포트 8080)
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
      '/chatbot': {
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
      '/oauth2': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },

      // ✅ Python AI 서버 (포트 8000)
      '/recipe/recommend': {
      target: 'http://localhost:8080',  // ← Spring Boot
      changeOrigin: true,
      secure: false,
      },
      '/recipe/search': {
          target: 'http://localhost:8080',  // ← Spring Boot
          changeOrigin: true,
          secure: false,
      },

      '/item-master': {
      target: 'http://localhost:8080',
      changeOrigin: true,
      secure: false,
      },
    }
  }
})