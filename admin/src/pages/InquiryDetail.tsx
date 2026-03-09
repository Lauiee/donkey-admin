import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { deleteInquiry, getInquiryDetail, type InquiryDetail } from "../api";

function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending: "대기중",
    in_progress: "처리 중",
    completed: "완료",
  };
  return map[s] ?? s;
}

function statusColor(s: string) {
  const map: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-emerald-100 text-emerald-800",
  };
  return map[s] ?? "bg-slate-100 text-slate-700";
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function InquiryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<InquiryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getInquiryDetail(id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "문의 조회 실패");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("이 문의를 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      await deleteInquiry(id);
      navigate("/inquiry", { replace: true });
    } catch (e) {
      alert(e instanceof Error ? e.message : "삭제 실패");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="admin-card p-8 text-slate-500">불러오는 중...</div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div>
        <div className="admin-card p-8 text-red-600">
          {error ?? "문의를 찾을 수 없습니다."}
        </div>
        <Link
          to="/inquiry"
          className="inline-block mt-4 text-sm text-indigo-600 hover:text-indigo-700"
        >
          ← 문의 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          to="/inquiry"
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          ← 문의
        </Link>
        {detail.status === "pending" && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
          >
            {deleting ? "삭제 중…" : "문의 삭제"}
          </button>
        )}
      </div>

      <div className="admin-card overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {detail.title || "(제목 없음)"}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span
              className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColor(
                detail.status
              )}`}
            >
              {statusLabel(detail.status)}
            </span>
            {detail.author && <span>작성자: {detail.author}</span>}
            {detail.author_email && <span>{detail.author_email}</span>}
            {detail.project_id && (
              <span>프로젝트: {detail.project_name ?? detail.project_id}</span>
            )}
            <span>등록: {formatDate(detail.created_at)}</span>
          </div>
        </div>
        <div className="p-6">
          <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
            {detail.body || "(내용 없음)"}
          </pre>
        </div>
      </div>

      {/* 답변 목록 */}
      {detail.replies.length > 0 && (
        <div className="admin-card p-6 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">답변</h3>
          <ul className="space-y-4">
            {detail.replies.map((r) => (
              <li key={r.id} className="pl-4 border-l-2 border-indigo-200 py-1">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {r.body}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {r.author && `${r.author} · `}
                  {formatDate(r.created_at)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
