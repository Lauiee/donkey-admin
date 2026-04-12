/**
 * 튜링 대시보드 — 차트 라벨 등.
 * 등급·임계값은 metricGrades.ts 를 참고하세요.
 */

/** 레이더 꼭지(짧은 라벨) — 차트 주변 공간용 */
export const STT_RADAR_CHART_LABELS = [
  "STT Vel.",
  "UER",
  "PII",
  "MMR",
  "MDR",
  "Diar.",
  "Redund.",
] as const;

/** 하단 표·툴팁용 풀 이름 */
export const STT_RADAR_LIST_LABELS = [
  "STT Velocity",
  "UER (Unnatural Expression Ratio)",
  "PII Protection",
  "MMR (Medical Miss Ratio)",
  "MDR (Medical Distortion Ratio)",
  "Diarization Accuracy",
  "Redundancy Ratio",
] as const;

export const SUMMARY_RADAR_CHART_LABELS = [
  "Sum. Vel.",
  "HR",
  "SSR",
  "ICR",
  "MDR",
  "MIR",
  "SSA",
] as const;

export const SUMMARY_RADAR_LIST_LABELS = [
  "Summarization Velocity",
  "HR (Hallucination Ratio)",
  "SSR (Semantic Similarity Ratio)",
  "ICR (Information Compression Ratio)",
  "MDR (Medical Distortion Ratio)",
  "MIR (Medical Information Recall)",
  "SSA (Structured Summary Accuracy)",
] as const;
