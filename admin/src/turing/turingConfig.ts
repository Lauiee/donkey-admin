import type { TuringDemoState } from "./turingAggregate";

/**
 * Turing 대시보드 — 차트 라벨 등.
 * 등급·임계값은 metricGrades.ts 를 참고하세요.
 */

/** 레이더 꼭지(짧은 라벨) — 차트 주변 공간용 */
export const STT_RADAR_CHART_LABELS = [
  "STT Vel.",
  "UER",
  "PII",
  "CKM",
  "CKD",
  "Diar.",
  "Redund.",
] as const;

/** 하단 표·툴팁용 풀 이름 (상담(콜센터) 도메인) */
export const STT_RADAR_LIST_LABELS = [
  "STT Velocity",
  "UER (Unnatural Expression Ratio)",
  "PII Protection",
  "CKM (CS Keyword Miss Ratio)",
  "CKD (CS Keyword Distortion Ratio)",
  "Diarization Accuracy",
  "Redundancy Ratio",
] as const;

export const SUMMARY_RADAR_CHART_LABELS = [
  "Sum. Vel.",
  "HR",
  "SSR",
  "ICR",
  "CKD",
  "CIR",
  "SSA",
] as const;

export const SUMMARY_RADAR_LIST_LABELS = [
  "Summarization Velocity",
  "HR (Hallucination Ratio)",
  "SSR (Semantic Similarity Ratio)",
  "ICR (Information Compression Ratio)",
  "CKD (CS Keyword Distortion Ratio)",
  "CIR (CS Information Recall)",
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
  "개인식별정보(전화/주소/카드/이름 등)를 올바르게 탐지하여 마스킹한 비율",
  "전사 과정에서 실제 발화된 CS 도메인 키워드(메뉴명·배달·환불 용어 등)를 인식하지 못한 비율",
  "전사 과정에서 CS 도메인 키워드가 잘못된 형태로 출력된 비율 (용어 왜곡)",
  "화자 라벨 및 구간이 정확히 매칭된 세그먼트 비율",
  "비정상적 반복 (모델 오류로 인한 반복) 비율",
];

/** 카드 상단 메타 — STT_RADAR_LIST_LABELS 와 동일 순서 (metricGrades.METRIC_SPECS slug 와 정합) */
export const STT_METRIC_SLUGS: readonly string[] = [
  "STT_VELOCITY",
  "UER",
  "PII_PROTECTION",
  "CKM",
  "CKD",
  "DIARIZATION",
  "REDUNDANCY",
];

/** SUMMARY_RADAR_LIST_LABELS 와 동일 순서 (metricGrades.METRIC_SPECS slug 와 정합) */
export const SUMMARY_METRIC_SLUGS: readonly string[] = [
  "SUMMARY_VELOCITY",
  "HR",
  "SSR",
  "ICR",
  "CKD",
  "CIR",
  "SSA",
];

/** SUMMARY_RADAR_LIST_LABELS 와 동일 순서 */
export const SUMMARY_METRIC_DESCRIPTIONS: readonly string[] = [
  "요약 처리 속도",
  "전사문 대비 의미적 근거를 찾을 수 없는 문장의 비율",
  "전사문 대비 핵심 의미를 충실히 유지한 문장의 비율",
  "전사문 대비 얼마나 정보량을 압축했는지를 나타내는 비율",
  "CIAR 요약 내 CS 핵심정보(주문내용·환불금액·처리방법 등)가 잘못된 형태로 출력된 비율 (용어 왜곡)",
  "전사문 대비 CS 핵심정보의 CIAR 포함 비율 (누락 여부 측정)",
  "CIAR 5섹션(context/intent/action/result/issue)이 올바른 섹션/슬롯에 배치된 비율",
];

// ─────────────────────────────────────────────────────────────────────────
// CS 도메인 상세 지표 (동키CNT_평가지표 v0.2 기준).
// Velocity(Processing/STT/Summarization)는 상단 Velocity 섹션에서 별도 표시하므로 제외.
// read(demo): API 평균(demo)에서 값 추출. 신규 지표(KCR/IDR/AC/RRS/CSR Turn)는 API 미제공 → mock.
// ─────────────────────────────────────────────────────────────────────────

export type CsMetricGroup = "STT" | "SUMMARY" | "CS";

export type CsDetailMetricDef = {
  slug: string;
  label: string;
  description: string;
  group: CsMetricGroup;
  rowFormat: "percent" | "invertedPercent";
  /** demo 에서 값 추출 (null=미지원). CS 특화 신규 지표는 mock 상수 반환. */
  read: (demo: TuringDemoState) => number | null;
  /** 건당 추이 매핑 — sttMetricTrendSeries/summaryMetricTrendSeries 인덱스 (mock 은 생략) */
  trend?: { group: "stt" | "summary"; index: number };
};

/** CS 특화 신규 지표 목업값 (API 미제공) — 등급 분포 의도: KCR/AC/RRS 우수, IDR/CSR Turn 보통 */
export const TURING_CS_SPECIAL_MOCK = {
  kcr: 0.81, // 우수 (>0.7)
  idr: 0.66, // 보통 (0.4~0.7)
  ac: 0.79, // 우수 (>0.7)
  rrs: 0.74, // 우수 (>0.7)
  csrTurnRatio: 0.58, // 보통 (적정 25~50% 밖, 0.5~0.65)
} as const;

export const CS_DETAIL_METRICS: readonly CsDetailMetricDef[] = [
  // ── STT ──
  {
    slug: "UER",
    label: "UER (Unnatural Expression Ratio)",
    description: "문법적으로 부자연스럽거나 의미 해석이 불가능한 문장 비율",
    group: "STT",
    rowFormat: "invertedPercent",
    read: (d) => d.stt.uer,
    trend: { group: "stt", index: 1 },
  },
  {
    slug: "CKM",
    label: "CKM (CS Keyword Miss Ratio)",
    description:
      "전사 과정에서 실제 발화된 CS 도메인 키워드(메뉴명, 배달·환불 용어 등)를 인식하지 못한 비율",
    group: "STT",
    rowFormat: "invertedPercent",
    read: (d) => d.stt.mmr,
    trend: { group: "stt", index: 3 },
  },
  {
    slug: "CKD",
    label: "CKD (CS Keyword Distortion Ratio)",
    description: "전사 과정에서 CS 도메인 키워드가 잘못된 형태로 출력된 비율 (용어 왜곡)",
    group: "STT",
    rowFormat: "invertedPercent",
    read: (d) => d.stt.mdr,
    trend: { group: "stt", index: 4 },
  },
  {
    slug: "DIARIZATION",
    label: "Diarization Accuracy",
    description: "화자 라벨 및 구간이 정확히 매칭된 세그먼트 비율",
    group: "STT",
    rowFormat: "percent",
    read: (d) => d.stt.diarizationAccuracy,
    trend: { group: "stt", index: 5 },
  },
  {
    slug: "REDUNDANCY",
    label: "Redundancy Ratio",
    description: "비정상적 반복 (모델 오류로 인한 반복) 비율",
    group: "STT",
    rowFormat: "invertedPercent",
    read: (d) => d.stt.redundancyRatio,
    trend: { group: "stt", index: 6 },
  },
  // ── 요약 (Summary) ──
  {
    slug: "HR",
    label: "HR (Hallucination Ratio)",
    description: "전사문 대비 의미적 근거를 찾을 수 없는 문장의 비율",
    group: "SUMMARY",
    rowFormat: "invertedPercent",
    read: (d) => d.summary.hallucinationRatio,
    trend: { group: "summary", index: 1 },
  },
  {
    slug: "SSR",
    label: "SSR (Semantic Similarity Ratio)",
    description: "전사문 대비 핵심 의미를 충실히 유지한 문장의 비율",
    group: "SUMMARY",
    rowFormat: "percent",
    read: (d) => d.summary.ssr,
    trend: { group: "summary", index: 2 },
  },
  {
    slug: "ICR",
    label: "ICR (Information Compression Ratio)",
    description: "전사문 대비 얼마나 정보량을 압축했는지를 나타내는 비율",
    group: "SUMMARY",
    rowFormat: "invertedPercent",
    read: (d) => d.summary.icr,
    trend: { group: "summary", index: 3 },
  },
  {
    slug: "CKD",
    label: "CKD (CS Keyword Distortion Ratio)",
    description:
      "CIAR 요약 내 CS 핵심 정보(주문내용·환불금액·처리방법 등)가 잘못된 형태로 출력된 비율 (용어 왜곡)",
    group: "SUMMARY",
    rowFormat: "invertedPercent",
    read: (d) => d.summary.summaryMdr,
    trend: { group: "summary", index: 4 },
  },
  {
    slug: "CIR",
    label: "CIR (CS Information Recall)",
    description: "전사문 대비 CS 핵심 정보의 CIAR 포함 비율 (누락 여부 측정)",
    group: "SUMMARY",
    rowFormat: "percent",
    read: (d) => d.summary.mir,
    trend: { group: "summary", index: 5 },
  },
  {
    slug: "SSA",
    label: "SSA (Structured Summary Accuracy)",
    description:
      "CIAR 5개 슬롯(context/intent/action/result/issue)이 올바른 섹션/슬롯에 배치된 비율",
    group: "SUMMARY",
    rowFormat: "percent",
    read: (d) => d.summary.ssa,
    trend: { group: "summary", index: 6 },
  },
  // ── CS 특화 지표 (mock) ──
  {
    slug: "KCR",
    label: "KCR (Keyword Coverage Ratio)",
    description:
      "CIAR keywords가 전사문의 실제 발화 내용을 얼마나 커버하는지 나타내는 비율",
    group: "CS",
    rowFormat: "percent",
    read: () => TURING_CS_SPECIAL_MOCK.kcr,
  },
  {
    slug: "IDR",
    label: "IDR (Issue Detection Recall)",
    description:
      "통화에서 발생한 실제 고객 불만·CS 이슈가 issue 필드에 빠짐없이 포착된 비율",
    group: "CS",
    rowFormat: "percent",
    read: () => TURING_CS_SPECIAL_MOCK.idr,
  },
  {
    slug: "AC",
    label: "AC (Action Completeness)",
    description:
      "csr(상담원)이 실제 취한 조치·안내가 action 필드에 누락 없이 반영된 비율",
    group: "CS",
    rowFormat: "percent",
    read: () => TURING_CS_SPECIAL_MOCK.ac,
  },
  {
    slug: "RRS",
    label: "RRS (Re-contact Readiness Score)",
    description:
      "재인입 고객 응대 시 이전 통화 내용을 빠르게 파악할 수 있는 요약 충실도 복합 지표 (SSR·CSIR·CC 가중 결합)",
    group: "CS",
    rowFormat: "percent",
    read: () => TURING_CS_SPECIAL_MOCK.rrs,
  },
  {
    slug: "CSR_TURN",
    label: "CSR Turn Ratio",
    description:
      "전체 발화 세그먼트 중 csr(상담원) 발화 비율 (적정 범위 25~50%)",
    group: "CS",
    rowFormat: "percent",
    read: () => TURING_CS_SPECIAL_MOCK.csrTurnRatio,
  },
];
