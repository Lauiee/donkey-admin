/**
 * API 원시 비율(0~1 등)을 화면에 표시할 때 — 소수 그대로 두지 않고 %로만 표기.
 * (100 − 원시%) 같은 점수 변환은 하지 않음.
 */
export function formatRawRatioAsPercent(v: number): string {
  if (Number.isNaN(v)) return "—";
  const p = Math.round(Math.max(0, v) * 1000) / 10;
  return `${p}%`;
}

export function formatMetricValue(
  v: number | null,
  format: "percent" | "seconds" | "invertedPercent",
  rawSec?: number
): string {
  if (v === null) return "—";
  if (format === "seconds" && rawSec != null) {
    return `${rawSec < 100 ? rawSec.toFixed(1) : rawSec.toFixed(0)}초`;
  }
  return formatRawRatioAsPercent(v);
}
