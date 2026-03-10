import { useEffect, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  deleteInquiry,
  getInquiryDetail,
  updateInquiry,
  uploadInquiryAttachment,
  type InquiryDetail,
} from "../api";

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

function isImageUrl(url: string): boolean {
  const ext = url.split(".").pop()?.toLowerCase().replace(/\?.*/, "") ?? "";
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext);
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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editAttachmentUrls, setEditAttachmentUrls] = useState<string[]>([]);
  const [editFiles, setEditFiles] = useState<File[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const fileInputActiveRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const openEditModal = () => {
    setEditTitle(detail?.title ?? "");
    setEditBody(detail?.body ?? "");
    setEditAttachmentUrls(detail?.attachment_urls ?? []);
    setEditFiles([]);
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleEdit = async () => {
    if (!id || !detail) return;
    if (!editTitle.trim() || !editBody.trim()) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      let attachmentUrls = [...editAttachmentUrls];
      if (editFiles.length > 0) {
        setEditUploading(true);
        for (const file of editFiles) {
          const { url } = await uploadInquiryAttachment(file);
          attachmentUrls = [...attachmentUrls, url];
        }
        setEditUploading(false);
      }
      const updated = await updateInquiry(id, {
        title: editTitle.trim(),
        body: editBody.trim(),
        attachment_urls: attachmentUrls,
      });
      setDetail(updated);
      setEditModalOpen(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "수정 실패");
    } finally {
      setEditSubmitting(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openEditModal}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
            >
              수정
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50"
            >
              {deleting ? "삭제 중…" : "문의 삭제"}
            </button>
          </div>
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
          {detail.attachment_urls && detail.attachment_urls.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-2">
                첨부파일
              </p>
              <div className="space-y-4">
                {detail.attachment_urls.map((url, i) => (
                  <div key={i}>
                    {isImageUrl(url) ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img
                          src={url}
                          alt={url.split("/").pop() ?? "첨부 이미지"}
                          className="max-w-full max-h-80 rounded-lg border border-slate-200 object-contain"
                          loading="lazy"
                        />
                      </a>
                    ) : (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        {url.split("/").pop() ?? url}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      {editModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => {
            if (fileInputActiveRef.current) return;
            if (!editSubmitting) setEditModalOpen(false);
          }}
        >
          <div
            className="admin-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">문의 수정</h3>
            </div>
            <div className="p-5 space-y-4">
              {editError && <p className="text-sm text-red-600">{editError}</p>}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  제목
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  내용
                </label>
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={5}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">
                  첨부파일
                </label>
                {editAttachmentUrls.length > 0 && (
                  <ul className="mb-2 space-y-1 text-sm text-slate-600">
                    {editAttachmentUrls.map((url, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline truncate"
                        >
                          {url.split("/").pop() ?? url}
                        </a>
                        <button
                          type="button"
                          onClick={() =>
                            setEditAttachmentUrls((prev) =>
                              prev.filter((_, j) => j !== i)
                            )
                          }
                          className="text-red-500 hover:text-red-600 text-xs shrink-0"
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const input = e.currentTarget;
                    const files = input.files;
                    if (files && files.length > 0) {
                      const list = Array.from(files);
                      setEditFiles((prev) => [...prev, ...list]);
                    }
                    input.value = "";
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    fileInputActiveRef.current = true;
                    setTimeout(() => {
                      fileInputActiveRef.current = false;
                    }, 1500);
                    fileInputRef.current?.click();
                  }}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                >
                  파일 선택
                </button>
                {editFiles.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {editFiles.map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span>{f.name}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setEditFiles((prev) =>
                              prev.filter((_, j) => j !== i)
                            )
                          }
                          className="text-red-500 hover:text-red-600 text-xs"
                        >
                          삭제
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => !editSubmitting && setEditModalOpen(false)}
                disabled={editSubmitting}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleEdit}
                disabled={
                  editSubmitting ||
                  editUploading ||
                  !editTitle.trim() ||
                  !editBody.trim()
                }
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:pointer-events-none"
              >
                {editUploading
                  ? "업로드 중…"
                  : editSubmitting
                  ? "저장 중…"
                  : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}

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
