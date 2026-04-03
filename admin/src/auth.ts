const TOKEN_KEY = "nbrief_admin_token";
const ROLE_KEY = "nbrief_admin_role";

export type UserRole = "client" | "admin";

export function getRole(): UserRole | null {
  const r = localStorage.getItem(ROLE_KEY);
  if (r === "client" || r === "admin") return r;
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

export function isLoggedIn(): boolean {
  return !!getToken();
}
