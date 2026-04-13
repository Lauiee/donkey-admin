import type { EvaluationListItemApi } from "./turingApi";
import {
  gradeDiarizationAccuracy,
  gradeHallucinationRatio,
  gradeIcr,
  gradeMir,
  gradeMmr,
  gradePiiProtection,
  gradeProcessingVelocity,
  gradeRedundancyRatio,
  gradeSsa,
  gradeSttMdr,
  gradeSttVelocityRatio,
  gradeSummaryMdr,
  gradeSummarizationVelocity,
  gradeSsr,
  gradeUer,
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

function tierToHealthScore(tier: MetricTier): number {
  if (tier === "excellent") return 1.0; // good
  if (tier === "medium") return 0.5; // ok
  return 0.0; // bad
}

/**
 * Health Score (0~100)
 * - good=1.0 / ok=0.5 / bad=0.0
 * - critical(3): pii_protection, hallucination_ratio, mdr, summary_mdr
 * - default(1): 나머지 지표
 */
function healthScoreFromItem(item: EvaluationListItemApi): number {
  const { metrics } = item;

  const weighted: Array<{ value: number; weight: number }> = [
    // default(1)
    { value: tierToHealthScore(gradeProcessingVelocity(metrics.processing_velocity)), weight: 1 },
    { value: tierToHealthScore(gradeSttVelocityRatio(metrics.stt.stt_velocity)), weight: 1 },
    { value: tierToHealthScore(gradeUer(metrics.stt.uer)), weight: 1 },
    { value: tierToHealthScore(gradeMmr(metrics.stt.mmr)), weight: 1 },
    { value: tierToHealthScore(gradeDiarizationAccuracy(metrics.stt.diarization_accuracy)), weight: 1 },
    { value: tierToHealthScore(gradeRedundancyRatio(metrics.stt.redundancy_ratio)), weight: 1 },
    {
      value: tierToHealthScore(
        metrics.summary.summarization_velocity == null
          ? "poor"
          : gradeSummarizationVelocity(metrics.summary.summarization_velocity)
      ),
      weight: 1,
    },
    {
      value: tierToHealthScore(
        metrics.summary.ssr == null ? "poor" : gradeSsr(metrics.summary.ssr)
      ),
      weight: 1,
    },
    {
      value: tierToHealthScore(
        metrics.summary.icr == null
          ? "poor"
          : (gradeIcr(metrics.summary.icr) as MetricTier)
      ),
      weight: 1,
    },
    {
      value: tierToHealthScore(
        metrics.summary.mir == null ? "poor" : gradeMir(metrics.summary.mir)
      ),
      weight: 1,
    },
    {
      value: tierToHealthScore(
        metrics.summary.ssa == null ? "poor" : gradeSsa(metrics.summary.ssa)
      ),
      weight: 1,
    },

    // critical(3)
    { value: tierToHealthScore(gradePiiProtection(metrics.stt.pii_protection)), weight: 3 },
    { value: tierToHealthScore(gradeSttMdr(metrics.stt.mdr)), weight: 3 },
    {
      value: tierToHealthScore(
        metrics.summary.hallucination_ratio == null
          ? "poor"
          : gradeHallucinationRatio(metrics.summary.hallucination_ratio)
      ),
      weight: 3,
    },
    {
      value: tierToHealthScore(
        metrics.summary.summary_mdr == null
          ? "poor"
          : gradeSummaryMdr(metrics.summary.summary_mdr)
      ),
      weight: 3,
    },
  ];

  const num = weighted.reduce((acc, x) => acc + x.value * x.weight, 0);
  const den = weighted.reduce((acc, x) => acc + x.weight, 0); // 23
  return Math.round((num / den) * 100);
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

  /** 건당 종합: Health Score 0~100 */
  const perCaseComposite = sorted.map((x) => healthScoreFromItem(x));

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
