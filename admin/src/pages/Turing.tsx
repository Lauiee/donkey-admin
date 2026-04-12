import { useState } from "react";
import { HeptagonRadar } from "../turing/HeptagonRadar";
import {
  sttVelocityRatioToRadius01,
  tiersForSttRadar,
  tiersForSummaryRadar,
} from "../turing/metricGrades";
import {
  STT_RADAR_CHART_LABELS,
  STT_RADAR_LIST_LABELS,
  SUMMARY_RADAR_CHART_LABELS,
  SUMMARY_RADAR_LIST_LABELS,
} from "../turing/turingConfig";
import { VelocityGauge } from "../turing/VelocityGauge";

/** API 연동 전 데모 — Velocity 는 스펙 비율(낮을수록 좋음, 상단 게이지와 동일) */
const DEMO = {
  processingVelocity01: 0.72,
  summarizationVelocity01: 0.65,
  stt: {
    velocityRatio: 0.35,
    uer: 0.08,
    piiProtection: 0.92,
    mmr: 0.12,
    mdr: 0.08,
    diarizationAccuracy: 0.82,
    redundancyRatio: 0.04,
  },
  summary: {
    summarizationVelocity01: 0.65,
    hallucinationRatio: 0.12,
    ssr: 0.75,
    icr: 0.45,
    summaryMdr: 0.08,
    mir: 0.72,
    ssa: 0.78,
  },
} as const;

const STT_ROW_FORMATS: Array<"percent" | "seconds"> = [
  "percent",
  "percent",
  "percent",
  "percent",
  "percent",
  "percent",
  "percent",
];

const SUM_ROW_FORMATS: Array<"percent" | "seconds"> = [
  "percent",
  "percent",
  "percent",
  "percent",
  "percent",
  "percent",
  "percent",
];

export function Turing() {
  const [demo] = useState(DEMO);

  const sttTiers = tiersForSttRadar({
    sttVelocityRatio: demo.stt.velocityRatio,
    uer: demo.stt.uer,
    piiProtection: demo.stt.piiProtection,
    mmr: demo.stt.mmr,
    mdr: demo.stt.mdr,
    diarizationAccuracy: demo.stt.diarizationAccuracy,
    redundancyRatio: demo.stt.redundancyRatio,
  });

  const summaryTiers = tiersForSummaryRadar({
    hallucinationRatio: demo.summary.hallucinationRatio,
    ssr: demo.summary.ssr,
    icr: demo.summary.icr,
    summaryMdr: demo.summary.summaryMdr,
    mir: demo.summary.mir,
    ssa: demo.summary.ssa,
  });

  const sttRadarValues = [
    sttVelocityRatioToRadius01(demo.stt.velocityRatio),
    demo.stt.uer,
    demo.stt.piiProtection,
    demo.stt.mmr,
    demo.stt.mdr,
    demo.stt.diarizationAccuracy,
    demo.stt.redundancyRatio,
  ];

  const summaryRadarValues = [
    demo.summary.summarizationVelocity01,
    demo.summary.hallucinationRatio,
    demo.summary.ssr,
    demo.summary.icr,
    demo.summary.summaryMdr,
    demo.summary.mir,
    demo.summary.ssa,
  ];

  return (
    <div className="rounded-2xl bg-[#F4F7FA] -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 md:mx-0 md:px-8 md:py-8">
      <h2 className="text-2xl font-semibold tracking-tight text-[#000000] mb-2">
        튜링
      </h2>
      <p className="text-sm text-[#5B6B95] mb-8">
        지표별 우수·보통·미흡 기준은{" "}
        <code className="text-[#0A2465] bg-white/80 px-1 rounded">metricGrades.ts</code>
        에 반영되어 있습니다. Velocity·비율 지표는 API 0~1 스펙 값을 %로 표시합니다 (낮을수록
        좋음).
      </p>

      <section className="mb-10">
        <h3 className="text-sm font-semibold text-[#0A2465] mb-4">Velocity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VelocityGauge
            variant="processing"
            title="Processing Velocity"
            value01={demo.processingVelocity01}
          />
          <VelocityGauge
            variant="stt"
            title="STT Velocity"
            value01={demo.stt.velocityRatio}
          />
          <VelocityGauge
            variant="summarization"
            title="Summarization Velocity"
            value01={demo.summarizationVelocity01}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#0A2465] mb-4">상세 지표</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <HeptagonRadar
            title="STT"
            values={sttRadarValues}
            chartLabels={STT_RADAR_CHART_LABELS}
            listLabels={STT_RADAR_LIST_LABELS}
            tiers={sttTiers}
            rowFormats={STT_ROW_FORMATS}
          />
          <HeptagonRadar
            title="Summary (SOAP)"
            values={summaryRadarValues}
            chartLabels={SUMMARY_RADAR_CHART_LABELS}
            listLabels={SUMMARY_RADAR_LIST_LABELS}
            tiers={summaryTiers}
            rowFormats={SUM_ROW_FORMATS}
          />
        </div>
      </section>
    </div>
  );
}
