/**
 * Turing 지표 등급 (우수 / 보통 / 미흡).
 * 기준은 제품 스펙 테이블과 동일.
 */

export type MetricTier = "excellent" | "medium" | "poor";

export const TIER_LABEL: Record<MetricTier, string> = {
  excellent: "우수",
  medium: "보통",
  poor: "미흡",
};

/** 등급별 UI 색 (Tailwind 클래스 조합용이 아닌 hex — SVG·배지 공통) */
export const TIER_COLOR = {
  excellent: "#16a34a",
  medium: "#ca8a04",
  poor: "#dc2626",
  neutral: "#94a3b8",
} as const;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** 낮을수록 좋음: 우수 < a, 보통 < b, 그 외 미흡 */
export function tierLowerIsBetter(
  v: number,
  excellentLt: number,
  mediumLt: number
): MetricTier {
  if (v < excellentLt) return "excellent";
  if (v < mediumLt) return "medium";
  return "poor";
}

/** 높을수록 좋음: 우수 > a, 보통 > b, 그 외 미흡 */
export function tierHigherIsBetter(
  v: number,
  excellentGt: number,
  mediumGt: number
): MetricTier {
  if (v > excellentGt) return "excellent";
  if (v > mediumGt) return "medium";
  return "poor";
}

/** 상단 Velocity 게이지·스펙 테이블과 동일 (값은 낮을수록 좋음) */
export const VELOCITY_GAUGE = {
  processing: {
    vmax: 1.2,
    excellentLt: 0.3,
    mediumLt: 1.0,
    caption: "우수 < 0.3 · 보통 < 1.0 · 미흡 ≥ 1.0",
  },
  stt: {
    vmax: 0.6,
    excellentLt: 0.2,
    mediumLt: 0.5,
    caption: "우수 < 0.2 · 보통 < 0.5 · 미흡 ≥ 0.5",
  },
  summarization: {
    /** 시각화 스케일(0~1+). 임계값(0.1/0.3)과 무관 — 너무 작으면 값이 vmax를 넘을 때 바늘이 끝에 붙어 색 띠에 가려짐 */
    vmax: 1.0,
    excellentLt: 0.1,
    mediumLt: 0.3,
    caption: "우수 < 0.1 · 보통 < 0.3 · 미흡 ≥ 0.3",
  },
} as const;

export type VelocityGaugeKind = keyof typeof VELOCITY_GAUGE;

export function velocityGaugeTier(kind: VelocityGaugeKind, v: number): MetricTier {
  const { excellentLt, mediumLt } = VELOCITY_GAUGE[kind];
  return tierLowerIsBetter(v, excellentLt, mediumLt);
}

/** 반원 위 바늘 위치 t∈[0,1] — 값이 클수록 오른쪽(큰 t). 스펙은 여전히 낮을수록 우수 */
export function velocityGaugeNeedleT(kind: VelocityGaugeKind, v: number): number {
  const { vmax } = VELOCITY_GAUGE[kind];
  return clamp(Math.min(v / vmax, 1), 0, 1);
}

/** 반원 색 구간 (좌→우: 우수·보통·미흡 — 값이 커질수록 오른쪽으로) */
export function velocityGaugeArcSplits(kind: VelocityGaugeKind): {
  tGreenEnd: number;
  tYellowEnd: number;
} {
  const { vmax, excellentLt, mediumLt } = VELOCITY_GAUGE[kind];
  return {
    tGreenEnd: clamp(excellentLt / vmax, 0, 1),
    tYellowEnd: clamp(mediumLt / vmax, 0, 1),
  };
}

export function gradeProcessingVelocity(v: number): MetricTier {
  return velocityGaugeTier("processing", v);
}

export function gradeSttVelocityRatio(v: number): MetricTier {
  return velocityGaugeTier("stt", v);
}

export function gradeSummarizationVelocity(v: number): MetricTier {
  return velocityGaugeTier("summarization", v);
}

export function gradeUer(v: number): MetricTier {
  return tierLowerIsBetter(v, 0.05, 0.15);
}

export function gradePiiProtection(v: number): MetricTier {
  return tierHigherIsBetter(v, 0.9, 0.5);
}

export function gradeMmr(v: number): MetricTier {
  return tierLowerIsBetter(v, 0.1, 0.3);
}

export function gradeSttMdr(v: number): MetricTier {
  return tierLowerIsBetter(v, 0.1, 0.3);
}

export function gradeDiarizationAccuracy(v: number): MetricTier {
  return tierHigherIsBetter(v, 0.8, 0.5);
}

export function gradeRedundancyRatio(v: number): MetricTier {
  return tierLowerIsBetter(v, 0.05, 0.15);
}

export function gradeHallucinationRatio(v: number): MetricTier {
  return tierLowerIsBetter(v, 0.1, 0.3);
}

export function gradeSsr(v: number): MetricTier {
  return tierHigherIsBetter(v, 0.7, 0.4);
}

/** ICR: 우수 < 0.5, 보통 ≥ 0.5, 미흡 구간 없음 */
export function gradeIcr(v: number): "excellent" | "medium" {
  return v < 0.5 ? "excellent" : "medium";
}

export function gradeSummaryMdr(v: number): MetricTier {
  return tierLowerIsBetter(v, 0.1, 0.3);
}

export function gradeMir(v: number): MetricTier {
  return tierHigherIsBetter(v, 0.7, 0.4);
}

export function gradeSsa(v: number): MetricTier {
  return tierHigherIsBetter(v, 0.7, 0.4);
}

/** STT 레이더 7축 (순서 고정) — 값은 uer 등 0~1, 0번만 초 */
export function tiersForSttRadar(values: {
  sttVelocityRatio: number;
  uer: number;
  piiProtection: number;
  mmr: number;
  mdr: number;
  diarizationAccuracy: number;
  redundancyRatio: number;
}): MetricTier[] {
  return [
    gradeSttVelocityRatio(values.sttVelocityRatio),
    gradeUer(values.uer),
    gradePiiProtection(values.piiProtection),
    gradeMmr(values.mmr),
    gradeSttMdr(values.mdr),
    gradeDiarizationAccuracy(values.diarizationAccuracy),
    gradeRedundancyRatio(values.redundancyRatio),
  ];
}

/** Summary 레이더 7축 — 0번 속도만 표시(등급 없음) */
export function tiersForSummaryRadar(values: {
  hallucinationRatio: number;
  ssr: number;
  icr: number;
  summaryMdr: number;
  mir: number;
  ssa: number;
}): Array<MetricTier | "neutral"> {
  return [
    "neutral",
    gradeHallucinationRatio(values.hallucinationRatio),
    gradeSsr(values.ssr),
    gradeIcr(values.icr),
    gradeSummaryMdr(values.summaryMdr),
    gradeMir(values.mir),
    gradeSsa(values.ssa),
  ];
}

export function tierToDotColor(t: MetricTier | "neutral"): string {
  if (t === "neutral") return TIER_COLOR.neutral;
  return TIER_COLOR[t];
}

/** 차트 반지름용 — STT velocity 비율: 낮을수록 좋음 → 우수일수록 바깥으로 */
export function sttVelocityRatioToRadius01(ratio: number): number {
  const { vmax } = VELOCITY_GAUGE.stt;
  return clamp(1 - ratio / vmax, 0, 1);
}

/** 0~1 비율, 낮을수록 우수(UER·MMR 등) — 레이더에서는 클수록 바깥 = 좋음 */
export function lowerRatioToRadius01(ratio: number): number {
  return clamp(1 - clamp(ratio, 0, 1), 0, 1);
}

/** 0~1 비율, 높을수록 우수(PII·Diarization·SSR 등) — 그대로 반지름 */
export function higherRatioToRadius01(ratio: number): number {
  return clamp(ratio, 0, 1);
}

/** 요약 속도 — 낮을수록 좋음 → 우수일수록 바깥 */
export function summarizationVelocityToRadius01(v: number): number {
  const { vmax } = VELOCITY_GAUGE.summarization;
  return clamp(1 - Math.min(Math.max(v, 0) / vmax, 1), 0, 1);
}
