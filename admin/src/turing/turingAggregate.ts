import type { EvaluationListItemApi } from "./turingApi";
import {
  gradeHallucinationRatio,
  gradeIcr,
  gradeMir,
  gradeSsa,
  gradeSummaryMdr,
  gradeSummarizationVelocity,
  gradeSsr,
  type MetricTier,
} from "./metricGrades";

export type TuringDemoState = {
  processingVelocity01: number;
  summarizationVelocity01: number | null;
  stt: {
    velocityRatio: number;
    uer: number;
    piiProtection: number;
    mmr: number;
    mdr: number;
    diarizationAccuracy: number;
    redundancyRatio: number;
  };
  summary: {
    summarizationVelocity01: number | null;
    hallucinationRatio: number | null;
    ssr: number | null;
    icr: number | null;
    summaryMdr: number | null;
    mir: number | null;
    ssa: number | null;
  };
};

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function avgNullable(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v != null && !Number.isNaN(v));
  if (nums.length === 0) return null;
  return avg(nums);
}

/** 목록 응답 items → 평균 지표 + 건당 추이용 점수 */
export function aggregateEvaluationItems(
  items: EvaluationListItemApi[]
): {
  demo: TuringDemoState;
  /** 시간순(오래된 → 최신) 정렬된 건 순번 */
  perCaseComposite: number[];
  sampleCount: number;
} {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const processing = sorted.map((x) => x.metrics.processing_velocity);
  const st = sorted.map((x) => x.metrics.stt);

  const demo: TuringDemoState = {
    processingVelocity01: avg(processing),
    summarizationVelocity01: avgNullable(
      sorted.map((x) => x.metrics.summary.summarization_velocity)
    ),
    stt: {
      velocityRatio: avg(st.map((s) => s.stt_velocity)),
      uer: avg(st.map((s) => s.uer)),
      piiProtection: avg(st.map((s) => s.pii_protection)),
      mmr: avg(st.map((s) => s.mmr)),
      mdr: avg(st.map((s) => s.mdr)),
      diarizationAccuracy: avg(st.map((s) => s.diarization_accuracy)),
      redundancyRatio: avg(st.map((s) => s.redundancy_ratio)),
    },
    summary: {
      summarizationVelocity01: avgNullable(
        sorted.map((x) => x.metrics.summary.summarization_velocity)
      ),
      hallucinationRatio: avgNullable(
        sorted.map((x) => x.metrics.summary.hallucination_ratio)
      ),
      ssr: avgNullable(sorted.map((x) => x.metrics.summary.ssr)),
      icr: avgNullable(sorted.map((x) => x.metrics.summary.icr)),
      summaryMdr: avgNullable(sorted.map((x) => x.metrics.summary.summary_mdr)),
      mir: avgNullable(sorted.map((x) => x.metrics.summary.mir)),
      ssa: avgNullable(sorted.map((x) => x.metrics.summary.ssa)),
    },
  };

  /** 건당 종합: 처리 속도 기반 품질 스코어 0~1 (높을수록 좋음) — 1/(1+pv) */
  const perCaseComposite = sorted.map((x) => {
    const pv = x.metrics.processing_velocity;
    if (pv <= 0) return 0;
    return Math.min(1, 1 / (1 + pv));
  });

  return {
    demo,
    perCaseComposite,
    sampleCount: sorted.length,
  };
}

/** Summary 레이더 등급 — null 이면 해당 축 neutral */
export function tiersForSummaryRadarNullable(values: {
  summarizationVelocity01: number | null;
  hallucinationRatio: number | null;
  ssr: number | null;
  icr: number | null;
  summaryMdr: number | null;
  mir: number | null;
  ssa: number | null;
}): Array<MetricTier | "neutral"> {
  const t = (v: number | null, fn: (x: number) => MetricTier): MetricTier | "neutral" =>
    v === null ? "neutral" : fn(v);

  return [
    values.summarizationVelocity01 == null
      ? "neutral"
      : gradeSummarizationVelocity(values.summarizationVelocity01),
    t(values.hallucinationRatio, gradeHallucinationRatio),
    t(values.ssr, gradeSsr),
    t(values.icr, (x) => gradeIcr(x) as MetricTier),
    t(values.summaryMdr, gradeSummaryMdr),
    t(values.mir, gradeMir),
    t(values.ssa, gradeSsa),
  ];
}
