import {
  TIER_LABEL,
  type MetricTier,
  sttMetricThresholdLegendRows,
  summaryMetricThresholdLegendRows,
} from "./metricGrades";
import { TierBadge } from "./TierBadge";
import {
  gaugeTrackCssBackground,
  TURING_GAUGE_THUMB_LINE,
  turingGaugeTierFill,
  type TuringGaugeRowFormat,
} from "./turingGaugeTheme";
import { formatMetricValue } from "./turingFormat";
import { TURING_PALETTE } from "./turingPalette";

const GAUGE_THUMB_LINE_DEEP = "#4a7d5e";

type RowFormat = TuringGaugeRowFormat;

/** 막대 thumb — 원시 비율 0~1을 좌→우에 선형 대응 (레이더 chartRadii 의 ‘좋음 방향’과 별개) */
function rawRatioToThumb01(raw: number | null): number | null {
  if (raw === null) return null;
  if (!Number.isFinite(raw)) return null;
  return Math.min(1, Math.max(0, raw));
}

function directionHint(format: RowFormat): { arrow: string; text: string } {
  if (format === "invertedPercent") {
    return { arrow: "↓", text: "낮을수록 우수" };
  }
  return { arrow: "↑", text: "높을수록 우수" };
}

function NeutralBadge({ children }: { children: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-tight text-brand-slate/85 ring-1 ring-brand-line/70"
      style={{ backgroundColor: `${TURING_PALETTE.base.coolGray}` }}
    >
      {children}
    </span>
  );
}

function MetricThresholdLegend({
  rows,
}: {
  rows: Array<{ tier: MetricTier; condition: string }>;
}) {
  return (
    <div className="border-t border-b border-brand-line/40 py-2">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 sm:gap-x-6">
        {rows.map((row) => (
          <div
            key={`${row.tier}-${row.condition}`}
            className="flex min-w-0 items-center gap-1.5"
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/90"
              style={{ backgroundColor: turingGaugeTierFill(row.tier) }}
              aria-hidden
            />
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none text-brand-navy ring-1 ring-white/70"
              style={{ backgroundColor: `${turingGaugeTierFill(row.tier)}33` }}
            >
              {TIER_LABEL[row.tier]}
            </span>
            <span className="text-[10px] font-medium tabular-nums text-brand-navy">
              {row.condition}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TuringMetricCard({
  groupMeta,
  metricSlug,
  title,
  description,
  tier,
  displayValue,
  thumbPosition01,
  rowFormat,
  thresholdLegendRows,
  unsupported,
}: {
  groupMeta: string;
  metricSlug: string;
  title: string;
  description: string;
  tier: MetricTier | "neutral";
  displayValue: string;
  /** 원시 비율 0~1 — 막대에서 0=좌, 1=우 */
  thumbPosition01: number | null;
  rowFormat: RowFormat;
  thresholdLegendRows: Array<{ tier: MetricTier; condition: string }>;
  unsupported: boolean;
}) {
  const hint = directionHint(rowFormat);
  const showGauge = !unsupported && thumbPosition01 !== null;

  return (
    <div className="admin-card flex flex-col gap-2.5 p-4 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-brand-slate/55">
          {groupMeta} · {metricSlug}
        </p>
        <div className="shrink-0">
          {unsupported ? (
            <NeutralBadge>미지원</NeutralBadge>
          ) : tier === "neutral" ? (
            <NeutralBadge>—</NeutralBadge>
          ) : (
            <TierBadge tier={tier} palette="turing" />
          )}
        </div>
      </div>

      <div className="min-w-0 space-y-1">
        <h4 className="text-sm font-semibold leading-snug text-brand-navy">{title}</h4>
        <p className="line-clamp-2 text-[11px] leading-snug text-brand-slate/80">
          {description}
        </p>
      </div>

      <div>
        <p
          className={`text-[1.5rem] font-semibold leading-none tracking-tight tabular-nums sm:text-[1.625rem] ${
            unsupported ? "text-brand-slate/45" : "text-brand-navy"
          }`}
        >
          {displayValue}
        </p>
      </div>

      {unsupported ? (
        <p className="rounded-lg bg-brand-surface/80 px-2.5 py-1.5 text-[10px] leading-snug text-brand-slate/70 ring-1 ring-brand-line/50">
          이 지표는 현재 평균 데이터에 포함되지 않습니다.
        </p>
      ) : (
        <div className="space-y-1">
          {/* 트랙에 overflow-hidden 을 쓰면 알약 thumb 가 세로로 잘림 */}
          <div className="relative py-1">
            <div
              className="relative h-2 w-full rounded-full ring-1 ring-black/[0.08]"
              style={{ background: gaugeTrackCssBackground(rowFormat) }}
            >
              {showGauge ? (
                <span
                  className="pointer-events-none absolute top-1/2 z-10 flex h-[16px] w-[9px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
                  style={{
                    left: `${Math.min(100, Math.max(0, (thumbPosition01 ?? 0) * 100))}%`,
                    background:
                      "linear-gradient(180deg, #fefffe 0%, #f4f7f6 38%, #e9efed 100%)",
                    border: "1px solid rgba(94, 158, 122, 0.28)",
                    boxShadow: `
                      0 1px 0 rgba(255, 255, 255, 0.88) inset,
                      0 3px 14px -2px rgba(10, 36, 101, 0.09),
                      0 1px 2px rgba(0, 0, 0, 0.04)
                    `,
                  }}
                >
                  <span
                    className="h-[9px] w-px shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(180deg, ${TURING_GAUGE_THUMB_LINE} 0%, ${GAUGE_THUMB_LINE_DEEP} 100%)`,
                      boxShadow: "0 0 0 0.5px rgba(255,255,255,0.45) inset",
                    }}
                    aria-hidden
                  />
                </span>
              ) : null}
            </div>
          </div>
          <div
            className="flex items-center justify-between gap-2 text-[9px] font-medium tabular-nums text-brand-slate/55"
            aria-label="스케일 0에서 100까지(원시 비율을 퍼센트로 볼 때와 대응)"
          >
            <span>0</span>
            <span className="text-center text-brand-slate/65">
              {hint.arrow} {hint.text}
            </span>
            <span>100</span>
          </div>
        </div>
      )}

      <MetricThresholdLegend rows={thresholdLegendRows} />
    </div>
  );
}

export function TuringMetricsStack({
  heading,
  metaPrefix,
  countLabel,
  slugs,
  listLabels,
  descriptions,
  legendSource,
  values,
  tiers,
  rowFormats,
  secondsValues,
}: {
  heading: string;
  metaPrefix: string;
  countLabel?: string;
  slugs: readonly string[];
  listLabels: readonly string[];
  descriptions: readonly string[];
  legendSource: "stt" | "summary";
  values: (number | null)[];
  tiers: Array<MetricTier | "neutral">;
  rowFormats: RowFormat[];
  secondsValues?: Array<number | undefined>;
}) {
  const n = slugs.length;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2 border-b border-brand-line/45 pb-2">
        <h3 className="text-sm font-semibold tracking-tight text-brand-navy">
          {heading}
        </h3>
        <span className="text-[11px] font-medium tabular-nums text-brand-slate/65">
          {countLabel ?? `${n}개 지표`}
        </span>
      </div>
      <ul className="m-0 flex list-none flex-col gap-3 p-0">
        {Array.from({ length: n }, (_, i) => {
          const raw = values[i];
          const unsupported = raw === null;
          const fmt = rowFormats[i] ?? "percent";
          const rawSec = secondsValues?.[i];
          const display = formatMetricValue(raw, fmt, rawSec);
          const thumbPosition01 = rawRatioToThumb01(raw);
          const thresholdLegendRows =
            legendSource === "stt"
              ? sttMetricThresholdLegendRows(i)
              : summaryMetricThresholdLegendRows(i);
          return (
            <li key={`${slugs[i]}-${i}`}>
              <TuringMetricCard
                groupMeta={metaPrefix}
                metricSlug={slugs[i] ?? ""}
                title={listLabels[i] ?? ""}
                description={descriptions[i] ?? ""}
                tier={tiers[i] ?? "neutral"}
                displayValue={display}
                thumbPosition01={thumbPosition01}
                rowFormat={fmt}
                thresholdLegendRows={thresholdLegendRows}
                unsupported={unsupported}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
