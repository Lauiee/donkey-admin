import { useId, useRef, useState } from "react";
import { type MetricTier, velocityRawToDisplayScorePct } from "./metricGrades";
import { TierBadge } from "./TierBadge";
import {
  DescriptionTooltipPortal,
  TuringHoverDescription,
} from "./TuringHoverDescription";
import { TURING_PALETTE, turingTierDotFill } from "./turingPalette";

type Props = {
  title: string;
  /** 하단 표·툴팁용 원시 지표(스펙 값). % 행은 이 값을 그대로 포맷 */
  values: (number | null)[];
  /**
   * 차트 다각형·점 위치만 — 0~1, 클수록 바깥(우수 방향 통일).
   * 생략 시 values 로 그림(하위 호환).
   */
  chartRadii?: (number | null)[];
  chartLabels: readonly string[];
  listLabels: readonly string[];
  /** listLabels 와 동일 길이 — 호버 시 지표 설명 (브라우저 툴팁) */
  metricDescriptions?: readonly string[];
  /** 각 꼭지 등급 — 값 미지원(null) 축만 neutral */
  tiers: Array<MetricTier | "neutral">;
  /** 하단 수치 표시 — 초, 원시 %, 또는 Velocity용 (100 − 원시%) 점수 */
  rowFormats?: Array<"percent" | "seconds" | "invertedPercent">;
  /** rowFormats 가 seconds 일 때의 원시 초 값 (STT 속도 축 등) */
  secondsValues?: Array<number | undefined>;
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

const N = 7;

function angleAt(i: number): number {
  return -Math.PI / 2 + (2 * Math.PI * i) / N;
}

function formatPercent(v: number): string {
  return `${Math.round(clamp01(v) * 1000) / 10}%`;
}

function formatInvertedPercent(v: number): string {
  return `${velocityRawToDisplayScorePct(v)}%`;
}

export function HeptagonRadar({
  title,
  values,
  chartRadii,
  chartLabels,
  listLabels,
  metricDescriptions,
  tiers,
  rowFormats,
  secondsValues,
}: Props) {
  const gradId = useId().replace(/:/g, "");
  const radarAnchorRef = useRef<SVGGElement | null>(null);
  const [radarTipOpen, setRadarTipOpen] = useState(false);
  const [radarTipText, setRadarTipText] = useState("");
  const pts = Array.from({ length: N }, (_, i) =>
    clamp01((chartRadii ?? values)[i] ?? 0)
  );

  const size = 300;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 100;
  const labelR = maxR * 1.26;

  const vertex = (i: number, radius: number) => {
    const a = angleAt(i);
    return {
      x: cx + radius * Math.cos(a),
      y: cy + radius * Math.sin(a),
    };
  };

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  const dataPoly = pts
    .map((v, i) => {
      const p = vertex(i, maxR * v);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  const outerPoly = Array.from({ length: N }, (_, i) => {
    const p = vertex(i, maxR);
    return `${p.x},${p.y}`;
  }).join(" ");

  const fmt = rowFormats ?? Array(N).fill("percent" as const);

  return (
    <div className="admin-card p-5">
      <h3 className="text-sm font-semibold text-brand-navy text-center mb-4">
        {title}
      </h3>
      <div className="flex justify-center overflow-x-auto">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[340px] h-auto"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id={`rf-${gradId}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={TURING_PALETTE.secondary.mintBlue} stopOpacity="0.35" />
              <stop offset="100%" stopColor={TURING_PALETTE.secondary.navy} stopOpacity="0.22" />
            </linearGradient>
          </defs>

          {gridLevels.map((lv) => (
            <polygon
              key={lv}
              points={Array.from({ length: N }, (_, i) => {
                const p = vertex(i, maxR * lv);
                return `${p.x},${p.y}`;
              }).join(" ")}
              fill="none"
              stroke={TURING_PALETTE.secondary.slateBlue}
              strokeOpacity={lv === 1 ? 0.22 : 0.14}
              strokeWidth={lv === 1 ? 1.5 : 1}
            />
          ))}

          <polygon
            points={outerPoly}
            fill="none"
            stroke={TURING_PALETTE.secondary.slateBlue}
            opacity={0.45}
            strokeWidth={1.5}
          />

          <polygon
            points={dataPoly}
            fill={`url(#rf-${gradId})`}
            stroke={TURING_PALETTE.secondary.navy}
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {pts.map((v, i) => {
            const p = vertex(i, maxR * v);
            const fill = turingTierDotFill(tiers[i] ?? "neutral");
            return (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={fill}
                stroke="#fff"
                strokeWidth={1.5}
              />
            );
          })}

          {chartLabels.map((label, i) => {
            const p = vertex(i, labelR);
            const full = listLabels[i] ?? label;
            const desc = metricDescriptions?.[i];
            return (
              <g
                key={i}
                style={{ cursor: desc ? "help" : "default" }}
                onMouseEnter={(e) => {
                  if (!desc) return;
                  radarAnchorRef.current = e.currentTarget;
                  setRadarTipText(desc);
                  setRadarTipOpen(true);
                }}
                onMouseLeave={() => {
                  setRadarTipOpen(false);
                  radarAnchorRef.current = null;
                }}
              >
                {desc ? (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={24}
                    fill="transparent"
                    stroke="none"
                  />
                ) : null}
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  pointerEvents="none"
                  fill={TURING_PALETTE.secondary.slateBlue}
                  style={{ fontSize: 10 }}
                >
                  <title>{full}</title>
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <DescriptionTooltipPortal
        open={radarTipOpen}
        anchorRef={radarAnchorRef}
        description={radarTipText}
        onDismiss={() => {
          setRadarTipOpen(false);
          radarAnchorRef.current = null;
        }}
      />

      <ul className="mt-4 space-y-2.5 text-xs text-brand-slate list-none p-0 m-0">
        {Array.from({ length: N }, (_, i) => {
          const label = listLabels[i] ?? "";
          const desc = metricDescriptions?.[i];
          const tier = tiers[i] ?? "neutral";
          const rawSec = secondsValues?.[i];
          const val = values[i];
          const display =
            val === null
              ? "—"
              : fmt[i] === "seconds" && rawSec != null
                ? `${rawSec < 100 ? rawSec.toFixed(1) : rawSec.toFixed(0)}초`
                : fmt[i] === "invertedPercent"
                  ? formatInvertedPercent(val)
                  : formatPercent(val);

          return (
            <li key={`${label}-${i}`}>
              <div className="flex items-center justify-between gap-3 min-h-[1.75rem] tabular-nums">
                <span className="min-w-0 flex-1">
                  {desc ? (
                    <TuringHoverDescription label={label} description={desc} />
                  ) : (
                    <span className="truncate">{label}</span>
                  )}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {val === null ? (
                    <span className="text-[10px] font-medium text-brand-slate shrink-0">
                      미지원
                    </span>
                  ) : tier === "neutral" ? (
                    <span className="text-[10px] font-medium text-brand-slate shrink-0">
                      —
                    </span>
                  ) : (
                    <TierBadge tier={tier} palette="turing" />
                  )}
                  <span className="font-medium text-brand-ink min-w-[3.5rem] text-right">
                    {display}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
