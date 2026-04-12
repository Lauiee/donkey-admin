import { useId } from "react";
import { gradeSttVelocitySeconds, TIER_COLOR } from "./metricGrades";
import { TierBadge } from "./TierBadge";

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function arcLargeFlag(t0: number, t1: number): 0 | 1 {
  const sweepDeg = Math.abs(t1 - t0) * 180;
  return sweepDeg >= 180 ? 1 : 0;
}

type NeutralProps = {
  variant: "neutral";
  title: string;
  /** 0~1, 표시는 % */
  value01: number;
};

type SttProps = {
  variant: "stt";
  title: string;
  /** 초 단위 (API) */
  seconds: number;
};

export type VelocityGaugeProps = NeutralProps | SttProps;

/** 상단 반원 게이지 — processing/summarization 은 속도만(중립), STT 는 초·등급 색 */
export function VelocityGauge(props: VelocityGaugeProps) {
  const filterId = useId().replace(/:/g, "");

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

  if (props.variant === "neutral") {
    const v = clamp01(props.value01);
    const needleAngle = Math.PI * (1 - v);
    const needleLen = r - 4;
    const nx = cx + needleLen * Math.cos(needleAngle);
    const ny = cy - needleLen * Math.sin(needleAngle);
    const pct = Math.round(v * 1000) / 10;

    return (
      <div className="admin-card p-5 flex flex-col items-center">
        <div className="w-full flex items-center justify-center gap-2 mb-1 min-h-[1.5rem]">
          <span className="text-sm font-medium text-slate-800 text-center">
            {props.title}
          </span>
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
          arcMode="single-gray"
        />
        <p className="text-2xl font-semibold text-slate-900 tabular-nums -mt-1">
          {pct}%
        </p>
        <p className="text-[11px] text-slate-500 mt-1">등급 없음 · 속도만 표시</p>
      </div>
    );
  }

  const sec = Math.max(0, props.seconds);
  const tier = gradeSttVelocitySeconds(sec);
  const needleT = clamp01(1 - Math.min(sec / 30, 1));
  const needleAngle = Math.PI * (1 - needleT);
  const needleLen = r - 4;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy - needleLen * Math.sin(needleAngle);

  const t5 = 1 - 5 / 30;
  const t15 = 1 - 15 / 30;

  return (
    <div className="admin-card p-5 flex flex-col items-center">
      <div className="w-full flex items-center justify-center gap-2 mb-1 min-h-[1.5rem]">
        <span className="text-sm font-medium text-slate-800 text-center">
          {props.title}
        </span>
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
        arcMode="stt-tiered"
        tSplitA={t15}
        tSplitB={t5}
      />
      <p className="text-2xl font-semibold text-slate-900 tabular-nums -mt-1">
        {sec < 100 ? sec.toFixed(1) : sec.toFixed(0)}초
      </p>
      <div className="mt-2">
        <TierBadge tier={tier} />
      </div>
      <p className="text-[11px] text-slate-500 mt-2 text-center px-1">
        우수 &lt; 5초 · 보통 &lt; 15초 · 미흡 ≥ 15초
      </p>
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
  arcMode,
  tSplitA,
  tSplitB,
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
  arcMode: "single-gray" | "stt-tiered";
  tSplitA?: number;
  tSplitB?: number;
}) {
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
      {arcMode === "single-gray" && (
        <path
          d={arcPath(0, 1)}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
      )}
      {arcMode === "stt-tiered" && tSplitA != null && tSplitB != null && (
        <>
          <path
            d={arcPath(0, tSplitA)}
            fill="none"
            stroke={TIER_COLOR.poor}
            strokeWidth={stroke}
            strokeLinecap="round"
            opacity={0.9}
          />
          <path
            d={arcPath(tSplitA, tSplitB)}
            fill="none"
            stroke={TIER_COLOR.medium}
            strokeWidth={stroke}
            strokeLinecap="round"
            opacity={0.95}
          />
          <path
            d={arcPath(tSplitB, 1)}
            fill="none"
            stroke={TIER_COLOR.excellent}
            strokeWidth={stroke}
            strokeLinecap="round"
            opacity={0.95}
          />
        </>
      )}
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
            stroke="#94a3b8"
            strokeWidth={1.5}
          />
        );
      })}
      <line
        x1={cx}
        y1={cy}
        x2={nx}
        y2={ny}
        stroke="#334155"
        strokeWidth={2.5}
        strokeLinecap="round"
        filter={`url(#g-sh-${filterId})`}
      />
      <circle cx={cx} cy={cy} r={5} fill="#334155" />
    </svg>
  );
}
