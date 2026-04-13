import type { MetricTier } from "./metricGrades";

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
