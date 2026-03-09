/** 비용 계산 공통 로직 */

export const SUBSCRIPTION_MONTHLY = 800_000;
export const VAT_RATE = 0.1;

const USAGE_TIERS = [
  { min: 0, max: 5_000, pricePerCall: 0 },
  { min: 5_001, max: 75_000, pricePerCall: 80 },
  { min: 75_001, max: 250_000, pricePerCall: 160 },
  { min: 250_001, max: null, pricePerCall: null },
] as const;

export function formatWon(n: number): string {
  return `₩${n.toLocaleString()}`;
}

/** 사용량(건)에 따른 API 사용 요금 계산. 250,001건 이상이면 -1 (협의 필요) */
export function calcUsageCost(calls: number): number {
  if (calls <= 0) return 0;
  let total = 0;
  let remaining = calls;
  for (const tier of USAGE_TIERS) {
    if (tier.pricePerCall === null) return -1;
    const tierSize = tier.max === null ? Infinity : tier.max - tier.min + 1;
    const inTier = Math.min(remaining, tierSize);
    total += inTier * tier.pricePerCall;
    remaining -= inTier;
    if (remaining <= 0) break;
  }
  return total;
}

/** 사용량 기반 예상 부과 금액 (구독료 + API 사용료 + VAT) */
export function calcEstimatedCharge(calls: number): {
  usageCost: number;
  totalBeforeVat: number;
  vatAmount: number;
  totalWithVat: number;
  hasNegotiation: boolean;
} {
  const usageCost = calcUsageCost(calls);
  const hasNegotiation = calls >= 250_001 || usageCost < 0;
  const totalBeforeVat =
    SUBSCRIPTION_MONTHLY + (usageCost >= 0 ? usageCost : 0);
  const vatAmount = Math.floor(totalBeforeVat * VAT_RATE);
  const totalWithVat = totalBeforeVat + vatAmount;
  return {
    usageCost: usageCost >= 0 ? usageCost : 0,
    totalBeforeVat,
    vatAmount,
    totalWithVat,
    hasNegotiation,
  };
}
