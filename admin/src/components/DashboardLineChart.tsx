import { useLayoutEffect, useMemo, useRef, useState } from "react";

export type DailyCountPoint = { date: string; count: number };

/** 좌우 패딩 동일 — 라벨 열과 선 끝점이 시각적으로 맞도록 */
const VB = { W: 1000, H: 340, padL: 36, padR: 36, padT: 24, padB: 52 };

function buildPaths(data: DailyCountPoint[]) {
  const n = data.length;
  if (n === 0) {
    return {
      lineD: "",
      areaD: "",
      points: [] as {
        x: number;
        y: number;
        date: string;
        count: number;
      }[],
      max: 1,
    };
  }
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const { W, H, padL, padR, padT, padB } = VB;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const baseY = padT + innerH;

  const xs = data.map((_, i) =>
    n === 1 ? padL + innerW / 2 : padL + (i / (n - 1)) * innerW
  );
  const ys = data.map((d) => {
    const t = d.count / maxCount;
    return padT + innerH * (1 - t);
  });

  const points = data.map((d, i) => ({
    x: xs[i],
    y: ys[i],
    date: d.date,
    count: d.count,
  }));

  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const areaD =
    points.length > 0
      ? `M ${points[0].x} ${baseY} ${points
          .map((p) => `L ${p.x} ${p.y}`)
          .join(" ")} L ${points[points.length - 1].x} ${baseY} Z`
      : "";

  return { lineD, areaD, points, max: maxCount };
}

export function DashboardLineChart({ data }: { data: DailyCountPoint[] }) {
  const lineRef = useRef<SVGPathElement>(null);
  const areaRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<{
    i: number;
    px: number;
    py: number;
  } | null>(null);

  const { lineD, areaD, points, max } = useMemo(() => buildPaths(data), [data]);

  useLayoutEffect(() => {
    const path = lineRef.current;
    if (!path || !lineD) return;
    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = `${len}`;
    path.style.transition = "none";
    const id = requestAnimationFrame(() => {
      path.style.transition =
        "stroke-dashoffset 1.15s cubic-bezier(0.22, 1, 0.36, 1)";
      path.style.strokeDashoffset = "0";
    });
    return () => cancelAnimationFrame(id);
  }, [lineD]);

  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transition = "none";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 0.85s ease 0.15s";
      el.style.opacity = "1";
    });
  }, [areaD]);

  const pickIndex = (svgX: number) => {
    if (points.length === 0) return 0;
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i < points.length; i++) {
      const d = Math.abs(points[i].x - svgX);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    return best;
  };

  const onPointer = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg || points.length === 0) return;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const cur = pt.matrixTransform(ctm.inverse());
    const i = pickIndex(cur.x);
    const rect = svg.getBoundingClientRect();
    setHover({
      i,
      px: rect.left + (points[i].x / VB.W) * rect.width,
      py: rect.top + (points[i].y / VB.H) * rect.height,
    });
  };

  if (data.length === 0) return null;

  const active = hover ? points[hover.i] : null;

  return (
    <div className="relative w-full select-none">
      {/* viewBox 비율 = 표시 비율 (w-full + h-auto) → meet 시 가로·세로 레터박스 없음, 라인이 첫/끝 날짜까지 맞음 */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB.W} ${VB.H}`}
        className="block h-auto w-full max-w-full touch-none"
        style={{ aspectRatio: `${VB.W} / ${VB.H}` }}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="최근 일별 요청량 라인 차트"
        onPointerLeave={() => setHover(null)}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse" || e.pointerType === "pen") {
            onPointer(e.clientX, e.clientY);
          }
        }}
        onPointerEnter={(e) => onPointer(e.clientX, e.clientY)}
        onPointerDown={(e) => onPointer(e.clientX, e.clientY)}
      >
        {/* faint grid */}
        {[0.25, 0.5, 0.75].map((t) => {
          const y = VB.padT + (VB.H - VB.padT - VB.padB) * (1 - t);
          return (
            <line
              key={t}
              x1={VB.padL}
              y1={y}
              x2={VB.W - VB.padR}
              y2={y}
              stroke="currentColor"
              strokeOpacity={0.06}
              strokeWidth={1}
              className="text-brand-navy"
            />
          );
        })}

        <path
          ref={areaRef}
          d={areaD}
          fill="#0a2465"
          fillOpacity={0.07}
        />

        <path
          ref={lineRef}
          d={lineD}
          fill="none"
          stroke="#0a2465"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => {
          const isH = hover?.i === i;
          return (
            <g key={p.date}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isH ? 9 : 6}
                fill="white"
                stroke="#0a2465"
                strokeWidth={isH ? 2.5 : 2}
                className="transition-all duration-200 ease-out"
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={isH ? 3.5 : 2.5}
                fill="#5b6b95"
                className="pointer-events-none transition-all duration-200"
              />
            </g>
          );
        })}

        {hover != null && points[hover.i] && (
          <line
            x1={points[hover.i].x}
            y1={VB.padT}
            x2={points[hover.i].x}
            y2={VB.H - VB.padB}
            stroke="#0a2465"
            strokeOpacity={0.12}
            strokeWidth={1.5}
            strokeDasharray="4 6"
          />
        )}
      </svg>

      {/* compact x labels — same spacing as chart (full width, no huge gaps) */}
      <div className="mt-1 flex w-full justify-between gap-0 px-1 sm:px-0">
        {points.map((p) => (
          <div
            key={p.date}
            className="min-w-0 flex-1 text-center"
          >
            <div className="text-[10px] font-semibold tabular-nums text-brand-navy sm:text-xs">
              {p.count}
            </div>
            <div className="text-[9px] font-medium text-brand-slate sm:text-[10px]">
              {p.date.slice(5).replace("-", "/")}
            </div>
          </div>
        ))}
      </div>

      {active && hover && (
        <div
          className="pointer-events-none fixed z-40 rounded-lg border border-brand-line bg-white px-3 py-2 text-xs shadow-md transition-transform duration-150"
          style={{
            left: Math.min(
              typeof window !== "undefined" ? window.innerWidth - 160 : 0,
              Math.max(12, hover.px - 72)
            ),
            top: Math.max(12, hover.py - 56),
          }}
        >
          <div className="font-bold text-brand-ink">
            요청량{" "}
            <span className="tabular-nums text-brand-navy">{active.count}</span>
            건
          </div>
          <div className="mt-0.5 text-[11px] text-brand-slate">
            {active.date.replace(/-/g, ".")}
          </div>
          <div className="mt-1 text-[10px] text-brand-mint">
            최대 대비 {max > 0 ? Math.round((active.count / max) * 100) : 0}%
          </div>
        </div>
      )}
    </div>
  );
}
