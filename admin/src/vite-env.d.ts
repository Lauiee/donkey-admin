/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  /** 개발 전용: "true"면 로그인·백엔드 없이 관리자 UI 프리뷰 */
  readonly VITE_DEV_PREVIEW?: string;
  /** 프리뷰 시 역할: admin | 그 외(client) */
  readonly VITE_DEV_PREVIEW_ROLE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
