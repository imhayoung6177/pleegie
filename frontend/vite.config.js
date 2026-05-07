import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
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
                bypass: (req) => {
                    //  /market/scan은 React 라우터가 처리하도록 bypass
                    if (req.url.startsWith('/market/scan')) {
                        return req.url;
                    }
                }
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
            '/api/ingredients': {
                target: 'http://localhost:8000',
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
            '/item-master': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },

            // ✅ Spring Boot 경유 (필터링 적용)
            '/recipe/recommend': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
            '/recipe/search': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },

            // ✅ Python AI 서버 (포트 8000)
            '/recipe': {
                target: 'http://localhost:8000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
})