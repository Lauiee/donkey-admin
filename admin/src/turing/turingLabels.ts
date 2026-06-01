/**
 * Turing 도메인(cnt=상담 / hippo=의료)별 라벨·설명 세트.
 *
 * - 백엔드 응답 키(uer/mmr/mdr/mir 등)와 등급 함수 slug(UER/CKM/CKD/CIR 등)는 도메인 무관 공통.
 * - 사람에게 보이는 약어 풀이·도메인 키워드 표현·Summary 5섹션 표기만 도메인별로 다름.
 *
 * Detail/Radar 화면용 8개 라벨 세트 + Summary 섹션 타이틀 + cards 화면 CS_DETAIL_METRICS 의
 * label/description override 두 가지를 도메인 입력으로 결정한다.
 */
import type { TuringDomain } from "../auth";
import type { CsDetailMetricDef } from "./turingConfig";

export type TuringLabelSet = {
  sttRadarChartLabels: readonly string[];
  sttRadarListLabels: readonly string[];
  sttMetricDescriptions: readonly string[];
  sttMetricSlugs: readonly string[];
  summaryRadarChartLabels: readonly string[];
  summaryRadarListLabels: readonly string[];
  summaryMetricDescriptions: readonly string[];
  summaryMetricSlugs: readonly string[];
  /** "Summary (CIAR)" 또는 "Summary (SOAP)" */
  summarySectionTitle: string;
};

/** 상담(콜센터) 도메인 — cntt.turing.intcorp.ai */
export const CNT_LABEL_SET: TuringLabelSet = {
  sttRadarChartLabels: [
    "STT Vel.",
    "UER",
    "PII",
    "CKM",
    "CKD",
    "Diar.",
    "Redund.",
  ],
  sttRadarListLabels: [
    "STT Velocity",
    "UER (Unnatural Expression Ratio)",
    "PII Protection",
    "CKM (CS Keyword Miss Ratio)",
    "CKD (CS Keyword Distortion Ratio)",
    "Diarization Accuracy",
    "Redundancy Ratio",
  ],
  sttMetricDescriptions: [
    "STT 처리 속도",
    "문법적으로 부자연스럽거나 의미 해석이 불가능한 문장 비율",
    "개인식별정보(전화/주소/카드/이름 등)를 올바르게 탐지하여 마스킹한 비율",
    "전사 과정에서 실제 발화된 CS 도메인 키워드(메뉴명·배달·환불 용어 등)를 인식하지 못한 비율",
    "전사 과정에서 CS 도메인 키워드가 잘못된 형태로 출력된 비율 (용어 왜곡)",
    "화자 라벨 및 구간이 정확히 매칭된 세그먼트 비율",
    "비정상적 반복 (모델 오류로 인한 반복) 비율",
  ],
  sttMetricSlugs: [
    "STT_VELOCITY",
    "UER",
    "PII_PROTECTION",
    "CKM",
    "CKD",
    "DIARIZATION",
    "REDUNDANCY",
  ],
  summaryRadarChartLabels: [
    "Sum. Vel.",
    "HR",
    "SSR",
    "ICR",
    "CKD",
    "CIR",
    "SSA",
  ],
  summaryRadarListLabels: [
    "Summarization Velocity",
    "HR (Hallucination Ratio)",
    "SSR (Semantic Similarity Ratio)",
    "ICR (Information Compression Ratio)",
    "CKD (CS Keyword Distortion Ratio)",
    "CIR (CS Information Recall)",
    "SSA (Structured Summary Accuracy)",
  ],
  summaryMetricSlugs: [
    "SUMMARY_VELOCITY",
    "HR",
    "SSR",
    "ICR",
    "CKD",
    "CIR",
    "SSA",
  ],
  summaryMetricDescriptions: [
    "요약 처리 속도",
    "전사문 대비 의미적 근거를 찾을 수 없는 문장의 비율",
    "전사문 대비 핵심 의미를 충실히 유지한 문장의 비율",
    "전사문 대비 얼마나 정보량을 압축했는지를 나타내는 비율",
    "CIAR 요약 내 CS 핵심정보(주문내용·환불금액·처리방법 등)가 잘못된 형태로 출력된 비율 (용어 왜곡)",
    "전사문 대비 CS 핵심정보의 CIAR 포함 비율 (누락 여부 측정)",
    "CIAR 5섹션(context/intent/action/result/issue)이 올바른 섹션/슬롯에 배치된 비율",
  ],
  summarySectionTitle: "Summary (CIAR)",
};

/** 의료(병원) 도메인 — turing.donkey.ai.kr */
export const HIPPO_LABEL_SET: TuringLabelSet = {
  sttRadarChartLabels: [
    "STT Vel.",
    "UER",
    "PII",
    "MMR",
    "MDR",
    "Diar.",
    "Redund.",
  ],
  sttRadarListLabels: [
    "STT Velocity",
    "UER (Unnatural Expression Ratio)",
    "PII Protection",
    "MMR (Medical Miss Ratio)",
    "MDR (Medical Distortion Ratio)",
    "Diarization Accuracy",
    "Redundancy Ratio",
  ],
  sttMetricDescriptions: [
    "STT 처리 속도",
    "문법적으로 부자연스럽거나 의미 해석이 불가능한 문장 비율",
    "개인식별정보(이름·주민번호·이메일·주소 등)를 올바르게 탐지하여 마스킹한 비율",
    "전사 과정에서 실제 존재하는 의료 키워드를 아예 인식하지 못한 비율 (용어 미인식)",
    "전사 과정에서 실제 의료 키워드가 잘못된 형태로 출력된 비율 (용어 왜곡)",
    "화자 라벨 및 구간이 정확히 매칭된 세그먼트 비율",
    "비정상적 반복 (모델 오류로 인한 반복) 비율",
  ],
  sttMetricSlugs: [
    "STT_VELOCITY",
    "UER",
    "PII_PROTECTION",
    "MMR",
    "MDR",
    "DIARIZATION",
    "REDUNDANCY",
  ],
  summaryRadarChartLabels: [
    "Sum. Vel.",
    "HR",
    "SSR",
    "ICR",
    "MDR",
    "MIR",
    "SSA",
  ],
  summaryRadarListLabels: [
    "Summarization Velocity",
    "HR (Hallucination Ratio)",
    "SSR (Semantic Similarity Ratio)",
    "ICR (Information Compression Ratio)",
    "MDR (Medical Distortion Ratio)",
    "MIR (Medical Information Recall)",
    "SSA (Structured Summary Accuracy)",
  ],
  summaryMetricSlugs: [
    "SUMMARY_VELOCITY",
    "HALLUCINATION",
    "SSR",
    "ICR",
    "MDR",
    "MIR",
    "SSA",
  ],
  summaryMetricDescriptions: [
    "요약 처리 속도",
    "전사문 대비 의미적 근거를 찾을 수 없는 문장의 비율",
    "전사문 대비 핵심 의미를 충실히 유지한 문장의 비율",
    "전사문 대비 얼마나 정보량을 압축했는지를 나타내는 비율",
    "실제 의료 키워드가 잘못된 형태로 출력된 비율 (용어 왜곡)",
    "전사문 대비 의료 정보 포함 비율 (누락된 의료정보가 없는지 파악하기 위한 지표)",
    "올바른 섹션/슬롯에 배치된 비율",
  ],
  summarySectionTitle: "Summary (SOAP)",
};

export function getTuringLabelSet(domain: TuringDomain): TuringLabelSet {
  return domain === "hippo" ? HIPPO_LABEL_SET : CNT_LABEL_SET;
}

/**
 * cards 화면(CS_DETAIL_METRICS)의 카드별 label/description override.
 * slug 는 등급 함수(METRIC_SPECS) 키라 도메인 무관 고정. hippo 도메인에서만
 * label/description 을 의료 도메인 표현으로 갈아끼운다.
 *
 * 키가 없으면 CS_DETAIL_METRICS 의 기본값(=cnt 표현)을 그대로 사용.
 */
export const HIPPO_CARD_OVERRIDES: Record<
  string,
  { label?: string; description?: string }
> = {
  CKM: {
    label: "MMR (Medical Miss Ratio)",
    description:
      "전사 과정에서 실제 존재하는 의료 키워드를 아예 인식하지 못한 비율 (용어 미인식)",
  },
  // STT 쪽 CKD
  // (CS_DETAIL_METRICS 에 같은 slug 가 STT/SUMMARY 두 번 등장 — 같은 의료 표현이라 동일 override)
  CKD: {
    label: "MDR (Medical Distortion Ratio)",
    description: "실제 의료 키워드가 잘못된 형태로 출력된 비율 (용어 왜곡)",
  },
  CIR: {
    label: "MIR (Medical Information Recall)",
    description:
      "전사문 대비 의료 정보 포함 비율 (누락된 의료정보가 없는지 파악하기 위한 지표)",
  },
  // 그 외 (UER/HR/SSR/ICR/SSA/DIARIZATION/REDUNDANCY 및 CS 특화 5종)는 두 도메인에서 동일 표현.
};

export function applyCardOverrides<
  T extends { slug: string; label: string; description: string },
>(items: readonly T[], domain: TuringDomain): readonly T[] {
  if (domain !== "hippo") return items;
  return items.map((it) => {
    const ov = HIPPO_CARD_OVERRIDES[it.slug];
    if (!ov) return it;
    return { ...it, label: ov.label ?? it.label, description: ov.description ?? it.description };
  });
}

/**
 * 도메인별 카드 그리드 메트릭 목록.
 * - cnt   : STT 5 + 요약 7 + CS 특화 5 = 17개 (엑셀 v0.2 기준 CS 특화 KCR/IDR/AC/RRS/CSR Turn 포함)
 * - hippo : CS 특화 5종은 의료 도메인 평가에 해당 없음 → STT 5 + 요약 7 = 12개만 표시.
 *           추가로 STT/요약 라벨·설명은 의료 표현으로 override.
 */
export function getDetailMetricsForDomain(
  domain: TuringDomain,
  csDetailMetrics: readonly CsDetailMetricDef[]
): readonly CsDetailMetricDef[] {
  if (domain === "hippo") {
    const filtered = csDetailMetrics.filter((m) => m.group !== "CS");
    return applyCardOverrides(filtered, domain);
  }
  return csDetailMetrics;
}
