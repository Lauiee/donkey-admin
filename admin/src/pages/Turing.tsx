import { useState } from "react";
import { HeptagonRadar } from "../turing/HeptagonRadar";
import {
  sttVelocitySecToRadius01,
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

/** API 연동 전 데모 — 속도(일부)는 초·0~1 혼합 */
const DEMO = {
  processingVelocity01: 0.72,
  summarizationVelocity01: 0.65,
  stt: {
    velocitySec: 8.5,
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
  "seconds",
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
    sttVelocitySec: demo.stt.velocitySec,
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
    sttVelocitySecToRadius01(demo.stt.velocitySec),
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

  const sttSecondsRow = [
    demo.stt.velocitySec,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
  ];

  return (
    <div>
      <h2 className="admin-page-title mb-2">튜링</h2>
      <p className="text-sm text-slate-500 mb-8">
        지표별 우수·보통·미흡 기준은{" "}
        <code className="text-slate-700">metricGrades.ts</code>에 반영되어 있습니다.
        비율 지표는 API 0~1 값을 %로 표시하고, STT 속도는 초 단위로 표시합니다.
      </p>

      <section className="mb-10">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Velocity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <VelocityGauge
            variant="neutral"
            title="Processing Velocity"
            value01={demo.processingVelocity01}
          />
          <VelocityGauge
            variant="stt"
            title="STT Velocity"
            seconds={demo.stt.velocitySec}
          />
          <VelocityGauge
            variant="neutral"
            title="Summarization Velocity"
            value01={demo.summarizationVelocity01}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">상세 지표</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <HeptagonRadar
            title="STT"
            values={sttRadarValues}
            chartLabels={STT_RADAR_CHART_LABELS}
            listLabels={STT_RADAR_LIST_LABELS}
            tiers={sttTiers}
            rowFormats={STT_ROW_FORMATS}
            secondsValues={sttSecondsRow}
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
