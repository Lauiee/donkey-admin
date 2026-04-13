import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  root: ".",
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      /** STT 채점 API (X-API-Key) — CORS 우회용, 클라이언트는 /turing-api 로 요청 */
      "/turing-api": {
        target: "https://turing.donkey.ai.kr",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/turing-api/, ""),
      },
    },
  },
});
