import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET?.trim() || "http://localhost:8000";

  return {
    plugins: [react()],
    root: ".",
    build: {
      outDir: "dist",
    },
    server: {
      port: 3000,
      proxy: {
        "/api": {
          target: apiProxyTarget,
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
  };
});
