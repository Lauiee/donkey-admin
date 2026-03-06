import { useCallback, useEffect, useState } from "react";
import { getUsage, type UsageStats } from "../api";

function formatDateForInput(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return formatDateForInput(d);
}
function defaultTo(): string {
  return formatDateForInput(new Date());
}

export function Usage() {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback((fromDate: string, toDate: string) => {
    setLoading(true);
    setError(null);
    getUsage(fromDate, toDate)
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "조회 실패"))
      .finally(() => setLoading(false));
  }, []);

  // 최초 1회: 기본 기간(최근 7일)으로 조회
  useEffect(() => {
    fetchUsage(from, to);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- 마운트 시 1회만

  const handleQuery = () => {
    if (from && to) fetchUsage(from, to);
  };

  const dailyCounts = stats?.daily_counts ?? [];

  return (
    <div>
      <h2 className="admin-page-title mb-2">사용량</h2>
      <p className="text-sm text-slate-500 mb-6">
        기간을 선택해 일별 사용량을 확인하세요.
      </p>

      {/* 기간 선택 */}
      <div className="admin-card p-5 mb-8">
        <h3 className="font-medium text-slate-800 mb-3">기간 조회</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={handleQuery}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? "조회 중…" : "조회"}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          최대 90일까지 조회 가능합니다.
        </p>
      </div>

      {error && <div className="admin-card p-5 mb-8 text-red-600">{error}</div>}

      {!error && stats && (
        <>
          {/* 선택 기간 요약 */}
          <div className="admin-card p-5 mb-8">
            <h3 className="font-medium text-slate-800 mb-3">선택 기간 요약</h3>
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="text-slate-600">
                총 요청{" "}
                <strong className="text-slate-900">{stats.total_count}</strong>
                건
              </span>
              <span className="text-slate-600">
                완료{" "}
                <strong className="text-slate-900">
                  {stats.completed_count}
                </strong>
                건
              </span>
              <span className="text-slate-600">
                오류{" "}
                <strong className="text-slate-900">{stats.error_count}</strong>
                건
              </span>
              {stats.avg_processing_sec != null && (
                <span className="text-slate-600">
                  평균 처리{" "}
                  <strong className="text-slate-900">
                    {stats.avg_processing_sec}초
                  </strong>
                </span>
              )}
            </div>
          </div>

          {/* 일별 사용량 */}
          <div className="admin-card overflow-hidden">
            <h3 className="font-medium text-slate-800 mb-3 px-5 pt-5">
              일별 사용량
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-600">
                    <th className="px-5 py-3 font-medium">날짜</th>
                    <th className="px-5 py-3 font-medium">요청 건수</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyCounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-5 py-8 text-center text-slate-500"
                      >
                        데이터 없음
                      </td>
                    </tr>
                  ) : (
                    [...dailyCounts].reverse().map((d) => (
                      <tr
                        key={d.date}
                        className="border-t border-slate-100 hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-3 text-slate-700">{d.date}</td>
                        <td className="px-5 py-3 font-medium text-slate-800">
                          {d.count}건
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {loading && !stats && (
        <div className="admin-card p-8 text-slate-500">불러오는 중...</div>
      )}
    </div>
  );
}
