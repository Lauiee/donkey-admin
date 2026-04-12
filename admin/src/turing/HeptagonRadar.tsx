import { useId } from "react";
import type { MetricTier } from "./metricGrades";
import { tierToDotColor } from "./metricGrades";
import { TierBadge } from "./TierBadge";

type Props = {
  title: string;
  /** 꼭지 순서대로 0~1 (차트 반지름), 길이 7 */
  values: number[];
  chartLabels: readonly string[];
  listLabels: readonly string[];
  /** 각 꼭지 등급 — 속도만 표시 축은 neutral */
  tiers: Array<MetricTier | "neutral">;
  /** 하단 수치 표시 — 초 또는 % */
  rowFormats?: Array<"percent" | "seconds">;
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

export function HeptagonRadar({
  title,
  values,
  chartLabels,
  listLabels,
  tiers,
  rowFormats,
  secondsValues,
}: Props) {
  const gradId = useId().replace(/:/g, "");
  const pts = Array.from({ length: N }, (_, i) => clamp01(values[i] ?? 0));

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
      <h3 className="text-sm font-semibold text-slate-800 text-center mb-4">
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
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
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
              stroke="#e2e8f0"
              strokeWidth={lv === 1 ? 1.5 : 1}
            />
          ))}

          <polygon
            points={outerPoly}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={1.5}
          />

          <polygon
            points={dataPoly}
            fill={`url(#rf-${gradId})`}
            stroke="#6d28d9"
            strokeWidth={2}
            strokeLinejoin="round"
          />

          {pts.map((v, i) => {
            const p = vertex(i, maxR * v);
            const fill = tierToDotColor(tiers[i] ?? "neutral");
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
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-slate-600 pointer-events-none"
                style={{ fontSize: 10 }}
              >
                <title>{full}</title>
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-600">
        {listLabels.map((label, i) => {
          const tier = tiers[i] ?? "neutral";
          const rawSec = secondsValues?.[i];
          const display =
            fmt[i] === "seconds" && rawSec != null
              ? `${rawSec < 100 ? rawSec.toFixed(1) : rawSec.toFixed(0)}초`
              : formatPercent(values[i] ?? 0);

          return (
            <li
              key={`${label}-${i}`}
              className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 tabular-nums"
            >
              <span className="truncate min-w-0" title={label}>
                {label}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {tier === "neutral" ? (
                  <span className="text-[10px] text-slate-400 font-medium">
                    속도만
                  </span>
                ) : (
                  <TierBadge tier={tier} />
                )}
                <span className="font-medium text-slate-800">{display}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
