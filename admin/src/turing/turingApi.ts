/**
 * STT 채점(Turing) API — Base URL·X-API-Key
 * @see 프로젝트 외부 명세 API_Spec.md
 */

export interface SttMetricsApi {
  stt_velocity: number;
  uer: number;
  pii_protection: number;
  mmr: number;
  mdr: number;
  diarization_accuracy: number;
  redundancy_ratio: number;
}

export interface SummaryMetricsApi {
  summarization_velocity: number | null;
  hallucination_ratio: number | null;
  ssr: number | null;
  icr: number | null;
  mir: number | null;
  summary_mdr: number | null;
  ssa: number | null;
}

export interface MetricsApi {
  processing_velocity: number;
  stt: SttMetricsApi;
  summary: SummaryMetricsApi;
}

export interface EvaluationListItemApi {
  id: number;
  job_id: string;
  audio_filename: string | null;
  audio_duration: number | null;
  language: string;
  specialty: string | null;
  created_at: string;
  metrics: MetricsApi;
}

export interface EvaluationsListResponse {
  total: number;
  page: number;
  size: number;
  items: EvaluationListItemApi[];
}

function getTuringBaseUrl(): string {
  const env = (import.meta.env.VITE_TURING_API_BASE as string | undefined)?.trim();
  if (env) return env.replace(/\/$/, "");
  if (import.meta.env.DEV) return "/turing-api";
  return "";
}

function buildTuringUrl(pathSuffix: string): URL {
  const base = getTuringBaseUrl();
  if (!base) {
    throw new Error(
      "Turing API Base가 없습니다. 개발에서는 Vite 프록시(/turing-api), 배포 시 VITE_TURING_API_BASE를 설정하세요."
    );
  }
  const path = `${base.replace(/\/$/, "")}${pathSuffix.startsWith("/") ? pathSuffix : `/${pathSuffix}`}`;
  return path.startsWith("http://") || path.startsWith("https://")
    ? new URL(path)
    : new URL(path, window.location.origin);
}

/** GET /health — 인증 불필요 */
export interface TuringHealthResponse {
  status: "ok" | "degraded";
  db: "connected" | "disconnected";
  last_write_at: string | null;
}

export async function fetchTuringHealth(): Promise<TuringHealthResponse> {
  const u = buildTuringUrl("/health");
  const res = await fetch(u.toString(), {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    throw new Error(
      body?.message || body?.error || `Health 요청 실패 (${res.status})`
    );
  }
  return res.json();
}

function turingHeaders(): HeadersInit {
  const key = (import.meta.env.VITE_TURING_API_KEY as string | undefined)?.trim();
  const h: Record<string, string> = { Accept: "application/json" };
  if (key) h["X-API-Key"] = key;
  return h;
}

export function hasTuringApiKey(): boolean {
  return !!((import.meta.env.VITE_TURING_API_KEY as string | undefined)?.trim());
}

export async function fetchTuringEvaluations(params: {
  page?: number;
  size?: number;
  from?: string;
  to?: string;
  language?: string;
  specialty?: string;
  job_id?: string;
}): Promise<EvaluationsListResponse> {
  if (!hasTuringApiKey()) {
    throw new Error("VITE_TURING_API_KEY가 설정되지 않았습니다.");
  }

  const page = params.page ?? 1;
  const size = params.size ?? 10;
  const sp = new URLSearchParams();
  sp.set("page", String(page));
  sp.set("size", String(Math.min(100, Math.max(1, size))));
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.language) sp.set("language", params.language);
  if (params.specialty) sp.set("specialty", params.specialty);
  if (params.job_id) sp.set("job_id", params.job_id);

  const u = buildTuringUrl("/evaluations");
  sp.forEach((v, k) => u.searchParams.set(k, v));
  const res = await fetch(u.toString(), { headers: turingHeaders() });
  if (res.status === 401) {
    throw new Error("Turing API 인증에 실패했습니다. X-API-Key를 확인해 주세요.");
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      message?: string;
      error?: string;
    };
    throw new Error(
      body?.message || body?.error || `Turing API 오류 (${res.status})`
    );
  }
  return res.json();
}
