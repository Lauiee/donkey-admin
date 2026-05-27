import { METRIC_SPECS, type MetricTier } from "./metricGrades";

/** 상세 지표 막대 · Velocity 반원 · 범례 점 공통 */
export const TURING_GAUGE_GREEN = "#91C0A4";
export const TURING_GAUGE_TAN = "#D6B67D";
export const TURING_GAUGE_ROSE = "#C48680";
export const TURING_GAUGE_THUMB_LINE = "#5E9E7A";

export type TuringGaugeRowFormat =
  | "percent"
  | "seconds"
  | "invertedPercent";

/** 하단 임계 점 / 반원 호 색 — 등급별 */
export function turingGaugeTierFill(tier: MetricTier): string {
  switch (tier) {
    case "excellent":
      return TURING_GAUGE_GREEN;
    case "medium":
      return TURING_GAUGE_TAN;
    case "poor":
      return TURING_GAUGE_ROSE;
    default:
      return "#94a3b8";
  }
}

/** 낮을수록 좋음 — 초록 왼쪽 */
const TRACK_LOWER = `linear-gradient(90deg,
  ${TURING_GAUGE_GREEN} 0%,
  ${TURING_GAUGE_GREEN} 15%,
  ${TURING_GAUGE_TAN} 15%,
  ${TURING_GAUGE_TAN} 35%,
  ${TURING_GAUGE_ROSE} 35%,
  ${TURING_GAUGE_ROSE} 100%)`;

/** 높을수록 좋음 — 초록 오른쪽 */
const TRACK_HIGHER = `linear-gradient(90deg,
  ${TURING_GAUGE_ROSE} 0%,
  ${TURING_GAUGE_ROSE} 65%,
  ${TURING_GAUGE_TAN} 65%,
  ${TURING_GAUGE_TAN} 85%,
  ${TURING_GAUGE_GREEN} 85%,
  ${TURING_GAUGE_GREEN} 100%)`;

export function gaugeTrackCssBackground(
  rowFormat: TuringGaugeRowFormat
): string {
  if (rowFormat === "invertedPercent" || rowFormat === "seconds") {
    return TRACK_LOWER;
  }
  return TRACK_HIGHER;
}

const pct = (x: number) => `${Math.round(Math.min(1, Math.max(0, x)) * 100)}%`;

/**
 * 지표별 실제 임계값(METRIC_SPECS)에 맞춘 막대 트랙 그라데이션.
 * 색 구간 경계 = 등급 임계값 → 막대 위 thumb 위치가 등급 배지와 항상 일치.
 * 스펙이 없는 slug 는 null (호출 측에서 rowFormat 기반 기본 트랙으로 폴백).
 */
export function metricGaugeTrackBySlug(slug: string): string | null {
  const s = METRIC_SPECS[slug];
  if (!s) return null;
  const G = TURING_GAUGE_GREEN;
  const T = TURING_GAUGE_TAN;
  const R = TURING_GAUGE_ROSE;
  switch (s.dir) {
    case "lower":
      return `linear-gradient(90deg, ${G} 0%, ${G} ${pct(s.ex)}, ${T} ${pct(
        s.ex
      )}, ${T} ${pct(s.md)}, ${R} ${pct(s.md)}, ${R} 100%)`;
    case "lowerNoPoor":
      return `linear-gradient(90deg, ${G} 0%, ${G} ${pct(s.ex)}, ${T} ${pct(
        s.ex
      )}, ${T} 100%)`;
    case "higher":
      return `linear-gradient(90deg, ${R} 0%, ${R} ${pct(s.md)}, ${T} ${pct(
        s.md
      )}, ${T} ${pct(s.ex)}, ${G} ${pct(s.ex)}, ${G} 100%)`;
    case "band":
      return `linear-gradient(90deg, ${R} 0%, ${R} ${pct(s.mdLo)}, ${T} ${pct(
        s.mdLo
      )}, ${T} ${pct(s.exLo)}, ${G} ${pct(s.exLo)}, ${G} ${pct(
        s.exHi
      )}, ${T} ${pct(s.exHi)}, ${T} ${pct(s.mdHi)}, ${R} ${pct(s.mdHi)}, ${R} 100%)`;
  }
}
