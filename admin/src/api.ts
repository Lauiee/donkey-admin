import { getToken } from "./auth";

/**
 * API 베이스 URL.
 * - 개발: /api (Vite 프록시 → localhost:8000)
 * - 프로덕션(분리 배포): VITE_API_BASE (예: https://api.example.com)
 * - 프로덕션(같은 오리진): 비우면 상대 경로
 */
const API_BASE = import.meta.env.DEV
  ? "/api"
  : (import.meta.env.VITE_API_BASE as string | undefined) ?? "";

function getHeaders(includeAuth = true): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (includeAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(
  userId: string,
  password: string
): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/admin/api/login`, {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify({ user_id: userId, password }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      code?: string;
    };
    const msg = body?.message ?? `로그인 실패 (${res.status})`;
    if (res.status === 503) {
      throw new Error("관리자 로그인이 설정되지 않았습니다. (DB 연결 확인)");
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function getProjects(): Promise<{ items: string[] }> {
  const res = await fetch(`${API_BASE}/admin/api/projects`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      detail?: string | { message?: string };
    };
    const msg =
      (typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message) || `프로젝트 목록 조회 실패 (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export async function getMe(): Promise<{
  user_id: string;
  display_name: string | null;
}> {
  const res = await fetch(`${API_BASE}/admin/api/me`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export interface RatePeriod {
  total: number;
  completed: number;
  error: number;
}

export interface DashboardStats {
  today_count: number;
  week_count: number;
  month_count: number;
  year_count: number;
  rate: { week: RatePeriod; month: RatePeriod; year: RatePeriod };
  avg_processing_sec: number | null;
  daily_counts: { date: string; count: number }[];
  summary_eval?: {
    avg_hr: number | null;
    avg_ssr: number | null;
    avg_icr: number | null;
    eval_count: number;
  };
  summary_eval_trend?: {
    label: string;
    hr: number | null;
    ssr: number | null;
    icr: number | null;
  }[];
}

export interface UsageStats {
  daily_counts: { date: string; count: number }[];
  total_count: number;
  completed_count: number;
  error_count: number;
  avg_processing_sec: number | null;
}

export async function getUsage(
  fromDate: string,
  toDate: string,
  project?: string
): Promise<UsageStats> {
  const params = new URLSearchParams({ from_date: fromDate, to_date: toDate });
  if (project?.trim()) params.set("project_id", project.trim());
  const res = await fetch(`${API_BASE}/admin/api/usage?${params}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      detail?: string | { message?: string };
    };
    const msg =
      (typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message) || `사용량 조회 실패 (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export interface RequestItem {
  job_id: string;
  created_at: string;
  status: string;
  processing_sec: number | null;
  title: string | null;
}

export interface RequestDetail {
  job_id: string;
  created_at: string;
  status: string;
  request_type: string;
  file_url: string;
  stored_audio_url: string | null;
  client_name: string;
  request_timestamp: string | null;
  completed_at: string | null;
  processing_time_ms: number | null;
  processing_sec: number | null;
  audio_duration_sec: number | null;
  stages: Record<string, number> | null;
  quality: Record<string, unknown> | null;
  model_usage: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  title: string | null;
  simple_summary: string | null;
  doctor_notes: string[] | null;
  test_results: string[] | null;
  symptom_record: string[] | null;
  prescription_and_care: string[] | null;
  conversation_content: unknown[] | null;
  summary_eval?: {
    simpleSummary_eval?: {
      summary_scores?: {
        supported_ratio?: number;
        hallucination_rate?: number;
        contradiction_rate?: number;
      };
      ssr?: number;
      icr?: number | null;
    } | null;
    consultation_aggregate?: {
      supported_ratio?: number;
      hallucination_rate?: number;
      contradiction_rate?: number;
      ssr?: number;
      icr?: number | null;
    };
  } | null;
}

export async function getRequestDetail(jobId: string): Promise<RequestDetail> {
  const res = await fetch(
    `${API_BASE}/admin/api/requests/${encodeURIComponent(jobId)}`,
    { headers: getHeaders() }
  );
  if (!res.ok) {
    if (res.status === 404) throw new Error("해당 요청을 찾을 수 없습니다.");
    const body = (await res.json().catch(() => ({}))) as {
      detail?: string | { message?: string };
    };
    const msg =
      (typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message) || `상세 조회 실패 (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export async function getRequestsList(
  page = 1,
  limit = 50,
  title?: string,
  status?: string,
  project?: string
): Promise<{ items: RequestItem[]; total: number }> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (title?.trim()) params.set("title", title.trim());
  if (status?.trim()) params.set("status", status.trim());
  if (project?.trim()) params.set("project_id", project.trim());
  const res = await fetch(`${API_BASE}/admin/api/requests?${params}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      detail?: string | { message?: string };
    };
    const msg =
      (typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message) || `목록 조회 실패 (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export interface ErrorItem {
  job_id: string;
  created_at: string | null;
  error: {
    code?: string;
    type?: string;
    message?: string;
    stage?: string;
    detail?: string;
  };
}

export async function getErrors(
  period: "week" | "month" | "year",
  project?: string
): Promise<{ items: ErrorItem[] }> {
  const params = new URLSearchParams({ period });
  if (project?.trim()) params.set("project_id", project.trim());
  const res = await fetch(`${API_BASE}/admin/api/errors?${params}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      detail?: string | { message?: string };
    };
    const msg =
      (typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message) || `오류 목록 조회 실패 (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

export interface HealthStatus {
  ok: boolean;
  status?: string;
  message?: string;
}

/** 백엔드 API 서버 헬스체크 (인증 불필요) */
export async function getHealthCheck(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      headers: getHeaders(false),
    });
    if (!res.ok) {
      return {
        ok: false,
        status: "error",
        message: `HTTP ${res.status}`,
      };
    }
    const body = (await res.json().catch(() => ({}))) as {
      status?: string;
      [key: string]: unknown;
    };
    const status = body?.status ?? "ok";
    return {
      ok: true,
      status: status as string,
    };
  } catch (e) {
    return {
      ok: false,
      status: "error",
      message: e instanceof Error ? e.message : "연결 실패",
    };
  }
}

export async function getDashboard(project?: string): Promise<DashboardStats> {
  const params = project?.trim()
    ? `?project_id=${encodeURIComponent(project.trim())}`
    : "";
  const res = await fetch(`${API_BASE}/admin/api/dashboard${params}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      detail?: string | { message?: string };
    };
    const msg =
      (typeof body?.detail === "string"
        ? body.detail
        : body?.detail?.message) || `대시보드 조회 실패 (${res.status})`;
    throw new Error(msg);
  }
  return res.json();
}

/** 세션 연장: 새 토큰(4시간) 발급 후 저장용 반환 */
export async function refreshSession(): Promise<{ access_token: string }> {
  const res = await fetch(`${API_BASE}/admin/api/refresh`, {
    method: "POST",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("세션 연장에 실패했습니다.");
  return res.json();
}
