/**
 * Turing 대시보드 — 차트 라벨 등.
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

/** GET /evaluations — 페이지당 건수(이 페이지 목록으로 지표 평균 산출) */
export const TURING_EVALUATIONS_PAGE_SIZE = 10;

/** Velocity 카드 — 지표명과 동일 순서로 호버 설명 */
export const VELOCITY_METRIC_DESCRIPTIONS = {
  processing: "전체 처리 속도",
  stt: "STT 처리 속도",
  summarization: "요약 처리 속도",
} as const;

/** STT_RADAR_LIST_LABELS 와 동일 순서 */
export const STT_METRIC_DESCRIPTIONS: readonly string[] = [
  "STT 처리 속도",
  "문법적으로 부자연스럽거나 의미 해석이 불가능한 문장 비율",
  "개인식별정보(이름, 주민번호, 이메일, 주소)를 올바르게 탐지하여 마스킹한 비율",
  "전사 과정에서 실제 존재하는 의료 키워드를 아예 인식하지 못한 비율 (용어 미인식)",
  "전사 과정에서 실제 의료 키워드가 잘못된 형태로 출력된 비율 (용어 왜곡)",
  "화자 라벨 및 구간이 정확히 매칭된 세그먼트 비율",
  "비정상적 반복 (모델 오류로 인한 반복) 비율",
];

/** SUMMARY_RADAR_LIST_LABELS 와 동일 순서 */
export const SUMMARY_METRIC_DESCRIPTIONS: readonly string[] = [
  "요약 처리 속도",
  "전사문 대비 의미적 근거를 찾을 수 없는 문장의 비율",
  "전사문 대비 핵심 의미를 충실히 유지한 문장의 비율",
  "전사문 대비 얼마나 정보량을 압축했는지를 나타내는 비율",
  "실제 의료 키워드가 잘못된 형태로 출력된 비율 (용어 왜곡)",
  "전사문 대비 의료 정보 포함 비율 (누락된 의료정보가 없는지 파악하기 위한 지표)",
  "올바른 섹션/슬롯에 배치된 비율",
];
