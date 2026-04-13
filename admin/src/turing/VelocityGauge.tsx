import { useId } from "react";
import {
  type VelocityGaugeKind,
  TIER_LABEL,
  velocityGaugeArcSplits,
  velocityGaugeLegend,
  velocityGaugeNeedleT,
  velocityGaugeTier,
  velocityRawToDisplayScorePct,
} from "./metricGrades";
import {
  TURING_PALETTE,
  turingTierDotFill,
  turingTierStroke,
} from "./turingPalette";
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

/** 상단 반원 게이지 — Velocity 스펙 테이블 임계값으로 등급·색 구간 */
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
  const { tPoorEnd, tMediumEnd } = velocityGaugeArcSplits(variant);
  const displayPct = velocityRawToDisplayScorePct(v);
  const needleAngle = Math.PI * (1 - needleT);
  /** 호의 반지름(r)까지 — 너무 짧으면(r-4) 색 띠에 묻히고, 너무 길면 튀어 보임 */
  const needleLen = r;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  return (
    <div className="admin-card p-5 flex flex-col items-center">
      <div className="w-full flex items-center justify-center gap-2 mb-1 min-h-[1.5rem]">
        {metricDescription ? (
          <TuringHoverDescription
            label={title}
            description={metricDescription}
            className="text-center text-sm font-medium text-brand-ink"
          />
        ) : (
          <span className="text-sm font-medium text-brand-ink text-center">
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
        tPoorEnd={tPoorEnd}
        tMediumEnd={tMediumEnd}
      />
      <p className="text-2xl font-semibold text-brand-ink tabular-nums -mt-1">
        {displayPct}%
      </p>
      <div className="mt-2">
        <TierBadge tier={tier} palette="turing" />
      </div>
      <div className="mt-3 w-full max-w-[240px] rounded-lg border border-brand-line bg-brand-canvas px-3 py-2.5">
        <ul className="space-y-1.5 text-left">
          {legendRows.map((row) => (
            <li key={row.tier} className="flex gap-2 text-[11px] leading-snug">
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full ring-1 ring-white/80"
                style={{ backgroundColor: turingTierDotFill(row.tier) }}
                aria-hidden
              />
              <span>
                <span
                  className="font-semibold"
                  style={{ color: turingTierStroke(row.tier) }}
                >
                  {TIER_LABEL[row.tier]}
                </span>
                <span style={{ color: TURING_PALETTE.secondary.slateBlue }}>
                  {" "}
                  — {row.description}
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
  tPoorEnd,
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
  /** 점수 t 기준: 미흡 구간 [0, tPoorEnd) */
  tPoorEnd: number;
  /** 보통 구간 [tPoorEnd, tMediumEnd), 우수 [tMediumEnd, 1] */
  tMediumEnd: number;
}) {
  const showPoorArc = tPoorEnd > 1e-6;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full max-w-[220px] h-auto"
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
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.15" />
        </filter>
      </defs>
      {showPoorArc && (
        <path
          d={arcPath(0, tPoorEnd)}
          fill="none"
          stroke={turingTierStroke("poor")}
          strokeWidth={stroke}
          strokeLinecap="round"
          opacity={0.92}
        />
      )}
      <path
        d={arcPath(showPoorArc ? tPoorEnd : 0, tMediumEnd)}
        fill="none"
        stroke={turingTierStroke("medium")}
        strokeWidth={stroke}
        strokeLinecap="round"
        opacity={0.95}
      />
      <path
        d={arcPath(tMediumEnd, 1)}
        fill="none"
        stroke={turingTierStroke("excellent")}
        strokeWidth={stroke}
        strokeLinecap="round"
        opacity={0.95}
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
            stroke={TURING_PALETTE.secondary.slateBlue}
            opacity={0.45}
            strokeWidth={1.5}
          />
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke={TURING_PALETTE.accent}
        strokeWidth={2.5}
        strokeLinecap="round"
        filter={`url(#g-sh-${filterId})`}
      />
      <circle cx={cx} cy={cy} r={5} fill={TURING_PALETTE.secondary.navy} />
    </svg>
  );
}
