import { useId, useState } from "react";
import { TURING_PALETTE } from "./turingPalette";

type Point = { label: string; value: number; tooltipLabel?: string };

type Props = {
  title: string;
  /** 시계열 포인트 (데모/API 연동 시 교체) — 가로는 보통 건·순번 */
  series: Point[];
  /** 가로축 설명 (예: 최근 N건 순번) */
  xAxisCaption?: string;
};

/** Turing용 SVG 라인 차트 */
export function TuringLineChart({
  title,
  series,
  xAxisCaption = "",
}: Props) {
  const gradId = useId().replace(/:/g, "");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  /** 넓은 viewBox — 실제 표시는 컨테이너 가로 100%에 맞춤 */
  const w = 1000;
  const h = 236;
  const pad = { left: 48, right: 24, top: 28, bottom: 48 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;

  const values = series.map((p) => p.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padY = (rawMax - rawMin) * 0.12 || 0.05;
  const minY = rawMin - padY;
  const maxY = rawMax + padY;
  const yRange = maxY - minY || 1;

  const n = series.length;
  const xAt = (i: number) => pad.left + (innerW * (n <= 1 ? 0.5 : i / (n - 1)));
  const yAt = (v: number) => pad.top + innerH * (1 - (v - minY) / yRange);

  const linePath = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xAt(i).toFixed(1)} ${yAt(p.value).toFixed(1)}`)
    .join(" ");

  const areaPath =
    series.length > 0
      ? `${linePath} L ${xAt(n - 1).toFixed(1)} ${(pad.top + innerH).toFixed(1)} L ${xAt(0).toFixed(1)} ${(pad.top + innerH).toFixed(1)} Z`
      : "";

  const yTicks = 4;
  const tickVals = Array.from({ length: yTicks + 1 }, (_, i) => minY + (yRange * i) / yTicks);
  const hovered = hoveredIndex == null ? null : series[hoveredIndex];
  const hx = hoveredIndex == null ? 0 : xAt(hoveredIndex);
  const hy = hoveredIndex == null ? 0 : yAt(series[hoveredIndex].value);
  const tipW = 180;
  const tipH = 54;
  const tipX = Math.min(w - pad.right - tipW, Math.max(pad.left, hx - tipW / 2));
  const tipY = Math.max(8, hy - tipH - 12);

  return (
    <div className="admin-card flex min-h-[280px] flex-col overflow-hidden">
      <div className="px-5 pt-5">
        <h4 className="text-sm font-semibold text-brand-navy">{title}</h4>
      </div>
      <div className="mt-3 w-full min-w-0 flex-1">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="block h-[236px] w-full min-w-0 max-w-none"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={title}
        >
          <defs>
            <linearGradient id={`area-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={TURING_PALETTE.accent} stopOpacity="0.25" />
              <stop offset="100%" stopColor={TURING_PALETTE.secondary.mintBlue} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {tickVals.map((tv, i) => {
            const y = yAt(tv);
            return (
              <g key={i}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={w - pad.right}
                  y2={y}
                  stroke={TURING_PALETTE.secondary.slateBlue}
                  strokeOpacity={0.12}
                  strokeWidth={1}
                />
                <text
                  x={pad.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-brand-slate text-[10px]"
                  style={{ fontSize: 10 }}
                >
                  {tv.toFixed(2)}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={`url(#area-${gradId})`} />

          <path
            d={linePath}
            fill="none"
            stroke={TURING_PALETTE.secondary.navy}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {hovered ? (
            <line
              x1={hx}
              y1={pad.top}
              x2={hx}
              y2={pad.top + innerH}
              stroke={TURING_PALETTE.secondary.slateBlue}
              strokeOpacity={0.25}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          ) : null}

          {series.map((p, i) => (
            <g key={`dot-${i}`}>
              <circle
                cx={xAt(i)}
                cy={yAt(p.value)}
                r={10}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() =>
                  setHoveredIndex((prev) => (prev === i ? null : prev))
                }
              />
              <circle
                cx={xAt(i)}
                cy={yAt(p.value)}
                r={hoveredIndex === i ? 6.5 : 5}
                fill={TURING_PALETTE.base.white}
                stroke={TURING_PALETTE.accent}
                strokeWidth={hoveredIndex === i ? 2.8 : 2}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() =>
                  setHoveredIndex((prev) => (prev === i ? null : prev))
                }
              >
                <title>{`${p.tooltipLabel ?? p.label}\nHealth Score: ${p.value}`}</title>
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
                rx={12}
                fill="#FFFFFF"
                stroke="#D9E1EF"
                strokeOpacity={0.95}
                filter="drop-shadow(0px 8px 18px rgba(10,36,101,0.12))"
              />
              <text
                x={tipX + 12}
                y={tipY + 18}
                fill={TURING_PALETTE.secondary.navy}
                style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}
              >
                HEALTH SCORE
              </text>
              <text
                x={tipX + 12}
                y={tipY + 33}
                fill={TURING_PALETTE.secondary.navy}
                style={{ fontSize: 13, fontWeight: 700 }}
              >
                {String(hovered.value)}
              </text>
              <text
                x={tipX + 12}
                y={tipY + 47}
                fill="#5D6F95"
                style={{ fontSize: 10 }}
              >
                {hovered.tooltipLabel ?? hovered.label}
              </text>
            </g>
          ) : null}

          {series.map((p, i) => (
            <text
              key={`x-${p.label}-${i}`}
              x={xAt(i)}
              y={h - 26}
              textAnchor="middle"
              fill={TURING_PALETTE.secondary.slateBlue}
              style={{ fontSize: 10 }}
            >
              {p.label}
            </text>
          ))}
          {xAxisCaption ? (
            <text
              x={pad.left + innerW / 2}
              y={h - 6}
              textAnchor="middle"
              fill={TURING_PALETTE.secondary.slateBlue}
              style={{ fontSize: 10 }}
              opacity={0.85}
            >
              {xAxisCaption}
            </text>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
