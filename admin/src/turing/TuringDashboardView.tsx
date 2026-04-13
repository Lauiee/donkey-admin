import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { HeptagonRadar } from "./HeptagonRadar";
import {
  higherRatioToRadius01,
  lowerRatioToRadius01,
  sttVelocityRatioToRadius01,
  summarizationVelocityToRadius01,
  tiersForSttRadar,
} from "./metricGrades";
import { TuringMetricsStack } from "./TuringMetricCard";
import {
  STT_METRIC_DESCRIPTIONS,
  STT_METRIC_SLUGS,
  STT_RADAR_CHART_LABELS,
  STT_RADAR_LIST_LABELS,
  SUMMARY_METRIC_DESCRIPTIONS,
  SUMMARY_METRIC_SLUGS,
  SUMMARY_RADAR_CHART_LABELS,
  SUMMARY_RADAR_LIST_LABELS,
  TURING_EVALUATIONS_PAGE_SIZE,
  VELOCITY_METRIC_DESCRIPTIONS,
} from "./turingConfig";
import { TuringLineChart } from "./TuringLineChart";
import {
  aggregateEvaluationItems,
  tiersForSummaryRadarNullable,
  type TuringDemoState,
} from "./turingAggregate";
import { averageSamples } from "./turingSampleAverages";
import { fetchTuringEvaluations, hasTuringApiKey } from "./turingApi";
import { TuringHoverDescription } from "./TuringHoverDescription";
import { VelocityGauge } from "./VelocityGauge";
import { TURING_GAUGE_THUMB_LINE } from "./turingGaugeTheme";

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

const STT_ROW_FORMATS: Array<"percent" | "seconds" | "invertedPercent"> = [
  "invertedPercent",
  "invertedPercent",
  "percent",
  "invertedPercent",
  "invertedPercent",
  "percent",
  "invertedPercent",
];

const SUM_ROW_FORMATS: Array<"percent" | "seconds" | "invertedPercent"> = [
  "invertedPercent",
  "invertedPercent",
  "percent",
  "invertedPercent",
  "invertedPercent",
  "percent",
  "percent",
];

function SummarizationVelocitySlot({ value }: { value: number | null }) {
  if (value == null) {
    return (
      <div className="admin-card flex min-h-[260px] flex-col items-center justify-center p-5">
        <div className="mb-2 text-center text-sm font-medium text-brand-ink">
          <TuringHoverDescription
            label="Summarization Velocity"
            description={VELOCITY_METRIC_DESCRIPTIONS.summarization}
          />
        </div>
        <p className="text-sm text-brand-slate">요약 지표 미지원</p>
        <p className="mt-2 px-2 text-center text-xs text-brand-slate">
          API <code className="text-brand-navy">summary</code> 값이 null일 때
        </p>
      </div>
    );
  }
  return (
    <VelocityGauge
      variant="summarization"
      title="Summarization Velocity"
      metricDescription={VELOCITY_METRIC_DESCRIPTIONS.summarization}
      value01={value}
    />
  );
}

export type TuringDashboardViewProps = {
  /** 상단 PageHeader 제목 — 실험 페이지에서만 바꿔 쓰기 */
  pageTitle?: string;
  /** 상단 PageHeader 부제 */
  pageSubtitle?: string;
  /**
   * 상세 지표 영역 — `/turing` 은 레이더, `/turing-lab` 은 카드 그리드.
   * @default "radar"
   */
  detailLayout?: "radar" | "cards";
};

const DEFAULT_TITLE = "Turing";
const DEFAULT_SUBTITLE =
  "STT·요약 채점 지표와 최근 평가 추이를 확인합니다.";

function TuringSectionTitle({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <span
        className="h-[1.1rem] w-[2px] shrink-0 rounded-full ring-1 ring-white/80"
        style={{ backgroundColor: TURING_GAUGE_THUMB_LINE }}
        aria-hidden
      />
      <h3 className="text-sm font-semibold uppercase leading-none tracking-[0.08em] text-brand-navy/85">
        {title}
      </h3>
    </div>
  );
}

/**
 * Turing 대시보드 본문 — `/turing` 과 `/turing-lab` 에서 공용.
 * Lab 전용 UI는 `detailLayout="cards"` 로 분리 (`TuringLab.tsx`).
 */
export function TuringDashboardView({
  pageTitle = DEFAULT_TITLE,
  pageSubtitle = DEFAULT_SUBTITLE,
  detailLayout = "radar",
}: TuringDashboardViewProps) {
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
    summarizationVelocity01: demo.summary.summarizationVelocity01,
    hallucinationRatio: demo.summary.hallucinationRatio,
    ssr: demo.summary.ssr,
    icr: demo.summary.icr,
    summaryMdr: demo.summary.summaryMdr,
    mir: demo.summary.mir,
    ssa: demo.summary.ssa,
  });

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
    <div className={loading ? "opacity-60" : ""}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {error && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-sm text-amber-900">
          {error}
        </div>
      )}

      <section className="mb-10">
        <TuringSectionTitle title="Velocity" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <VelocityGauge
            variant="processing"
            title="Processing Velocity"
            metricDescription={VELOCITY_METRIC_DESCRIPTIONS.processing}
            value01={demo.processingVelocity01}
          />
          <VelocityGauge
            variant="stt"
            title="STT Velocity"
            metricDescription={VELOCITY_METRIC_DESCRIPTIONS.stt}
            value01={demo.stt.velocityRatio}
          />
          <SummarizationVelocitySlot value={demo.summary.summarizationVelocity01} />
        </div>
      </section>

      <section>
        <TuringSectionTitle title="Detailed Metrics" />
        {detailLayout === "radar" ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <HeptagonRadar
              title="STT"
              values={sttRadarDisplayValues}
              chartRadii={sttRadarChartRadii}
              chartLabels={STT_RADAR_CHART_LABELS}
              listLabels={STT_RADAR_LIST_LABELS}
              metricDescriptions={STT_METRIC_DESCRIPTIONS}
              tiers={sttTiers}
              rowFormats={STT_ROW_FORMATS}
            />
            <HeptagonRadar
              title="Summary (SOAP)"
              values={summaryRadarDisplayValues}
              chartRadii={summaryRadarChartRadii}
              chartLabels={SUMMARY_RADAR_CHART_LABELS}
              listLabels={SUMMARY_RADAR_LIST_LABELS}
              metricDescriptions={SUMMARY_METRIC_DESCRIPTIONS}
              tiers={summaryTiers}
              rowFormats={SUM_ROW_FORMATS}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TuringMetricsStack
              heading="STT"
              metaPrefix="STT"
              slugs={STT_METRIC_SLUGS}
              listLabels={STT_RADAR_LIST_LABELS}
              descriptions={STT_METRIC_DESCRIPTIONS}
              legendSource="stt"
              values={sttRadarDisplayValues}
              tiers={sttTiers}
              rowFormats={STT_ROW_FORMATS}
            />
            <TuringMetricsStack
              heading="Summary (SOAP)"
              metaPrefix="SUMMARY"
              slugs={SUMMARY_METRIC_SLUGS}
              listLabels={SUMMARY_RADAR_LIST_LABELS}
              descriptions={SUMMARY_METRIC_DESCRIPTIONS}
              legendSource="summary"
              values={summaryRadarDisplayValues}
              tiers={summaryTiers}
              rowFormats={SUM_ROW_FORMATS}
            />
          </div>
        )}
      </section>

      <section className="mt-10">
        <TuringSectionTitle title="Trend" />
        <TuringLineChart
          title="Overall Quality (per request)"
          series={trendByCase}
        />
      </section>
    </div>
  );
}
