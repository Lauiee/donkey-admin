import type { MetricTier } from "./metricGrades";
import { TIER_LABEL } from "./metricGrades";

const BG: Record<MetricTier, string> = {
  excellent: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  medium: "bg-amber-100 text-amber-900 ring-amber-200",
  poor: "bg-red-100 text-red-900 ring-red-200",
};

/** 튜링 팔레트 — Secondary 계열 */
const BG_TURING: Record<MetricTier, string> = {
  excellent:
    "bg-[#7B8DB8]/25 text-[#0A2465] ring-[#7B8DB8]/45",
  medium: "bg-[#5B6B95]/20 text-[#0A2465] ring-[#5B6B95]/40",
  poor: "bg-[#0A2465]/14 text-[#0A2465] ring-[#0A2465]/35",
};

export function TierBadge({
  tier,
  palette = "default",
}: {
  tier: MetricTier;
  palette?: "default" | "turing";
}) {
  const cls = palette === "turing" ? BG_TURING[tier] : BG[tier];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${cls}`}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
