import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRequestDetail, type RequestDetail } from "../api";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
      <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
        {children}
      </div>
    </div>
  );
}

/** conversation_content: { role, index, content }[] */
function TranscriptionBlock({ items }: { items: unknown[] | null }) {
  if (!items?.length) return <span className="text-slate-500">-</span>;
  return (
    <div className="space-y-2 whitespace-pre-wrap">
      {(items as { role?: string; content?: string }[]).map((item, i) => (
        <p key={i}>
          {item.role ? (
            <>
              <span className="font-medium text-slate-800">{item.role}: </span>
              {item.content ?? ""}
            </>
          ) : (
            String(item.content ?? item)
          )}
        </p>
      ))}
    </div>
  );
}

function SummaryList({
  label,
  items,
}: {
  label: string;
  items: string[] | null;
}) {
  if (!items?.length) return null;
  return (
    <div className="mb-4 last:mb-0">
      <h4 className="text-xs font-semibold text-slate-600 mb-1.5">{label}</h4>
      <ul className="list-disc list-inside space-y-1 text-slate-700">
        {items.map((text, i) => (
          <li key={i}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

function ErrorDetail({ detail }: { detail: RequestDetail }) {
  const err = detail.error as {
    code?: string;
    type?: string;
    message?: string;
    stage?: string;
  } | null;

  return (
    <div className="space-y-6">
      {/* 에러 배너 */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-red-500 text-lg">⚠</span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              처리 중 오류가 발생했습니다
            </h3>
            {err?.message && (
              <p className="text-sm text-red-700">{err.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 요청 정보 */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-2">요청 정보</h3>
        <div className="bg-slate-50 rounded-lg divide-y divide-slate-200 text-sm">
          {err?.code && (
            <div className="flex px-4 py-2.5">
              <span className="w-28 shrink-0 font-medium text-slate-500">
                에러 코드
              </span>
              <span className="text-slate-800 font-mono text-xs">
                {err.code}
              </span>
            </div>
          )}
          <div className="flex px-4 py-2.5">
            <span className="w-28 shrink-0 font-medium text-slate-500">
              Job ID
            </span>
            <span className="text-slate-800 font-mono text-xs break-all">
              {detail.job_id}
            </span>
          </div>
          {detail.file_url && (
            <div className="flex px-4 py-2.5">
              <span className="w-28 shrink-0 font-medium text-slate-500">
                음성 URL
              </span>
              <span className="text-slate-800 text-xs break-all">
                {detail.file_url}
              </span>
            </div>
          )}
          {detail.created_at && (
            <div className="flex px-4 py-2.5">
              <span className="w-28 shrink-0 font-medium text-slate-500">
                요청 시각
              </span>
              <span className="text-slate-800">
                {new Date(detail.created_at).toLocaleString("ko-KR")}
              </span>
            </div>
          )}
          {detail.processing_time_ms != null && (
            <div className="flex px-4 py-2.5">
              <span className="w-28 shrink-0 font-medium text-slate-500">
                처리 시간
              </span>
              <span className="text-slate-800">
                {(detail.processing_time_ms / 1000).toFixed(2)}초
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function HistoryDetail() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getRequestDetail(jobId)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "상세 조회 실패");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  if (!jobId) {
    return (
      <div className="admin-card p-8 text-slate-500">
        job_id가 없습니다.{" "}
        <button
          type="button"
          onClick={() => navigate("/history")}
          className="text-indigo-600 hover:underline"
        >
          사용 내역으로
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-card p-8 text-slate-500">불러오는 중...</div>;
  }

  if (error || !detail) {
    return (
      <div className="admin-card p-8 text-red-600">
        {error ?? "데이터 없음"}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            목록으로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate("/history")}
          className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200"
        >
          ← 목록
        </button>
        <h2 className="admin-page-title">요청 상세</h2>
      </div>

      <div className="admin-card p-6">
        {detail.status === "error" ? (
          <ErrorDetail detail={detail} />
        ) : (
          <>
            <Section title="전사한 내용 전체">
              <TranscriptionBlock items={detail.conversation_content ?? []} />
            </Section>

            <Section title="요약">
              {detail.doctor_notes?.length ||
              detail.test_results?.length ||
              detail.symptom_record?.length ||
              detail.prescription_and_care?.length ? (
                <>
                  <SummaryList label="의사 소견" items={detail.doctor_notes} />
                  <SummaryList label="검사 결과" items={detail.test_results} />
                  <SummaryList
                    label="증상 기록"
                    items={detail.symptom_record}
                  />
                  <SummaryList
                    label="처방 및 관리"
                    items={detail.prescription_and_care}
                  />
                </>
              ) : (
                <span className="text-slate-500">-</span>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
