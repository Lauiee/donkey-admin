import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getMe, refreshSession } from "../api";
import {
  clearToken,
  getRole,
  getToken,
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
    label: "문의",
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
    label: "튜링",
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
    <div className="h-screen overflow-hidden bg-neutral-50 flex">
      <aside className="w-60 h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm overflow-y-auto">
        <div className="h-14 px-4 flex items-center border-b border-slate-100">
          <span className="font-semibold text-slate-800 tracking-tight">
            Donkey
          </span>
        </div>
        <nav className="p-3 flex flex-col gap-0.5 flex-1">
          {navItems
            .filter(
              (item) =>
                role !== "admin" ||
                item.to === "/inquiry" ||
                item.to === "/turing"
            )
            .filter((item) => !item.disabled || item.to === "/turing")
            .map(({ to, label, icon, disabled }) =>
              disabled ? (
                <span
                  key={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed opacity-75"
                >
                  {icon}
                  {label}
                </span>
              ) : (
                <NavLink
                  key={to}
                  to={`${to}${search}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {icon}
                  {label}
                </NavLink>
              )
            )}
        </nav>
        <div className="p-3 border-t border-slate-100 space-y-1">
          {remaining && (
            <>
              <div className="px-3 py-2 rounded-lg bg-slate-50 text-xs text-slate-500 font-medium">
                {remaining}
              </div>
              <button
                type="button"
                onClick={handleExtend}
                disabled={extending || remaining === "세션 만료됨"}
                className="w-full py-2 rounded-lg text-xs font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {extending ? "연장 중..." : "시간 연장"}
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
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
      <main className="flex-1 min-h-0 overflow-auto bg-neutral-50">
        <div className="p-8 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
