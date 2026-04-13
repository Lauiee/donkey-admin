import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DashboardLineChart } from "../components/DashboardLineChart";
import { PageHeader } from "../components/PageHeader";
import { ProjectSelect } from "../components/ProjectSelect";
import { SegmentedControl } from "../components/SegmentedControl";
import { StatCard } from "../components/StatCard";
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

const REQ_OPTIONS = (["day", "week", "month"] as const).map((p) => ({
  value: p,
  label: REQ_PERIOD_LABEL[p],
}));
const PERIOD_OPTIONS = (["week", "month", "year"] as const).map((p) => ({
  value: p,
  label: PERIOD_LABEL[p],
}));

function IconChart() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  );
}

function IconTarget() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function IconClock() {
  return (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

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

  const headerActions = (
    <>
      {projects.length > 0 && (
        <ProjectSelect
          value={selectedProject}
          onChange={handleProjectChange}
          projects={projects}
          placeholder="전체 프로젝트"
          className="shrink-0"
        />
      )}
      <ServerStatusBadge
        health={health}
        healthRefreshing={healthRefreshing}
        onRefresh={refreshHealth}
      />
    </>
  );

  if (loading) {
    return (
      <div>
        <PageHeader
          title="대시보드"
          subtitle="API 사용 현황을 한눈에 확인하세요."
          actions={headerActions}
        />
        <div className="admin-card flex min-h-[200px] items-center justify-center p-12 text-brand-slate">
          <div className="flex flex-col items-center gap-3">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-brand-line border-t-brand-accent" />
            <span className="text-sm font-medium">불러오는 중…</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div>
        <PageHeader
          title="대시보드"
          subtitle="API 사용 현황을 한눈에 확인하세요."
          actions={headerActions}
        />
        <div className="admin-card border-l-4 border-l-red-400 p-8 text-red-700">
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
    <div className="pb-4">
      <PageHeader
        title="대시보드"
        subtitle="API 사용 현황을 한눈에 확인하세요."
        actions={headerActions}
      />

      <section className="relative mb-10 overflow-hidden rounded-4xl border border-white/80 bg-gradient-to-br from-white via-[#fafcfe] to-[#eef2ff] p-5 shadow-admin-card ring-1 ring-black/[0.04] sm:p-7">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-brand-violet/18 to-transparent blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-brand-accent/14 to-transparent blur-3xl"
          aria-hidden
        />
        <div className="relative z-10">
          <div className="mb-6 flex items-center gap-2.5 border-b border-brand-line/80 pb-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-coral shadow-sm shadow-brand-coral/45"
              aria-hidden
            />
            <h3 className="text-base font-bold tracking-tight text-brand-ink">
              핵심 지표
            </h3>
            <span className="ml-auto hidden text-xs font-medium text-brand-slate sm:inline">
              일·주·월 기준 요약
            </span>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-6 xl:gap-6">
            <StatCard
              className="xl:col-span-2"
              label="요청량"
              icon={<IconChart />}
              headerRight={
                <SegmentedControl
                  options={REQ_OPTIONS}
                  value={reqPeriod}
                  onChange={setReqPeriod}
                />
              }
            >
              <p className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                {reqPeriod === "day"
                  ? stats.today_count
                  : reqPeriod === "week"
                    ? stats.week_count
                    : stats.month_count ?? 0}
                <span className="ml-1.5 text-lg font-semibold text-brand-mint">
                  건
                </span>
              </p>
            </StatCard>

            <StatCard
              className="xl:col-span-2"
              label="최근 1개월 평균 요청량 (단위: 일)"
              icon={<IconCalendar />}
            >
              <p className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                {stats.month_count != null
                  ? (stats.month_count / 30).toFixed(1)
                  : "0"}
                <span className="ml-1.5 text-lg font-semibold text-brand-mint">
                  건
                </span>
              </p>
            </StatCard>

            <StatCard
              className="xl:col-span-2"
              label="성공률"
              icon={<IconTarget />}
              headerRight={
                <SegmentedControl
                  options={PERIOD_OPTIONS}
                  value={period}
                  onChange={setPeriod}
                />
              }
              footer={
                <span>
                  완료 <strong className="text-brand-navy">{r.completed}</strong>{" "}
                  · 오류{" "}
                  <strong className="text-brand-navy">{r.error}</strong>
                </span>
              }
            >
              <p className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                {completedRate}
                <span className="ml-1.5 text-lg font-semibold text-brand-mint">
                  %
                </span>
              </p>
            </StatCard>

            <StatCard
              className="xl:col-span-2 xl:col-start-2"
              label="오류 발생"
              icon={<IconAlert />}
              headerRight={
                <SegmentedControl
                  options={PERIOD_OPTIONS}
                  value={errorPeriod}
                  onChange={setErrorPeriod}
                  stopPropagation
                />
              }
              footer={<span className="text-brand-mint">클릭하여 상세 보기</span>}
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
              <p className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                {rError.error}
                <span className="ml-1.5 text-lg font-semibold text-brand-mint">
                  건
                </span>
              </p>
            </StatCard>

            <StatCard
              className="md:col-span-2 xl:col-span-2 xl:col-start-4"
              label="전체 처리 시간 평균"
              icon={<IconClock />}
            >
              <p className="text-3xl font-bold tracking-tight text-brand-ink sm:text-4xl">
                {stats.avg_processing_sec != null
                  ? Number(stats.avg_processing_sec).toFixed(1)
                  : "—"}
                {stats.avg_processing_sec != null && (
                  <span className="ml-1.5 text-lg font-semibold text-brand-mint">
                    초
                  </span>
                )}
              </p>
            </StatCard>
          </div>
        </div>
      </section>

      {(stats.daily_counts ?? []).length > 0 && (
        <section>
          <h3 className="admin-section-title mb-5">최근 7일 요청량 추이</h3>
          <div className="admin-card overflow-hidden p-0">
            <div className="border-b border-brand-line/80 bg-brand-surface/50 px-5 py-4 sm:px-7">
              <p className="text-sm font-semibold text-brand-navy">
                일별 요청량
              </p>
              <p className="mt-0.5 text-xs text-brand-slate">
                선에 마우스를 올리면 날짜·건수·최대 대비 비율을 볼 수 있습니다.
              </p>
            </div>
            <div className="px-3 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
              <DashboardLineChart data={stats.daily_counts ?? []} />
            </div>
          </div>
        </section>
      )}

      {errorModalOpen && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setErrorModalOpen(false)}
        >
          <div
            className="admin-card flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-brand-line bg-brand-surface/40 px-6 py-4">
              <h3 className="text-base font-semibold text-brand-ink">
                오류 목록 (최근 {PERIOD_LABEL[errorPeriod]})
              </h3>
              <button
                type="button"
                onClick={() => setErrorModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-brand-mint transition-colors hover:bg-white hover:text-brand-navy"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {errorModalLoading ? (
                <p className="text-center text-sm text-brand-slate">
                  불러오는 중…
                </p>
              ) : errorItems && errorItems.length === 0 ? (
                <p className="text-center text-sm text-brand-slate">
                  오류가 없습니다.
                </p>
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
                        className="overflow-hidden rounded-xl border border-brand-line bg-white shadow-sm transition-shadow hover:shadow-md"
                      >
                        <Link
                          to={`/history/${item.job_id}`}
                          className="block p-4 hover:bg-brand-surface/80"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-brand-ink">
                                {msg}
                              </p>
                              {stage && (
                                <p className="mt-1 text-xs text-brand-slate">
                                  단계: {stage}
                                </p>
                              )}
                            </div>
                            <span className="shrink-0 text-xs text-brand-mint">
                              {item.created_at
                                ? new Date(item.created_at).toLocaleString(
                                    "ko-KR"
                                  )
                                : "-"}
                            </span>
                          </div>
                          <p className="mt-2 text-xs font-medium text-brand-navy">
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
    </div>
  );
}

function ServerStatusBadge({
  health,
  healthRefreshing,
  onRefresh,
}: {
  health: HealthStatus | null;
  healthRefreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm ${
        health?.ok
          ? "border-brand-accent/45 bg-brand-accent/15 text-brand-navy"
          : health
            ? "border-red-200 bg-red-50 text-red-800"
            : "border-brand-line bg-white text-brand-slate"
      }`}
    >
      <span className="relative flex h-3 w-3 shrink-0">
        {health?.ok && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-60" />
        )}
        <span
          className={`relative inline-flex h-3 w-3 rounded-full ring-2 ${
            health?.ok
              ? "bg-brand-accentDark ring-brand-accent/50"
              : health
                ? "bg-red-500 ring-red-200"
                : "bg-brand-mint animate-pulse ring-brand-line"
          }`}
        />
      </span>
      <span className="text-left font-bold leading-snug">
        {health === null && !healthRefreshing
          ? "API 서버 상태 : 확인 중"
          : healthRefreshing
            ? "API 서버 상태 : 확인 중"
            : health?.ok
              ? "API 서버 상태 : 정상"
              : `API 서버 상태 : ${health?.message ?? "연결 실패"}`}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={healthRefreshing}
        className="-mr-1 ml-0.5 rounded-full p-1 hover:bg-black/5 disabled:opacity-50"
        title="다시 확인"
      >
        <span
          className={`inline-block text-lg leading-none ${
            healthRefreshing ? "animate-spin" : ""
          }`}
        >
          ⟳
        </span>
      </button>
    </div>
  );
}
