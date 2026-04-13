const TOKEN_KEY = "donkey_admin_token";
const ROLE_KEY = "donkey_admin_role";

export type UserRole = "client" | "admin";

export function getRole(): UserRole | null {
  const r = localStorage.getItem(ROLE_KEY);
  if (r === "client" || r === "admin") return r;
  if (isDevAuthBypass()) return devPreviewRole();
  return null;
}

export function setRole(role: UserRole): void {
  localStorage.setItem(ROLE_KEY, role);
}

export function clearRole(): void {
  localStorage.removeItem(ROLE_KEY);
}

/** JWT payload에서 exp(초 단위)를 읽어 만료 시각(ms) 반환. 실패 시 null */
export function getTokenExpiresAtMs(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    const data = JSON.parse(json) as { exp?: number };
    if (typeof data.exp !== "number") return null;
    return data.exp * 1000;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  clearRole();
}

/** 로컬에서 레이아웃만 볼 때 (백엔드·로그인 없이). 프로덕션 빌드에서는 무시됨. */
export function isDevAuthBypass(): boolean {
  return (
    import.meta.env.DEV && import.meta.env.VITE_DEV_PREVIEW === "true"
  );
}

function devPreviewRole(): UserRole {
  return import.meta.env.VITE_DEV_PREVIEW_ROLE === "admin"
    ? "admin"
    : "client";
}

export function isLoggedIn(): boolean {
  if (isDevAuthBypass()) return true;
  return !!getToken();
}
