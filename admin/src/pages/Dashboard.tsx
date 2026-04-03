import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ProjectSelect } from "../components/ProjectSelect";
import {
  getDashboard,
  getErrors,
  getHealthCheck,
  getProjects,
  type DashboardStats,
  type ErrorItem,
  type HealthStatus,
  type ProjectItem,
  type RatePeriod,
} from "../api";

type Period = "week" | "month" | "year";
const PERIOD_LABEL: Record<Period, string> = {
  week: "주",
  month: "월",
  year: "연",
};

type ReqPeriod = "day" | "week" | "month";
const REQ_PERIOD_LABEL: Record<ReqPeriod, string> = {
  day: "일",
  week: "주",
  month: "월",
};

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>("week");
  const [errorPeriod, setErrorPeriod] = useState<Period>("week");
  const [reqPeriod, setReqPeriod] = useState<ReqPeriod>("day");
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorItems, setErrorItems] = useState<ErrorItem[] | null>(null);
  const [errorModalLoading, setErrorModalLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthRefreshing, setHealthRefreshing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const projectFromUrl = searchParams.get("project_id") ?? "";
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] =
    useState<string>(projectFromUrl);

  useEffect(() => {
    setSelectedProject(projectFromUrl);
  }, [projectFromUrl]);

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    const next = new URLSearchParams(searchParams);
    if (value) next.set("project_id", value);
    else next.delete("project_id");
    setSearchParams(next, { replace: true });
  };

  const refreshHealth = () => {
    setHealthRefreshing(true);
    setHealth(null);
    getHealthCheck()
      .then((h) => setHealth(h))
      .catch(() =>
        setHealth({ ok: false, status: "error", message: "연결 실패" })
      )
      .finally(() => setHealthRefreshing(false));
  };

  // 프로젝트 목록 조회 (실패 시 빈 배열로 fallback)
  useEffect(() => {
    let cancelled = false;
    getProjects()
      .then((res) => {
        if (!cancelled) setProjects(res.items ?? []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getDashboard(selectedProject || undefined)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "조회 실패");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedProject]);

  useEffect(() => {
    let cancelled = false;
    const runCheck = () =>
      getHealthCheck()
        .then((h) => {
          if (!cancelled) setHealth(h);
        })
        .catch(() => {
          if (!cancelled)
            setHealth({ ok: false, status: "error", message: "연결 실패" });
        });
    runCheck();
    const interval = setInterval(runCheck, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const ServerStatusBadge = () => (
    <div
      className={`inline-flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm shadow-sm border ${
        health?.ok
          ? "bg-emerald-50 border-emerald-200/80 text-emerald-800"
          : health
          ? "bg-red-50 border-red-200/80 text-red-800"
          : "bg-slate-100 border-slate-200/80 text-slate-600"
      }`}
    >
      <span className="relative flex h-3 w-3 shrink-0">
        {health?.ok && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        )}
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ring-2 ${
            health?.ok
              ? "bg-emerald-600 ring-emerald-200"
              : health
              ? "bg-red-500 ring-red-200"
              : "bg-slate-400 animate-pulse ring-slate-200"
          }`}
        />
      </span>
      API 서버:{" "}
      <span className="font-semibold">
        {health === null && !healthRefreshing
          ? "확인 중..."
          : healthRefreshing
          ? "확인 중..."
          : health?.ok
          ? "정상"
          : health?.message ?? "연결 실패"}
      </span>
      <button
        type="button"
        onClick={refreshHealth}
        disabled={healthRefreshing}
        className="ml-1 p-0.5 -mr-0.5 rounded hover:bg-black/10 disabled:opacity-50 transition-colors"
        title="다시 확인"
      >
        <span
          className={`inline-block text-2xl leading-none ${
            healthRefreshing ? "animate-spin" : ""
          }`}
        >
          ⟳
        </span>
      </button>
    </div>
  );

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="admin-page-title mb-2">대시보드</h2>
            <p className="text-sm text-slate-500">
              API 사용 현황을 한눈에 확인하세요.
            </p>
          </div>
          {projects.length > 0 && (
            <ProjectSelect
              value={selectedProject}
              onChange={handleProjectChange}
              projects={projects}
              placeholder="전체"
              className="shrink-0"
            />
          )}
        </div>
        <div className="admin-card p-8 text-slate-500">불러오는 중...</div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div>
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="admin-page-title mb-2">대시보드</h2>
            <p className="text-sm text-slate-500">
              API 사용 현황을 한눈에 확인하세요.
            </p>
          </div>
          {projects.length > 0 && (
            <ProjectSelect
              value={selectedProject}
              onChange={handleProjectChange}
              projects={projects}
              placeholder="전체"
              className="shrink-0"
            />
          )}
        </div>
        <div className="admin-card p-8 text-red-600">
          {error ?? "데이터 없음"}
        </div>
      </div>
    );
  }

  const r: RatePeriod = stats.rate?.[period] ?? {
    total: 0,
    completed: 0,
    error: 0,
  };
  const rError: RatePeriod = stats.rate?.[errorPeriod] ?? {
    total: 0,
    completed: 0,
    error: 0,
  };
  const completedRate =
    r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="admin-page-title mb-2">대시보드</h2>
          <p className="text-sm text-slate-500">
            API 사용 현황을 한눈에 확인하세요.
          </p>
        </div>
        {projects.length > 0 && (
          <ProjectSelect
            value={selectedProject}
            onChange={handleProjectChange}
            projects={projects}
            placeholder="전체"
            className="shrink-0"
          />
        )}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
        <div
          className={`admin-card overflow-hidden flex flex-col items-center justify-center relative min-h-[100px] border-l-4 ${
            health?.ok
              ? "border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white"
              : health
              ? "border-l-red-500 bg-gradient-to-br from-red-50/50 to-white"
              : "border-l-slate-300 bg-slate-50/50"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <span className="relative flex h-4 w-4 mb-2">
              {health?.ok && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              )}
              <span
                className={`relative inline-flex h-4 w-4 rounded-full ${
                  health?.ok
                    ? "bg-emerald-500 ring-4 ring-emerald-200/60"
                    : health
                    ? "bg-red-500 ring-4 ring-red-200/60"
                    : "bg-slate-400 animate-pulse"
                }`}
              />
            </span>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-0.5">
              API 서버 상태
            </p>
            <p
              className={`text-xl font-bold tracking-tight ${
                health?.ok
                  ? "text-emerald-700"
                  : health
                  ? "text-red-700"
                  : "text-slate-600"
              }`}
            >
              {health === null && !healthRefreshing
                ? "확인 중..."
                : healthRefreshing
                ? "확인 중..."
                : health?.ok
                ? "정상"
                : health?.message || "연결 실패"}
            </p>
          </div>
          <button
            type="button"
            onClick={refreshHealth}
            disabled={healthRefreshing}
            className="absolute top-3 right-3 p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            title="다시 확인"
          >
            <span
              className={`inline-block text-2xl leading-none ${
                healthRefreshing ? "animate-spin" : ""
              }`}
            >
              ⟳
            </span>
          </button>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              전사 및 요약 요청량
            </p>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              {(["day", "week", "month"] as ReqPeriod[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setReqPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    reqPeriod === p
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {REQ_PERIOD_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {reqPeriod === "day"
              ? stats.today_count
              : reqPeriod === "week"
              ? stats.week_count
              : stats.month_count ?? 0}
            <span className="text-sm font-medium text-slate-400 ml-1">건</span>
          </p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm font-medium text-slate-500">
            일 평균 엔브리프 요청량(최근 30일)
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.month_count != null
              ? (stats.month_count / 30).toFixed(1)
              : "0"}
            <span className="text-sm font-medium text-slate-400 ml-1">건</span>
          </p>
        </div>
        <div className="admin-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              전사 및 요약 성공률
            </p>
            <div className="flex rounded-lg overflow-hidden border border-slate-200">
              {(["week", "month", "year"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    period === p
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {PERIOD_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {completedRate}
            <span className="text-sm font-medium text-slate-400 ml-1">%</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            완료 {r.completed} / 오류 {r.error}
          </p>
        </div>
        <div
          className="admin-card p-5 cursor-pointer hover:bg-slate-50 transition-colors"
          onClick={() => {
            setErrorModalOpen(true);
            setErrorModalLoading(true);
            setErrorItems(null);
            getErrors(errorPeriod, selectedProject || undefined)
              .then((res) => setErrorItems(res.items))
              .catch(() => setErrorItems([]))
              .finally(() => setErrorModalLoading(false));
          }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">오류 건수</p>
            <div
              className="flex rounded-lg overflow-hidden border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              {(["week", "month", "year"] as Period[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setErrorPeriod(p)}
                  className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                    errorPeriod === p
                      ? "bg-indigo-500 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {PERIOD_LABEL[p]}
                </button>
              ))}
            </div>
          </div>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {rError.error}
            <span className="text-sm font-medium text-slate-400 ml-1">건</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">클릭하여 상세 보기</p>
        </div>
        <div className="admin-card p-5">
          <p className="text-sm font-medium text-slate-500">
            전체 파이프라인 평균 처리 시간
          </p>
          <p className="text-2xl font-semibold text-slate-900 mt-1">
            {stats.avg_processing_sec != null
              ? Number(stats.avg_processing_sec).toFixed(1)
              : "-"}
            {stats.avg_processing_sec != null && (
              <span className="text-sm font-medium text-slate-400 ml-1">
                초
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 오류 목록 모달 */}
      {errorModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setErrorModalOpen(false)}
        >
          <div
            className="admin-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200">
              <h3 className="font-medium text-slate-800">
                오류 목록 (최근 {PERIOD_LABEL[errorPeriod]})
              </h3>
              <button
                type="button"
                onClick={() => setErrorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {errorModalLoading ? (
                <p className="text-slate-500">불러오는 중...</p>
              ) : errorItems && errorItems.length === 0 ? (
                <p className="text-slate-500">오류가 없습니다.</p>
              ) : errorItems ? (
                <ul className="space-y-3">
                  {errorItems.map((item) => {
                    const msg =
                      (item.error?.message as string) ||
                      (item.error?.detail as string) ||
                      "오류 발생";
                    const stage = item.error?.stage as string | undefined;
                    return (
                      <li
                        key={item.job_id}
                        className="border border-slate-200 rounded-lg p-3"
                      >
                        <Link
                          to={`/history/${item.job_id}`}
                          className="block hover:bg-slate-50 -m-3 p-3 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-slate-800 truncate">
                                {msg}
                              </p>
                              {stage && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  단계: {stage}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-slate-400 shrink-0">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString(
                                    "ko-KR"
                                  )
                                : "-"}
                            </span>
                          </div>
                          <p className="text-xs text-indigo-600 mt-1">
                            {item.job_id} →
                          </p>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* 일별 추이 (간단 막대) */}
      {(stats.daily_counts ?? []).length > 0 && (
        <div className="admin-card p-5 mb-8">
          <h3 className="font-medium text-slate-800 mb-3">
            최근 7일 요청 추이
          </h3>
          <div className="flex items-end gap-2 h-36 min-h-[140px]">
            {(stats.daily_counts ?? []).map((d) => {
              const daily = stats.daily_counts ?? [];
              const max = Math.max(...daily.map((x) => x.count), 1);
              const h = max > 0 ? (d.count / max) * 80 : 0;
              return (
                <div
                  key={d.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-indigo-200 rounded-t min-h-[4px]"
                    style={{ height: `${h}px` }}
                  />
                  <span className="text-xs text-slate-500">
                    {d.date.slice(5).replace("-", "/")}
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {d.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
