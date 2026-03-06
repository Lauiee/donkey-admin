const TOKEN_KEY = "donkey_admin_token";

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
}

export function isLoggedIn(): boolean {
  return !!getToken();
}
