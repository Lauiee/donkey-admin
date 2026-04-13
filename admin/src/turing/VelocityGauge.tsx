import { useId } from "react";
import {
  type VelocityGaugeKind,
  TIER_LABEL,
  velocityGaugeArcSplits,
  velocityGaugeLegend,
  velocityGaugeNeedleT,
  velocityGaugeTier,
} from "./metricGrades";
import { formatRawRatioAsPercent } from "./turingFormat";
import {
  TURING_GAUGE_GREEN,
  TURING_GAUGE_ROSE,
  TURING_GAUGE_TAN,
  TURING_GAUGE_THUMB_LINE,
  turingGaugeTierFill,
} from "./turingGaugeTheme";
import { TURING_PALETTE } from "./turingPalette";
import { TierBadge } from "./TierBadge";
import { TuringHoverDescription } from "./TuringHoverDescription";

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function arcLargeFlag(t0: number, t1: number): 0 | 1 {
  const sweepDeg = Math.abs(t1 - t0) * 180;
  return sweepDeg >= 180 ? 1 : 0;
}

export type VelocityGaugeProps = {
  variant: VelocityGaugeKind;
  title: string;
  /** 호버 시 브라우저 툴팁으로 표시할 지표 설명 */
  metricDescription?: string;
  /** 0~1 스펙 비율 (낮을수록 좋음). processing 은 1 초과 가능 */
  value01: number;
};

/** 상단 반원 게이지 — 상세 지표 막대와 동일 색(세이지·탄·로즈), 임계는 metricGrades */
export function VelocityGauge(props: VelocityGaugeProps) {
  const filterId = useId().replace(/:/g, "");
  const { variant, title, metricDescription, value01: raw } = props;
  const v = Math.max(0, raw);

  const w = 200;
  const h = 132;
  const cx = 100;
  const cy = 100;
  const r = 78;
  const stroke = 14;

  const polar = (t: number) => {
    const angle = Math.PI * (1 - t);
    return {
      x: cx + r * Math.cos(angle),
      y: cy - r * Math.sin(angle),
    };
  };

  const arcPath = (t0: number, t1: number) => {
    const a = polar(t0);
    const b = polar(t1);
    const large = arcLargeFlag(t0, t1);
    return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 1 ${b.x} ${b.y}`;
  };

  const tier = velocityGaugeTier(variant, v);
  const legendRows = velocityGaugeLegend(variant);
  const needleT = clamp01(velocityGaugeNeedleT(variant, v));
  const { tExcellentEnd, tMediumEnd } = velocityGaugeArcSplits(variant);
  const needleAngle = Math.PI * (1 - needleT);
  const needleLen = r;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  return (
    <div className="admin-card flex flex-col items-center p-5">
      <div className="mb-1 flex min-h-[1.5rem] w-full items-center justify-center gap-2">
        {metricDescription ? (
          <TuringHoverDescription
            label={title}
            description={metricDescription}
            className="text-center text-sm font-medium text-brand-ink"
          />
        ) : (
          <span className="text-center text-sm font-medium text-brand-ink">
            {title}
          </span>
        )}
      </div>
      <GaugeSvg
        filterId={filterId}
        arcPath={arcPath}
        polar={polar}
        cx={cx}
        cy={cy}
        r={r}
        stroke={stroke}
        w={w}
        h={h}
        nx={nx}
        ny={ny}
        tExcellentEnd={tExcellentEnd}
        tMediumEnd={tMediumEnd}
      />
      <p className="-mt-1 text-2xl font-semibold tabular-nums text-brand-ink">
        {formatRawRatioAsPercent(v)}
      </p>
      <div className="mt-2">
        <TierBadge tier={tier} palette="turing" />
      </div>
      <div className="mt-4 w-full max-w-[260px] border-t border-b border-brand-line/40 py-2.5">
        <ul className="m-0 list-none space-y-2.5 p-0">
          {legendRows.map((row) => (
            <li
              key={row.tier}
              className="flex items-start gap-2 text-[10px] leading-snug"
            >
              <span
                className="mt-0.5 h-2 w-2 shrink-0 rounded-full ring-1 ring-white/90"
                style={{ backgroundColor: turingGaugeTierFill(row.tier) }}
                aria-hidden
              />
              <span className="min-w-0 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
                <span
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold leading-none text-brand-navy ring-1 ring-white/70"
                  style={{ backgroundColor: `${turingGaugeTierFill(row.tier)}33` }}
                >
                  {TIER_LABEL[row.tier]}
                </span>
                <span className="font-medium tabular-nums text-brand-navy">
                  {row.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function GaugeSvg({
  filterId,
  arcPath,
  polar,
  cx,
  cy,
  r,
  stroke,
  w,
  h,
  nx,
  ny,
  tExcellentEnd,
  tMediumEnd,
}: {
  filterId: string;
  arcPath: (t0: number, t1: number) => string;
  polar: (t: number) => { x: number; y: number };
  cx: number;
  cy: number;
  r: number;
  stroke: number;
  w: number;
  h: number;
  nx: number;
  ny: number;
  tExcellentEnd: number;
  tMediumEnd: number;
}) {
  const showExcellentArc = tExcellentEnd > 1e-6;
  const tickStroke = "rgba(10, 36, 101, 0.22)";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-auto w-full max-w-[220px]"
      aria-hidden
    >
      <defs>
        <filter
          id={`g-sh-${filterId}`}
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.12" />
        </filter>
      </defs>
      {showExcellentArc && (
        <path
          d={arcPath(0, tExcellentEnd)}
          fill="none"
          stroke={TURING_GAUGE_GREEN}
          strokeWidth={stroke}
          strokeLinecap="round"
          opacity={0.95}
        />
      )}
      <path
        d={arcPath(showExcellentArc ? tExcellentEnd : 0, tMediumEnd)}
        fill="none"
        stroke={TURING_GAUGE_TAN}
        strokeWidth={stroke}
        strokeLinecap="round"
        opacity={0.95}
      />
      <path
        d={arcPath(tMediumEnd, 1)}
        fill="none"
        stroke={TURING_GAUGE_ROSE}
        strokeWidth={stroke}
        strokeLinecap="round"
        opacity={0.92}
      />
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((t) => {
        const outer = polar(t);
        const innerR = r - stroke / 2 - 6;
        const angle = Math.PI * (1 - t);
        const ix = cx + innerR * Math.cos(angle);
        const iy = cy - innerR * Math.sin(angle);
        return (
          <line
            key={t}
            x1={ix}
            y1={iy}
            x2={outer.x}
            y2={outer.y}
            stroke={tickStroke}
            strokeWidth={1.5}
          />
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={TURING_GAUGE_THUMB_LINE}
        strokeWidth={2.5}
        strokeLinecap="round"
        filter={`url(#g-sh-${filterId})`}
      />
      <circle cx={cx} cy={cy} r={5} fill={TURING_PALETTE.secondary.navy} />
    </svg>
  );
}
