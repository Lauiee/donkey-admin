/**
 * 튜링 지표 등급 (우수 / 보통 / 미흡).
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

/** STT Velocity — 초 단위: 우수 < 5초, 보통 < 15초, 미흡 ≥ 15초 */
export function gradeSttVelocitySeconds(sec: number): MetricTier {
  if (sec < 5) return "excellent";
  if (sec < 15) return "medium";
  return "poor";
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
  sttVelocitySec: number;
  uer: number;
  piiProtection: number;
  mmr: number;
  mdr: number;
  diarizationAccuracy: number;
  redundancyRatio: number;
}): MetricTier[] {
  return [
    gradeSttVelocitySeconds(values.sttVelocitySec),
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

/** 차트 반지름용 0~1 정규화 — STT 속도: 짧을수록 좋음 → 짧을수록 바깥으로 */
export function sttVelocitySecToRadius01(sec: number): number {
  return clamp(1 - sec / 30, 0, 1);
}
