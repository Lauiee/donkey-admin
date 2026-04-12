import type { MetricTier } from "./metricGrades";
import { TIER_LABEL } from "./metricGrades";

const BG: Record<MetricTier, string> = {
  excellent: "bg-emerald-100 text-emerald-900 ring-emerald-200",
  medium: "bg-amber-100 text-amber-900 ring-amber-200",
  poor: "bg-red-100 text-red-900 ring-red-200",
};

export function TierBadge({ tier }: { tier: MetricTier }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${BG[tier]}`}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
