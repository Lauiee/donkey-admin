import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProjects, getRequestsList, type ProjectItem, type RequestItem } from "../api";

const PAGE_SIZE = 20;

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    completed: "완료",
    processing: "처리 중",
    pending: "대기",
    error: "오류",
  };
  return map[s] ?? s;
}

function statusColor(s: string) {
  const map: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-800",
    processing: "bg-amber-100 text-amber-800",
    pending: "bg-slate-100 text-slate-700",
    error: "bg-red-100 text-red-800",
  };
  return map[s] ?? "bg-slate-100 text-slate-700";
}

export function History() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectFromUrl = searchParams.get("project_id") ?? "";
  const [items, setItems] = useState<RequestItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTitle, setSearchTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState(projectFromUrl);

  useEffect(() => {
    getProjects()
      .then((res) => setProjects(res.items ?? []))
      .catch(() => setProjects([]));
  }, []);

  useEffect(() => {
    setSelectedProject(projectFromUrl);
  }, [projectFromUrl]);

  const handleProjectChange = (value: string) => {
    setSelectedProject(value);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    if (value) next.set("project_id", value);
    else next.delete("project_id");
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRequestsList(
      page,
      PAGE_SIZE,
      searchTitle || undefined,
      statusFilter || undefined,
      selectedProject || undefined
    )
      .then(({ items: list, total: t }) => {
        if (!cancelled) {
          setItems(list);
          setTotal(t);
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "목록 조회 실패");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, searchTitle, statusFilter, selectedProject]);

  const handleSearch = () => {
    setSearchTitle(searchInput.trim());
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <h2 className="admin-page-title mb-2">사용 내역</h2>
      <p className="text-sm text-slate-500 mb-6">
        요청·작업 내역 목록을 확인하세요.
      </p>

      <div className="admin-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          {projects.length > 0 && (
            <select
              value={selectedProject}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">전체 프로젝트</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
          <div className="flex rounded-lg overflow-hidden border border-slate-200">
            {(
              [
                { value: "", label: "전체" },
                { value: "completed", label: "완료" },
                { value: "error", label: "오류" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setStatusFilter(opt.value);
                  setPage(1);
                }}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  statusFilter === opt.value
                    ? "bg-indigo-500 text-white"
                    : "bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="제목 검색"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleSearch}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            검색
          </button>
          {(searchTitle || statusFilter) && (
            <span className="text-xs text-slate-500">
              {searchTitle ? `"${searchTitle}" ` : ""}
              {statusFilter === "completed"
                ? "완료만"
                : statusFilter === "error"
                ? "오류만"
                : ""}
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <div className="admin-card p-8 text-slate-500">불러오는 중...</div>
      ) : error ? (
        <div className="admin-card p-8 text-red-600">{error}</div>
      ) : (
        <>
          <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-slate-600">
                    <th className="px-5 py-3 font-medium">요청 시각</th>
                    <th className="px-5 py-3 font-medium">상태</th>
                    <th className="px-5 py-3 font-medium">처리 시간</th>
                    <th className="px-5 py-3 font-medium">제목</th>
                    <th className="px-5 py-3 font-medium w-24"> </th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-5 py-8 text-center text-slate-500"
                      >
                        요청 내역 없음
                      </td>
                    </tr>
                  ) : (
                    items.map((r) => (
                      <tr
                        key={r.job_id}
                        className="border-t border-slate-100 hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-3 text-slate-700">
                          {formatDate(r.created_at)}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(
                              r.status
                            )}`}
                          >
                            {statusLabel(r.status)}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-700">
                          {r.processing_sec != null
                            ? `${r.processing_sec}초`
                            : "-"}
                        </td>
                        <td
                          className="px-5 py-3 text-slate-700 max-w-[240px] truncate"
                          title={r.title ?? undefined}
                        >
                          {r.title || "-"}
                        </td>
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/history/${r.job_id}`)}
                            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
                          >
                            상세
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  전체 {total}건 ({(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, total)})
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    이전
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    다음
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
