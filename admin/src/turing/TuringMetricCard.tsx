import { useState } from "react";
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
export type MetricTrendPoint = {
  label: string;
  value: number;
  tooltipLabel?: string;
};

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

function InlineMetricTrendChart({
  series,
  rowFormat,
}: {
  series: MetricTrendPoint[];
  rowFormat: RowFormat;
}) {
  if (series.length < 2) {
    return (
      <div className="rounded-lg border border-brand-line/50 bg-brand-surface/40 px-3 py-2 text-[11px] text-brand-slate/70">
        시계열 데이터가 부족합니다.
      </div>
    );
  }

  const w = 520;
  const h = 150;
  const pad = { left: 28, right: 16, top: 12, bottom: 28 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const vals = series.map((p) => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const isPercentScale = rowFormat === "percent" || rowFormat === "invertedPercent";
  const yPad = (max - min) * 0.15 || 0.04;
  const lo = isPercentScale ? 0 : min - yPad;
  const hi = isPercentScale ? 1 : max + yPad;
  const range = hi - lo || 1;
  const xAt = (i: number) =>
    pad.left + (innerW * (series.length <= 1 ? 0.5 : i / (series.length - 1)));
  const yAt = (v: number) => pad.top + innerH * (1 - (v - lo) / range);

  const linePath = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.value).toFixed(1)}`)
    .join(" ");

  const yTicks = 4;
  const yVals = Array.from(
    { length: yTicks + 1 },
    (_, i) => lo + ((hi - lo) * i) / yTicks
  );

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const hovered = hoveredIndex == null ? null : series[hoveredIndex];
  const hx = hoveredIndex == null ? 0 : xAt(hoveredIndex);
  const hy = hoveredIndex == null ? 0 : yAt(series[hoveredIndex].value);
  const tipW = 160;
  const tipH = 52;
  const tipX = Math.min(w - pad.right - tipW, Math.max(pad.left, hx - tipW / 2));
  const tipY = Math.max(6, hy - tipH - 10);

  return (
    <div className="rounded-lg border border-brand-line/50 bg-brand-surface/35 px-2.5 py-2">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="block h-[138px] w-full"
        preserveAspectRatio="none"
        aria-label="지표 시계열 추이"
      >
        {yVals.map((yv, i) => {
          const y = yAt(yv);
          return (
            <g key={`y-${i}`}>
              <line
                x1={pad.left}
                y1={y}
                x2={w - pad.right}
                y2={y}
                stroke={TURING_PALETTE.secondary.slateBlue}
                strokeOpacity={0.18}
                strokeWidth={1}
              />
              <text
                x={pad.left - 6}
                y={y + 3}
                textAnchor="end"
                fill={TURING_PALETTE.secondary.slateBlue}
                style={{ fontSize: 10 }}
              >
                {isPercentScale ? `${Math.round(yv * 100)}` : yv.toFixed(2)}
              </text>
            </g>
          );
        })}
        <path
          d={linePath}
          fill="none"
          stroke={TURING_PALETTE.secondary.navy}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hovered ? (
          <line
            x1={hx}
            y1={pad.top}
            x2={hx}
            y2={pad.top + innerH}
            stroke={TURING_PALETTE.secondary.slateBlue}
            strokeOpacity={0.28}
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        ) : null}
        {series.map((p, i) => (
          <g key={`${p.label}-${i}`}>
            <circle
              cx={xAt(i)}
              cy={yAt(p.value)}
              r={11}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() =>
                setHoveredIndex((prev) => (prev === i ? null : prev))
              }
            />
            <circle
              cx={xAt(i)}
              cy={yAt(p.value)}
              r={hoveredIndex === i ? 6 : 4.5}
              fill={TURING_PALETTE.base.white}
              stroke={TURING_PALETTE.accent}
              strokeWidth={hoveredIndex === i ? 2.8 : 2}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() =>
                setHoveredIndex((prev) => (prev === i ? null : prev))
              }
            >
              <title>
                {`${p.tooltipLabel ?? p.label}\n값: ${
                  isPercentScale ? `${(p.value * 100).toFixed(1)}%` : p.value.toFixed(4)
                }`}
              </title>
            </circle>
          </g>
        ))}
        {hovered ? (
          <g style={{ pointerEvents: "none" }}>
            <rect
              x={tipX}
              y={tipY}
              width={tipW}
              height={tipH}
              rx={10}
              fill="#FFFFFF"
              stroke="#D9E1EF"
              strokeOpacity={0.95}
              filter="drop-shadow(0px 7px 16px rgba(10,36,101,0.12))"
            />
            <text
              x={tipX + 10}
              y={tipY + 16}
              fill={TURING_PALETTE.secondary.navy}
              style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 0.25 }}
            >
              VALUE
            </text>
            <text
              x={tipX + 10}
              y={tipY + 32}
              fill={TURING_PALETTE.secondary.navy}
              style={{ fontSize: 12.5, fontWeight: 700 }}
            >
              {`${
                isPercentScale
                  ? `${(hovered.value * 100).toFixed(1)}%`
                  : hovered.value.toFixed(4)
              }`}
            </text>
            <text
              x={tipX + 10}
              y={tipY + 46}
              fill="#5D6F95"
              style={{ fontSize: 9.5 }}
            >
              {hovered.tooltipLabel ?? hovered.label}
            </text>
          </g>
        ) : null}
        {series.map((point, idx) => (
          <text
            key={`x-${idx}-${point.label}`}
            x={xAt(idx)}
            y={h - 6}
            textAnchor="middle"
            fill={TURING_PALETTE.secondary.slateBlue}
            style={{ fontSize: 9 }}
          >
            {point.label}
          </text>
        ))}
      </svg>
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
  trendSeries,
  expanded,
  onToggleExpand,
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
  trendSeries: MetricTrendPoint[];
  expanded: boolean;
  onToggleExpand: () => void;
}) {
  const hint = directionHint(rowFormat);
  const showGauge = !unsupported && thumbPosition01 !== null;

  return (
    <div
      className="admin-card flex cursor-pointer flex-col gap-2.5 p-4 transition-colors hover:bg-brand-surface/20 sm:p-4"
      role="button"
      tabIndex={0}
      onClick={onToggleExpand}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggleExpand();
        }
      }}
      aria-expanded={expanded}
    >
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
      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? "max-h-[240px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pt-1">
          <InlineMetricTrendChart series={trendSeries} rowFormat={rowFormat} />
        </div>
      </div>
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
  trendSeriesByMetric,
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
  trendSeriesByMetric?: MetricTrendPoint[][];
}) {
  const n = slugs.length;
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
                trendSeries={trendSeriesByMetric?.[i] ?? []}
                expanded={expandedIndex === i}
                onToggleExpand={() =>
                  setExpandedIndex((prev) => (prev === i ? null : i))
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
