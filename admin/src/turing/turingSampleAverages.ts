/** Turing 페이지: 최근 N건 샘플 → 평균 (데모/API 연동 시 동일 패턴) */
export const TURING_SAMPLE_COUNT = 10;

export function averageSamples(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}
