import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const apiProxyTarget =
    env.VITE_API_PROXY_TARGET?.trim() || "http://localhost:8000";

  /**
   * STT 채점(Turing) API 프록시 — 도메인(cnt/hippo)별로 다른 백엔드.
   *   기본값: 로컬에 양쪽 백엔드가 떠있다고 가정(127.0.0.1:4314 cnt, 127.0.0.1:4313 hippo).
   *   외부 도메인으로 보내고 싶으면 VITE_TURING_CNT_TARGET / VITE_TURING_HIPPO_TARGET 환경변수.
   *     cnt   : cntt.turing.intcorp.ai (포트 4314)
   *     hippo : turing.donkey.ai.kr    (포트 4313)
   * 클라이언트는 도메인에 따라 /turing-api (cnt) 또는 /turing-api-hippo (hippo)로 요청.
   */
  const turingCntTarget =
    env.VITE_TURING_CNT_TARGET?.trim() || "http://127.0.0.1:4314";
  const turingHippoTarget =
    env.VITE_TURING_HIPPO_TARGET?.trim() || "http://127.0.0.1:4313";

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
        "/turing-api-hippo": {
          target: turingHippoTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/turing-api-hippo/, ""),
        },
        "/turing-api": {
          target: turingCntTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/turing-api/, ""),
        },
      },
    },
  };
});
