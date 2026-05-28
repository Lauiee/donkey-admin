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
    /** 로그 기반 결정값 — 항상 산출 */
    velocityRatio: number;
    /** LLM-as-Judge 산출 실패/스킵 시 표본 0건 → null */
    uer: number | null;
    piiProtection: number | null;
    mmr: number | null;
    mdr: number | null;
    diarizationAccuracy: number | null;
    redundancyRatio: number | null;
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
/**
 * null=미산출은 "미흡(poor)"이 아니라 가중평균에서 제외해야 점수가 왜곡되지 않음.
 * 산출 가능한 지표끼리만 가중평균을 낸다.
 */
function healthScoreFromItem(item: EvaluationListItemApi): number {
  const { metrics } = item;

  const tier = <T>(v: T | null, fn: (x: T) => MetricTier): MetricTier | null =>
    v == null ? null : fn(v);

  const weighted: Array<{ tier: MetricTier | null; weight: number }> = [
    // default(1)
    { tier: gradeProcessingVelocity(metrics.processing_velocity), weight: 1 },
    { tier: gradeSttVelocityRatio(metrics.stt.stt_velocity), weight: 1 },
    { tier: tier(metrics.stt.uer, gradeUer), weight: 1 },
    { tier: tier(metrics.stt.mmr, gradeMmr), weight: 1 },
    { tier: tier(metrics.stt.diarization_accuracy, gradeDiarizationAccuracy), weight: 1 },
    { tier: tier(metrics.stt.redundancy_ratio, gradeRedundancyRatio), weight: 1 },
    { tier: tier(metrics.summary.summarization_velocity, gradeSummarizationVelocity), weight: 1 },
    { tier: tier(metrics.summary.ssr, gradeSsr), weight: 1 },
    { tier: tier(metrics.summary.icr, (x) => gradeIcr(x) as MetricTier), weight: 1 },
    { tier: tier(metrics.summary.mir, gradeMir), weight: 1 },
    { tier: tier(metrics.summary.ssa, gradeSsa), weight: 1 },

    // critical(3)
    { tier: tier(metrics.stt.pii_protection, gradePiiProtection), weight: 3 },
    { tier: tier(metrics.stt.mdr, gradeSttMdr), weight: 3 },
    { tier: tier(metrics.summary.hallucination_ratio, gradeHallucinationRatio), weight: 3 },
    { tier: tier(metrics.summary.summary_mdr, gradeSummaryMdr), weight: 3 },
  ];

  const scored = weighted.filter((w): w is { tier: MetricTier; weight: number } => w.tier !== null);
  if (scored.length === 0) return 0;
  const num = scored.reduce((acc, x) => acc + tierToHealthScore(x.tier) * x.weight, 0);
  const den = scored.reduce((acc, x) => acc + x.weight, 0);
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
      uer: avgNullable(st.map((s) => s.uer)),
      piiProtection: avgNullable(st.map((s) => s.pii_protection)),
      mmr: avgNullable(st.map((s) => s.mmr)),
      mdr: avgNullable(st.map((s) => s.mdr)),
      diarizationAccuracy: avgNullable(st.map((s) => s.diarization_accuracy)),
      redundancyRatio: avgNullable(st.map((s) => s.redundancy_ratio)),
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

/** STT 레이더 등급 — null 이면 해당 축 neutral (velocityRatio는 항상 number) */
export function tiersForSttRadarNullable(values: {
  sttVelocityRatio: number;
  uer: number | null;
  piiProtection: number | null;
  mmr: number | null;
  mdr: number | null;
  diarizationAccuracy: number | null;
  redundancyRatio: number | null;
}): Array<MetricTier | "neutral"> {
  const t = (
    v: number | null,
    fn: (x: number) => MetricTier
  ): MetricTier | "neutral" => (v === null ? "neutral" : fn(v));

  return [
    gradeSttVelocityRatio(values.sttVelocityRatio),
    t(values.uer, gradeUer),
    t(values.piiProtection, gradePiiProtection),
    t(values.mmr, gradeMmr),
    t(values.mdr, gradeSttMdr),
    t(values.diarizationAccuracy, gradeDiarizationAccuracy),
    t(values.redundancyRatio, gradeRedundancyRatio),
  ];
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
