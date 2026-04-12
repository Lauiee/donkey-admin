import { useEffect, useMemo, useState } from "react";
import { HeptagonRadar } from "../turing/HeptagonRadar";
import {
  higherRatioToRadius01,
  lowerRatioToRadius01,
  sttVelocityRatioToRadius01,
  summarizationVelocityToRadius01,
  tiersForSttRadar,
} from "../turing/metricGrades";
import {
  STT_RADAR_CHART_LABELS,
  STT_RADAR_LIST_LABELS,
  SUMMARY_RADAR_CHART_LABELS,
  SUMMARY_RADAR_LIST_LABELS,
  TURING_EVALUATIONS_PAGE_SIZE,
} from "../turing/turingConfig";
import { TuringLineChart } from "../turing/TuringLineChart";
import {
  aggregateEvaluationItems,
  tiersForSummaryRadarNullable,
  type TuringDemoState,
} from "../turing/turingAggregate";
import { averageSamples } from "../turing/turingSampleAverages";
import {
  fetchTuringEvaluations,
  hasTuringApiKey,
} from "../turing/turingApi";
import { VelocityGauge } from "../turing/VelocityGauge";

const SAMP = {
  processingVelocity: [
    0.71, 0.73, 0.7, 0.74, 0.72, 0.71, 0.75, 0.72, 0.73, 0.71,
  ],
  summarizationVelocity: [
    0.63, 0.66, 0.64, 0.67, 0.65, 0.64, 0.66, 0.65, 0.64, 0.65,
  ],
  sttVelocityRatio: [
    0.34, 0.36, 0.33, 0.37, 0.35, 0.34, 0.36, 0.35, 0.34, 0.35,
  ],
  uer: [0.07, 0.09, 0.08, 0.08, 0.09, 0.07, 0.08, 0.08, 0.09, 0.08],
  piiProtection: [
    0.91, 0.93, 0.92, 0.92, 0.91, 0.93, 0.92, 0.91, 0.93, 0.92,
  ],
  mmr: [0.11, 0.13, 0.12, 0.12, 0.11, 0.12, 0.13, 0.12, 0.11, 0.12],
  mdr: [0.07, 0.09, 0.08, 0.08, 0.09, 0.07, 0.08, 0.08, 0.09, 0.08],
  diarizationAccuracy: [
    0.81, 0.83, 0.82, 0.82, 0.81, 0.83, 0.82, 0.81, 0.83, 0.82,
  ],
  redundancyRatio: [
    0.03, 0.05, 0.04, 0.04, 0.03, 0.04, 0.05, 0.04, 0.03, 0.04,
  ],
  summaryHallucination: [
    0.11, 0.13, 0.12, 0.12, 0.11, 0.13, 0.12, 0.11, 0.12, 0.12,
  ],
  ssr: [0.74, 0.76, 0.75, 0.75, 0.74, 0.76, 0.75, 0.74, 0.76, 0.75],
  icr: [0.44, 0.46, 0.45, 0.45, 0.44, 0.46, 0.45, 0.44, 0.46, 0.45],
  summaryMdr: [
    0.07, 0.09, 0.08, 0.08, 0.09, 0.07, 0.08, 0.08, 0.09, 0.08,
  ],
  mir: [0.71, 0.73, 0.72, 0.72, 0.71, 0.73, 0.72, 0.71, 0.73, 0.72],
  ssa: [0.77, 0.79, 0.78, 0.78, 0.77, 0.79, 0.78, 0.77, 0.79, 0.78],
} as const;

const PER_CASE_COMPOSITE_FALLBACK = [
  0.44, 0.41, 0.48, 0.45, 0.43, 0.42, 0.46, 0.44, 0.43, 0.45,
];

function buildFallbackDemo(): TuringDemoState {
  return {
    processingVelocity01: averageSamples(SAMP.processingVelocity),
    summarizationVelocity01: averageSamples(SAMP.summarizationVelocity),
    stt: {
      velocityRatio: averageSamples(SAMP.sttVelocityRatio),
      uer: averageSamples(SAMP.uer),
      piiProtection: averageSamples(SAMP.piiProtection),
      mmr: averageSamples(SAMP.mmr),
      mdr: averageSamples(SAMP.mdr),
      diarizationAccuracy: averageSamples(SAMP.diarizationAccuracy),
      redundancyRatio: averageSamples(SAMP.redundancyRatio),
    },
    summary: {
      summarizationVelocity01: averageSamples(SAMP.summarizationVelocity),
      hallucinationRatio: averageSamples(SAMP.summaryHallucination),
      ssr: averageSamples(SAMP.ssr),
      icr: averageSamples(SAMP.icr),
      summaryMdr: averageSamples(SAMP.summaryMdr),
      mir: averageSamples(SAMP.mir),
      ssa: averageSamples(SAMP.ssa),
    },
  };
}

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

function SummarizationVelocitySlot({ value }: { value: number | null }) {
  if (value == null) {
    return (
      <div className="admin-card flex min-h-[260px] flex-col items-center justify-center border-[#E2E8F0] bg-white p-5">
        <span className="mb-2 text-center text-sm font-medium text-[#000000]">
          Summarization Velocity
        </span>
        <p className="text-sm text-[#5B6B95]">요약 지표 미지원</p>
        <p className="mt-2 px-2 text-center text-xs text-[#5B6B95]">
          API <code className="text-[#0A2465]">summary</code> 값이 null일 때
        </p>
      </div>
    );
  }
  return (
    <VelocityGauge
      variant="summarization"
      title="Summarization Velocity"
      value01={value}
    />
  );
}

export function Turing() {
  const [demo, setDemo] = useState<TuringDemoState>(() => buildFallbackDemo());
  const [perCaseComposite, setPerCaseComposite] = useState<number[]>(
    () => PER_CASE_COMPOSITE_FALLBACK
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTuringApiKey()) {
      setDemo(buildFallbackDemo());
      setPerCaseComposite(PER_CASE_COMPOSITE_FALLBACK);
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchTuringEvaluations({
          page: 1,
          size: TURING_EVALUATIONS_PAGE_SIZE,
        });
        if (cancelled) return;
        if (res.items.length === 0) {
          setError("조회된 채점 결과가 없습니다.");
          setDemo(buildFallbackDemo());
          setPerCaseComposite(PER_CASE_COMPOSITE_FALLBACK);
          return;
        }
        const agg = aggregateEvaluationItems(res.items);
        setDemo(agg.demo);
        setPerCaseComposite(agg.perCaseComposite);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "불러오기 실패");
          setDemo(buildFallbackDemo());
          setPerCaseComposite(PER_CASE_COMPOSITE_FALLBACK);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const trendByCase = useMemo(
    () =>
      perCaseComposite.map((value, i) => ({
        label: `${i + 1}`,
        value,
      })),
    [perCaseComposite]
  );

  const sttTiers = tiersForSttRadar({
    sttVelocityRatio: demo.stt.velocityRatio,
    uer: demo.stt.uer,
    piiProtection: demo.stt.piiProtection,
    mmr: demo.stt.mmr,
    mdr: demo.stt.mdr,
    diarizationAccuracy: demo.stt.diarizationAccuracy,
    redundancyRatio: demo.stt.redundancyRatio,
  });

  const summaryTiers = tiersForSummaryRadarNullable({
    hallucinationRatio: demo.summary.hallucinationRatio,
    ssr: demo.summary.ssr,
    icr: demo.summary.icr,
    summaryMdr: demo.summary.summaryMdr,
    mir: demo.summary.mir,
    ssa: demo.summary.ssa,
  });

  /** 표에는 스펙 원시값, 레이더 모양은 ‘우수=바깥’으로 통일 */
  const sttRadarDisplayValues = [
    demo.stt.velocityRatio,
    demo.stt.uer,
    demo.stt.piiProtection,
    demo.stt.mmr,
    demo.stt.mdr,
    demo.stt.diarizationAccuracy,
    demo.stt.redundancyRatio,
  ];
  const sttRadarChartRadii = [
    sttVelocityRatioToRadius01(demo.stt.velocityRatio),
    lowerRatioToRadius01(demo.stt.uer),
    higherRatioToRadius01(demo.stt.piiProtection),
    lowerRatioToRadius01(demo.stt.mmr),
    lowerRatioToRadius01(demo.stt.mdr),
    higherRatioToRadius01(demo.stt.diarizationAccuracy),
    lowerRatioToRadius01(demo.stt.redundancyRatio),
  ];

  const summaryRadarDisplayValues: (number | null)[] = [
    demo.summary.summarizationVelocity01,
    demo.summary.hallucinationRatio,
    demo.summary.ssr,
    demo.summary.icr,
    demo.summary.summaryMdr,
    demo.summary.mir,
    demo.summary.ssa,
  ];
  const summaryRadarChartRadii: (number | null)[] = summaryRadarDisplayValues.map(
    (raw, i) => {
      if (raw === null) return null;
      switch (i) {
        case 0:
          return summarizationVelocityToRadius01(raw);
        case 1:
          return lowerRatioToRadius01(raw);
        case 2:
          return higherRatioToRadius01(raw);
        case 3:
          return lowerRatioToRadius01(raw);
        case 4:
          return lowerRatioToRadius01(raw);
        case 5:
          return higherRatioToRadius01(raw);
        case 6:
          return higherRatioToRadius01(raw);
        default:
          return raw;
      }
    }
  );

  return (
    <div
      className={`rounded-2xl bg-[#F4F7FA] -mx-4 px-4 py-6 sm:-mx-6 sm:px-6 md:mx-0 md:px-8 md:py-8 ${loading ? "opacity-60" : ""}`}
    >
      <header className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[#000000]">
          Turing
        </h2>
      </header>

      {error && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
          {error}
        </div>
      )}

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
          <SummarizationVelocitySlot
            value={demo.summary.summarizationVelocity01}
          />
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold text-[#0A2465] mb-4">상세 지표</h3>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <HeptagonRadar
            title="STT"
            values={sttRadarDisplayValues}
            chartRadii={sttRadarChartRadii}
            chartLabels={STT_RADAR_CHART_LABELS}
            listLabels={STT_RADAR_LIST_LABELS}
            tiers={sttTiers}
            rowFormats={STT_ROW_FORMATS}
          />
          <HeptagonRadar
            title="Summary (SOAP)"
            values={summaryRadarDisplayValues}
            chartRadii={summaryRadarChartRadii}
            chartLabels={SUMMARY_RADAR_CHART_LABELS}
            listLabels={SUMMARY_RADAR_LIST_LABELS}
            tiers={summaryTiers}
            rowFormats={SUM_ROW_FORMATS}
          />
        </div>
      </section>

      <section className="mt-10">
        <h3 className="text-sm font-semibold text-[#0A2465] mb-4">추이</h3>
        <TuringLineChart
          title="종합 품질 (건당)"
          series={trendByCase}
        />
      </section>
    </div>
  );
}
