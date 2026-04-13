import { useId } from "react";
import { TURING_PALETTE } from "./turingPalette";

type Point = { label: string; value: number };

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
  xAxisCaption = "건(순번)",
}: Props) {
  const gradId = useId().replace(/:/g, "");
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

  return (
    <div className="admin-card flex min-h-[280px] flex-col overflow-hidden border-[#E2E8F0] bg-white">
      <div className="px-5 pt-5">
        <h4 className="text-sm font-semibold text-[#0A2465]">{title}</h4>
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
                  className="fill-[#5B6B95] text-[10px]"
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

          {series.map((p, i) => (
            <circle
              key={`dot-${i}`}
              cx={xAt(i)}
              cy={yAt(p.value)}
              r={4}
              fill={TURING_PALETTE.base.white}
              stroke={TURING_PALETTE.accent}
              strokeWidth={2}
            />
          ))}

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
        </svg>
      </div>
    </div>
  );
}
