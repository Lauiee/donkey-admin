import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchTuringEvaluationById,
  hasTuringApiKey,
  type EvaluationFullApi,
} from "../turing/turingApi";
import { getTuringLabelSet } from "../turing/turingLabels";
import { getTuringDomain } from "../auth";
import { formatRawRatioAsPercent } from "../turing/turingFormat";

/** 0~1 비율 지표는 %, 속도/압축률 등 비-비율 지표는 원시 숫자로 표기 */
function fmtRatio(v: number | null): string {
  return v == null || Number.isNaN(v) ? "—" : formatRawRatioAsPercent(v);
}
function fmtNum(v: number | null): string {
  if (v == null || Number.isNaN(v)) return "—";
  return Number.isInteger(v) ? String(v) : v.toFixed(3).replace(/\.?0+$/, "");
}
function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? String(iso) : d.toLocaleString("ko-KR");
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex px-4 py-2.5">
      <span className="w-40 shrink-0 font-medium text-brand-slate">{label}</span>
      <span className="min-w-0 break-words text-brand-ink">{value}</span>
    </div>
  );
}

function MetricTable({
  rows,
}: {
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="divide-y divide-brand-line rounded-lg bg-brand-surface text-sm">
      {rows.map((r) => (
        <div key={r.label} className="flex px-4 py-2">
          <span className="min-w-0 flex-1 text-brand-slate">{r.label}</span>
          <span className="shrink-0 font-mono text-brand-ink">{r.value}</span>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="mb-2 text-sm font-semibold text-brand-navy">{title}</h3>
      {children}
    </div>
  );
}

export function TuringDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numericId = Number(id);
  const [detail, setDetail] = useState<EvaluationFullApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(numericId) || numericId < 1) {
      setError("유효하지 않은 평가 ID입니다.");
      setLoading(false);
      return;
    }
    if (!hasTuringApiKey()) {
      setError("VITE_TURING_API_KEY가 설정되지 않아 상세를 불러올 수 없습니다.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTuringEvaluationById(numericId)
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
  }, [numericId]);

  if (loading) {
    return <div className="admin-card p-8 text-brand-slate">불러오는 중...</div>;
  }

  if (error || !detail) {
    return (
      <div className="admin-card p-8 text-red-600">
        {error ?? "데이터 없음"}
        <div className="mt-4">
          <button
            type="button"
            onClick={() => navigate("/turing")}
            className="rounded-lg bg-brand-surface px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-line/50"
          >
            Turing으로
          </button>
        </div>
      </div>
    );
  }

  const labels = getTuringLabelSet(getTuringDomain());
  const m = detail.metrics;
  const sttRows = [
    { label: labels.sttRadarListLabels[0], value: fmtNum(m.stt.stt_velocity) },
    { label: labels.sttRadarListLabels[1], value: fmtRatio(m.stt.uer) },
    { label: labels.sttRadarListLabels[2], value: fmtRatio(m.stt.pii_protection) },
    { label: labels.sttRadarListLabels[3], value: fmtRatio(m.stt.mmr) },
    { label: labels.sttRadarListLabels[4], value: fmtRatio(m.stt.mdr) },
    {
      label: labels.sttRadarListLabels[5],
      value: fmtRatio(m.stt.diarization_accuracy),
    },
    {
      label: labels.sttRadarListLabels[6],
      value: fmtRatio(m.stt.redundancy_ratio),
    },
  ];
  const summaryRows = [
    {
      label: labels.summaryRadarListLabels[0],
      value: fmtNum(m.summary.summarization_velocity),
    },
    {
      label: labels.summaryRadarListLabels[1],
      value: fmtRatio(m.summary.hallucination_ratio),
    },
    { label: labels.summaryRadarListLabels[2], value: fmtRatio(m.summary.ssr) },
    { label: labels.summaryRadarListLabels[3], value: fmtNum(m.summary.icr) },
    {
      label: labels.summaryRadarListLabels[4],
      value: fmtRatio(m.summary.summary_mdr),
    },
    { label: labels.summaryRadarListLabels[5], value: fmtRatio(m.summary.mir) },
    { label: labels.summaryRadarListLabels[6], value: fmtRatio(m.summary.ssa) },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/turing")}
          className="rounded-lg bg-brand-surface px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-brand-line/50"
        >
          ← Turing
        </button>
        <h2 className="admin-page-title">평가 상세 #{detail.id}</h2>
      </div>

      <div className="admin-card p-6">
        {detail.error_message && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {detail.error_message}
          </div>
        )}

        <Section title="기본 정보">
          <div className="divide-y divide-brand-line rounded-lg bg-brand-surface text-sm">
            <Row label="Job ID" value={<span className="font-mono text-xs break-all">{detail.job_id}</span>} />
            <Row label="언어" value={detail.language} />
            <Row label="카테고리" value={detail.specialty ?? "—"} />
            <Row label="오디오 파일" value={detail.audio_filename ?? "—"} />
            <Row
              label="오디오 길이"
              value={detail.audio_duration != null ? `${detail.audio_duration}초` : "—"}
            />
            <Row label="세그먼트 수" value={detail.segment_count ?? "—"} />
            <Row
              label="오디오 URL"
              value={
                detail.audio_url ? (
                  <a
                    href={detail.audio_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-navy underline break-all"
                  >
                    {detail.audio_url}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <Row label="참조 정답 보유" value={detail.has_reference ? "예" : "아니오"} />
            <Row label="생성 시각" value={fmtDateTime(detail.created_at)} />
            <Row label="수정 시각" value={fmtDateTime(detail.updated_at)} />
            {detail.deleted_at && (
              <Row label="삭제 시각" value={fmtDateTime(detail.deleted_at)} />
            )}
          </div>
        </Section>

        <Section title="지표">
          <div className="mb-3 rounded-lg bg-brand-surface px-4 py-2 text-sm">
            <span className="text-brand-slate">Processing Velocity</span>
            <span className="ml-3 font-mono text-brand-ink">
              {fmtNum(m.processing_velocity)}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-brand-slate">STT</h4>
              <MetricTable rows={sttRows} />
            </div>
            <div>
              <h4 className="mb-1.5 text-xs font-semibold text-brand-slate">
                {labels.summarySectionTitle}
              </h4>
              <MetricTable rows={summaryRows} />
            </div>
          </div>
        </Section>

        {detail.full_text != null && (
          <Section title="전사 전문">
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-brand-surface p-4 text-sm text-brand-navy">
              {detail.full_text}
            </pre>
          </Section>
        )}

        {detail.reference_text != null && (
          <Section title="참조 정답 텍스트">
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-brand-surface p-4 text-sm text-brand-navy">
              {detail.reference_text}
            </pre>
          </Section>
        )}

        {detail.details && Object.keys(detail.details).length > 0 && (
          <Section title="상세 진단(details)">
            <pre className="overflow-x-auto rounded-lg bg-brand-surface p-4 text-xs text-brand-navy">
              {JSON.stringify(detail.details, null, 2)}
            </pre>
          </Section>
        )}
      </div>
    </div>
  );
}
