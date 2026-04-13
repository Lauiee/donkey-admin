/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  /** 개발 서버 전용(vite.config): /api 프록시 대상 URL. 클라이언트 번들에서는 미사용 */
  readonly VITE_API_PROXY_TARGET?: string;
  /** STT 채점 API Base — 비우면 개발 시 `/turing-api`(Vite 프록시) */
  readonly VITE_TURING_API_BASE?: string;
  /** STT 채점 API 키 (`X-API-Key`) */
  readonly VITE_TURING_API_KEY?: string;
  /** 개발 전용: "true"면 로그인·백엔드 없이 관리자 UI 프리뷰 */
  readonly VITE_DEV_PREVIEW?: string;
  /** 프리뷰 시 역할: admin | 그 외(client) */
  readonly VITE_DEV_PREVIEW_ROLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
