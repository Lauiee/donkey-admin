import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getMe, refreshSession } from "../api";
import {
  clearToken,
  getRole,
  getToken,
  isDevAuthBypass,
  setRole,
  setToken,
  getTokenExpiresAtMs,
  type UserRole,
} from "../auth";

const navItems: {
  to: string;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
}[] = [
  {
    to: "/dashboard",
    label: "대시보드",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    to: "/usage",
    label: "사용량",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    to: "/billing",
    label: "비용",
    disabled: true,
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    to: "/history",
    label: "사용 내역",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    to: "/inquiry",
    label: "이용 문의",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    to: "/turing",
    label: "Turing",
    icon: (
      <svg
        className="w-5 h-5 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M22 12h-4l-3 9L9 3l-3 9H2"
        />
      </svg>
    ),
  },
];

function formatRemaining(ms: number): string {
  if (ms <= 0) return "세션 만료됨";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `세션 만료까지 ${h}시간 ${m}분 ${s}초`;
  if (m > 0) return `세션 만료까지 ${m}분 ${s}초`;
  return `세션 만료까지 ${s}초`;
}

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search || "";
  const [role, setRoleState] = useState<UserRole | null>(() => getRole());
  const [remaining, setRemaining] = useState<string>("");
  const [extending, setExtending] = useState(false);

  useEffect(() => {
    if (role) return;
    if (isDevAuthBypass()) return;
    getMe()
      .then((me) => {
        const r: UserRole = me.role === "admin" ? "admin" : "client";
        setRole(r);
        setRoleState(r);
      })
      .catch(() => {
        clearToken();
        navigate("/login", { replace: true });
      });
  }, [role, navigate]);

  const handleExtend = async () => {
    if (isDevAuthBypass()) return;
    setExtending(true);
    try {
      const { access_token } = await refreshSession();
      setToken(access_token);
    } catch {
      clearToken();
      navigate("/login", { replace: true });
    } finally {
      setExtending(false);
    }
  };

  useEffect(() => {
    const tick = () => {
      const token = getToken();
      if (!token) {
        setRemaining("");
        return;
      }
      const expiresAt = getTokenExpiresAtMs(token);
      if (expiresAt == null) {
        setRemaining("");
        return;
      }
      const ms = expiresAt - Date.now();
      setRemaining(formatRemaining(ms));
      if (ms <= 0) {
        clearToken();
        navigate("/login", { replace: true });
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="font-sans h-screen overflow-hidden bg-transparent flex">
      <aside className="w-60 h-screen flex shrink-0 flex-col overflow-y-auto rounded-r-3xl border-r border-brand-line/80 bg-white/95 shadow-admin-sidebar backdrop-blur-sm">
        <div className="flex h-14 items-center border-b border-brand-line/60 bg-gradient-to-r from-brand-violet/[0.06] via-white to-brand-accent/[0.05] px-4">
          <span className="bg-gradient-to-r from-brand-navy to-brand-violet bg-clip-text font-bold tracking-tight text-transparent">
            DONKEY
          </span>
        </div>
        <nav className="p-3 flex flex-col gap-1 flex-1">
          {navItems
            .filter(
              (item) =>
                role !== "admin" ||
                item.to === "/inquiry" ||
                item.to === "/turing",
            )
            .filter((item) => !item.disabled || item.to === "/billing")
            .map(({ to, label, icon, disabled }) =>
              disabled ? (
                <span
                  key={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-brand-mint cursor-not-allowed opacity-75"
                >
                  {icon}
                  {label}
                </span>
              ) : (
                <NavLink
                  key={to}
                  to={`${to}${search}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-brand-violet to-brand-navy text-white shadow-md shadow-brand-violet/25"
                        : "border border-transparent text-brand-slate hover:border-brand-line hover:bg-brand-surface"
                    }`
                  }
                >
                  {icon}
                  {label}
                </NavLink>
              ),
            )}
        </nav>
        <div className="p-3 border-t border-brand-line/60 space-y-1">
          {remaining && (
            <>
              <div className="px-3 py-2 rounded-xl bg-brand-surface text-xs text-brand-slate font-medium">
                {remaining}
              </div>
              <button
                type="button"
                onClick={handleExtend}
                disabled={extending || remaining === "세션 만료됨"}
                className="w-full py-2 rounded-xl text-xs font-semibold text-brand-navy hover:bg-brand-accent/15 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {extending ? "연장 중..." : "시간 연장"}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-brand-slate hover:bg-brand-surface hover:text-brand-ink transition-colors"
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            로그아웃
          </button>
        </div>
      </aside>
      <main className="min-h-0 flex-1 overflow-auto bg-transparent">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
