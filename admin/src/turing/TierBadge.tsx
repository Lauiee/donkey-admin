import type { MetricTier } from "./metricGrades";
import { TIER_LABEL } from "./metricGrades";

const BG: Record<MetricTier, string> = {
  excellent:
    "bg-[#91C0A4]/24 text-[#1F7A54] border border-[#7EB895] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
  medium:
    "bg-[#D6B67D]/24 text-[#7A4F14] border border-[#C8A86B] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
  poor:
    "bg-[#C48680]/22 text-[#7E2D2D] border border-[#B97872] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
};

/**
 * Turing 팔레트 — 가로 게이지·하단 범례 점과 동일 (세이지 / 탄 / 로즈)
 * ring 은 반드시 ring-1 과 색을 한 묶음으로 (바깥 ring-1 만 쓰면 기본 파란 링이 보임)
 */
const BG_TURING: Record<MetricTier, string> = {
  excellent:
    "bg-[#91C0A4]/24 text-[#1F7A54] border border-[#7EB895] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
  medium:
    "bg-[#D6B67D]/24 text-[#7A4F14] border border-[#C8A86B] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
  poor:
    "bg-[#C48680]/22 text-[#7E2D2D] border border-[#B97872] shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
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
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold tracking-[0.01em] leading-none ${cls}`}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}
