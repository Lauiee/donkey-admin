import { useId } from "react";
import type { MetricTier } from "./metricGrades";
import { TierBadge } from "./TierBadge";
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

function NeutralBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 shrink-0 bg-[#7B8DB8]/15 text-[#5B6B95] ring-[#7B8DB8]/35"
    >
      속도만
    </span>
  );
}

export function HeptagonRadar({
  title,
  values,
  chartRadii,
  chartLabels,
  listLabels,
  tiers,
  rowFormats,
  secondsValues,
}: Props) {
  const gradId = useId().replace(/:/g, "");
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

  const rowPairs = Math.ceil(N / 2);

  return (
    <div className="admin-card border-[#E2E8F0] bg-white p-5">
      <h3 className="text-sm font-semibold text-[#0A2465] text-center mb-4">
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
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none"
                fill={TURING_PALETTE.secondary.slateBlue}
                style={{ fontSize: 10 }}
              >
                <title>{full}</title>
                {label}
              </text>
            );
          })}
        </svg>
      </div>

      <ul className="mt-4 space-y-2.5 text-xs text-[#5B6B95] list-none p-0 m-0">
        {Array.from({ length: rowPairs }, (_, row) => {
          const leftIdx = row * 2;
          const rightIdx = leftIdx + 1;

          const cell = (i: number) => {
            const label = listLabels[i] ?? "";
            const tier = tiers[i] ?? "neutral";
            const rawSec = secondsValues?.[i];
            const val = values[i];
            const display =
              val === null
                ? "—"
                : fmt[i] === "seconds" && rawSec != null
                  ? `${rawSec < 100 ? rawSec.toFixed(1) : rawSec.toFixed(0)}초`
                  : formatPercent(val);

            return (
              <div
                key={`${label}-${i}`}
                className="flex items-center justify-between gap-3 min-h-[1.75rem] tabular-nums"
              >
                <span className="truncate min-w-0 flex-1" title={label}>
                  {label}
                </span>
                <span className="flex items-center gap-2 shrink-0">
                  {val === null ? (
                    <span className="text-[10px] font-medium text-[#5B6B95] shrink-0">
                      미지원
                    </span>
                  ) : tier === "neutral" ? (
                    <NeutralBadge />
                  ) : (
                    <TierBadge tier={tier} palette="turing" />
                  )}
                  <span className="font-medium text-[#000000] min-w-[3.5rem] text-right">
                    {display}
                  </span>
                </span>
              </div>
            );
          };

          return (
            <li key={`row-${row}`} className="grid grid-cols-2 gap-x-5 items-start">
              {cell(leftIdx)}
              {rightIdx < N ? cell(rightIdx) : <div aria-hidden />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
