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
import { TuringMetricsStack, type MetricTrendPoint } from "./TuringMetricCard";
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
import {
  fetchTuringEvaluations,
  hasTuringApiKey,
  type EvaluationListItemApi,
} from "./turingApi";
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

const PER_CASE_COMPOSITE_FALLBACK = [63, 61, 66, 64, 62, 63, 67, 65, 64, 66];

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

type MetricTrendSeriesGroup = {
  stt: MetricTrendPoint[][];
  summary: MetricTrendPoint[][];
};

function formatTrendTimeLabel(iso: string): { short: string; full: string } {
  if (typeof iso === "string" && iso.length >= 16) {
    const m = iso.match(
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/
    );
    if (m) {
      const [, yyyy, MM, DD, HH, mm] = m;
      return {
        short: `${MM}/${DD} ${HH}:${mm}`,
        full: `${yyyy}-${MM}-${DD} ${HH}:${mm}`,
      };
    }
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { short: "--/-- --:--", full: String(iso) };
  }
  const MM = String(d.getMonth() + 1).padStart(2, "0");
  const DD = String(d.getDate()).padStart(2, "0");
  const HH = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return {
    short: `${MM}/${DD} ${HH}:${mm}`,
    full: d.toLocaleString(),
  };
}

function buildMetricTrendSeriesFromItems(
  items: EvaluationListItemApi[]
): MetricTrendSeriesGroup {
  const sorted = [...items].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const sttExtractors: Array<(x: EvaluationListItemApi) => number | null> = [
    (x) => x.metrics.stt.stt_velocity,
    (x) => x.metrics.stt.uer,
    (x) => x.metrics.stt.pii_protection,
    (x) => x.metrics.stt.mmr,
    (x) => x.metrics.stt.mdr,
    (x) => x.metrics.stt.diarization_accuracy,
    (x) => x.metrics.stt.redundancy_ratio,
  ];
  const summaryExtractors: Array<(x: EvaluationListItemApi) => number | null> = [
    (x) => x.metrics.summary.summarization_velocity,
    (x) => x.metrics.summary.hallucination_ratio,
    (x) => x.metrics.summary.ssr,
    (x) => x.metrics.summary.icr,
    (x) => x.metrics.summary.summary_mdr,
    (x) => x.metrics.summary.mir,
    (x) => x.metrics.summary.ssa,
  ];

  const build = (extractors: Array<(x: EvaluationListItemApi) => number | null>) =>
    extractors.map((read) =>
      sorted.flatMap((item, i) => {
        const v = read(item);
        if (v == null || Number.isNaN(v)) return [];
        const t = formatTrendTimeLabel(item.created_at);
        return [{ label: t.short, tooltipLabel: `${t.full} (#${i + 1})`, value: v }];
      })
    );

  return { stt: build(sttExtractors), summary: build(summaryExtractors) };
}

function buildFallbackMetricTrendSeries(): MetricTrendSeriesGroup {
  const now = Date.now();
  const timeLabel = (idx: number) => {
    const d = new Date(now - (9 - idx) * 60 * 60 * 1000);
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const DD = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${MM}/${DD} ${HH}:${mm}`;
  };
  const mapSeries = (vals: readonly number[]): MetricTrendPoint[] =>
    vals.map((value, i) => ({
      label: timeLabel(i),
      tooltipLabel: `Fallback ${timeLabel(i)}`,
      value,
    }));
  return {
    stt: [
      mapSeries(SAMP.sttVelocityRatio),
      mapSeries(SAMP.uer),
      mapSeries(SAMP.piiProtection),
      mapSeries(SAMP.mmr),
      mapSeries(SAMP.mdr),
      mapSeries(SAMP.diarizationAccuracy),
      mapSeries(SAMP.redundancyRatio),
    ],
    summary: [
      mapSeries(SAMP.summarizationVelocity),
      mapSeries(SAMP.summaryHallucination),
      mapSeries(SAMP.ssr),
      mapSeries(SAMP.icr),
      mapSeries(SAMP.summaryMdr),
      mapSeries(SAMP.mir),
      mapSeries(SAMP.ssa),
    ],
  };
}

function buildFallbackTrendTimeLabels(count: number): string[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now - (count - 1 - i) * 60 * 60 * 1000);
    const MM = String(d.getMonth() + 1).padStart(2, "0");
    const DD = String(d.getDate()).padStart(2, "0");
    const HH = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${MM}/${DD} ${HH}:${mm}`;
  });
}

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
  const [trendTimeLabels, setTrendTimeLabels] = useState<string[]>(
    () => buildFallbackTrendTimeLabels(PER_CASE_COMPOSITE_FALLBACK.length)
  );
  const [trendTooltipLabels, setTrendTooltipLabels] = useState<string[]>(
    () => buildFallbackTrendTimeLabels(PER_CASE_COMPOSITE_FALLBACK.length)
  );
  const [sttMetricTrendSeries, setSttMetricTrendSeries] = useState<
    MetricTrendPoint[][]
  >(() => buildFallbackMetricTrendSeries().stt);
  const [summaryMetricTrendSeries, setSummaryMetricTrendSeries] = useState<
    MetricTrendPoint[][]
  >(() => buildFallbackMetricTrendSeries().summary);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasTuringApiKey()) {
      setDemo(buildFallbackDemo());
      setPerCaseComposite(PER_CASE_COMPOSITE_FALLBACK);
      const fallbackTimes = buildFallbackTrendTimeLabels(
        PER_CASE_COMPOSITE_FALLBACK.length
      );
      setTrendTimeLabels(fallbackTimes);
      setTrendTooltipLabels(fallbackTimes.map((x) => `Fallback ${x}`));
      const fallback = buildFallbackMetricTrendSeries();
      setSttMetricTrendSeries(fallback.stt);
      setSummaryMetricTrendSeries(fallback.summary);
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
          const fallbackTimes = buildFallbackTrendTimeLabels(
            PER_CASE_COMPOSITE_FALLBACK.length
          );
          setTrendTimeLabels(fallbackTimes);
          setTrendTooltipLabels(fallbackTimes.map((x) => `Fallback ${x}`));
          const fallback = buildFallbackMetricTrendSeries();
          setSttMetricTrendSeries(fallback.stt);
          setSummaryMetricTrendSeries(fallback.summary);
          return;
        }
        const agg = aggregateEvaluationItems(res.items);
        setDemo(agg.demo);
        setPerCaseComposite(agg.perCaseComposite);
        const sorted = [...res.items].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const labels = sorted.map((x) => formatTrendTimeLabel(x.created_at).short);
        const tips = sorted.map((x) => formatTrendTimeLabel(x.created_at).full);
        setTrendTimeLabels(labels);
        setTrendTooltipLabels(tips);
        const trendSeries = buildMetricTrendSeriesFromItems(res.items);
        setSttMetricTrendSeries(trendSeries.stt);
        setSummaryMetricTrendSeries(trendSeries.summary);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "불러오기 실패");
          setDemo(buildFallbackDemo());
          setPerCaseComposite(PER_CASE_COMPOSITE_FALLBACK);
          const fallbackTimes = buildFallbackTrendTimeLabels(
            PER_CASE_COMPOSITE_FALLBACK.length
          );
          setTrendTimeLabels(fallbackTimes);
          setTrendTooltipLabels(fallbackTimes.map((x) => `Fallback ${x}`));
          const fallback = buildFallbackMetricTrendSeries();
          setSttMetricTrendSeries(fallback.stt);
          setSummaryMetricTrendSeries(fallback.summary);
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
        label: trendTimeLabels[i] ?? `${i + 1}`,
        tooltipLabel: trendTooltipLabels[i],
        value,
      })),
    [perCaseComposite, trendTimeLabels, trendTooltipLabels]
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

  // Detailed Metrics에서는 Velocity 섹션과 중복되는 속도 지표(첫 항목)를 제외한다.
  const sttDetailChartLabels = STT_RADAR_CHART_LABELS.slice(1);
  const sttDetailListLabels = STT_RADAR_LIST_LABELS.slice(1);
  const sttDetailDescriptions = STT_METRIC_DESCRIPTIONS.slice(1);
  const sttDetailSlugs = STT_METRIC_SLUGS.slice(1);
  const sttDetailValues = sttRadarDisplayValues.slice(1);
  const sttDetailRadii = sttRadarChartRadii.slice(1);
  const sttDetailTiers = sttTiers.slice(1);
  const sttDetailRowFormats = STT_ROW_FORMATS.slice(1);
  const sttDetailTrendSeries = sttMetricTrendSeries.slice(1);

  const summaryDetailChartLabels = SUMMARY_RADAR_CHART_LABELS.slice(1);
  const summaryDetailListLabels = SUMMARY_RADAR_LIST_LABELS.slice(1);
  const summaryDetailDescriptions = SUMMARY_METRIC_DESCRIPTIONS.slice(1);
  const summaryDetailSlugs = SUMMARY_METRIC_SLUGS.slice(1);
  const summaryDetailValues = summaryRadarDisplayValues.slice(1);
  const summaryDetailRadii = summaryRadarChartRadii.slice(1);
  const summaryDetailTiers = summaryTiers.slice(1);
  const summaryDetailRowFormats = SUM_ROW_FORMATS.slice(1);
  const summaryDetailTrendSeries = summaryMetricTrendSeries.slice(1);

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
              values={sttDetailValues}
              chartRadii={sttDetailRadii}
              chartLabels={sttDetailChartLabels}
              listLabels={sttDetailListLabels}
              metricDescriptions={sttDetailDescriptions}
              tiers={sttDetailTiers}
              rowFormats={sttDetailRowFormats}
            />
            <HeptagonRadar
              title="Summary (SOAP)"
              values={summaryDetailValues}
              chartRadii={summaryDetailRadii}
              chartLabels={summaryDetailChartLabels}
              listLabels={summaryDetailListLabels}
              metricDescriptions={summaryDetailDescriptions}
              tiers={summaryDetailTiers}
              rowFormats={summaryDetailRowFormats}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <TuringMetricsStack
              heading="STT"
              metaPrefix="STT"
              slugs={sttDetailSlugs}
              listLabels={sttDetailListLabels}
              descriptions={sttDetailDescriptions}
              legendSource="stt"
              values={sttDetailValues}
              tiers={sttDetailTiers}
              rowFormats={sttDetailRowFormats}
              trendSeriesByMetric={sttDetailTrendSeries}
            />
            <TuringMetricsStack
              heading="Summary (SOAP)"
              metaPrefix="SUMMARY"
              slugs={summaryDetailSlugs}
              listLabels={summaryDetailListLabels}
              descriptions={summaryDetailDescriptions}
              legendSource="summary"
              values={summaryDetailValues}
              tiers={summaryDetailTiers}
              rowFormats={summaryDetailRowFormats}
              trendSeriesByMetric={summaryDetailTrendSeries}
            />
          </div>
        )}
      </section>

      <section className="mt-10">
        <TuringSectionTitle title="Trend" />
        <TuringLineChart
          title="Health Score Trend"
          series={trendByCase}
        />
      </section>
    </div>
  );
}
