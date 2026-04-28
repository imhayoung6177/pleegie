import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // ✅ Spring Boot (포트 8080)
      "/user": {
        target: "http://localhost:8080",
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
          "/recipe/recommend": {
            target: "http://localhost:8080", // ← Spring Boot
            changeOrigin: true,
            secure: false,
          },
          "/recipe/search": {
            target: "http://localhost:8080", // ← Spring Boot
            changeOrigin: true,
            secure: false,
          },

          "/item-master": {
            target: "http://localhost:8080",
            changeOrigin: true,
            secure: false,
          },
        },
      },
    },
  },
});
