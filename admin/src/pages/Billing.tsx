import { useEffect, useState, useMemo } from "react";
import { getUsage } from "../api";
import {
  SUBSCRIPTION_MONTHLY,
  calcEstimatedCharge,
  calcUsageCost,
  formatWon,
} from "../billing";

const USAGE_TIERS = [
  { min: 0, max: 5_000, pricePerCall: 0, label: "0~5,000건" },
  { min: 5_001, max: 75_000, pricePerCall: 80, label: "5,001~75,000건" },
  { min: 75_001, max: 250_000, pricePerCall: 160, label: "75,001~250,000건" },
  { min: 250_001, max: null, pricePerCall: null, label: "250,001건 이상" },
] as const;

function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return { from: `${y}-${m}-01`, to: `${y}-${m}-${d}` };
}

export function Billing() {
  const [inputCalls, setInputCalls] = useState<string>("");
  const [monthUsage, setMonthUsage] = useState<number | null>(null);
  const [monthLoading, setMonthLoading] = useState(true);

  useEffect(() => {
    const { from, to } = getCurrentMonthRange();
    getUsage(from, to)
      .then((s) => setMonthUsage(s.total_count))
      .catch(() => setMonthUsage(null))
      .finally(() => setMonthLoading(false));
  }, []);

  const monthEstimate = useMemo(() => {
    if (monthUsage === null) return null;
    return calcEstimatedCharge(monthUsage);
  }, [monthUsage]);

  const usageNum = useMemo(() => {
    const n = parseInt(inputCalls.replace(/\D/g, ""), 10);
    return Number.isNaN(n) ? 0 : n;
  }, [inputCalls]);

  const inputEstimate = useMemo(
    () => (usageNum > 0 ? calcEstimatedCharge(usageNum) : null),
    [usageNum]
  );

  return (
    <div>
      <h2 className="admin-page-title mb-2">비용</h2>
      <p className="text-sm text-slate-500 mb-8">
        월 구독료와 API 사용량에 따른 요금 정보입니다.
      </p>

      {/* 당월 예상 부과 금액 */}
      <div className="admin-card p-6 mb-8 max-w-3xl border-l-4 border-l-indigo-500 bg-indigo-50/30">
        <h3 className="font-semibold text-slate-800 mb-1">
          당월 예상 부과 금액
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {new Date().getMonth() + 1}월 현재 누적 사용량 기준 (실제 청구는 익월
          초)
        </p>
        {monthLoading ? (
          <p className="text-slate-500">불러오는 중...</p>
        ) : monthEstimate && !monthEstimate.hasNegotiation ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">월 구독료</span>
              <span className="font-medium">
                {formatWon(SUBSCRIPTION_MONTHLY)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">
                API 사용 요금 ({(monthUsage ?? 0).toLocaleString()}건)
              </span>
              <span className="font-medium">
                {formatWon(monthEstimate.usageCost)}
              </span>
            </div>
            <div className="flex justify-between text-base pt-3 border-t border-slate-200">
              <span className="font-semibold text-slate-800">
                예상 부과 금액 (VAT 포함)
              </span>
              <span className="font-bold text-indigo-600 text-lg">
                {formatWon(monthEstimate.totalWithVat)}
              </span>
            </div>
          </div>
        ) : monthEstimate?.hasNegotiation && (monthUsage ?? 0) >= 250_001 ? (
          <p className="text-amber-700 font-medium">
            250,001건 이상 사용으로 별도 협의가 필요합니다. 담당자에게 문의해
            주세요.
          </p>
        ) : (
          <p className="text-slate-500">
            사용량 데이터가 없습니다. 당월 사용 후 표시됩니다.
          </p>
        )}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 max-w-3xl">
        <div className="admin-card p-6 border-l-4 border-l-indigo-500">
          <p className="text-sm font-medium text-slate-500 mb-1">월 구독료</p>
          <p className="text-3xl font-bold text-slate-900">
            {formatWon(SUBSCRIPTION_MONTHLY)}
            <span className="text-base font-normal text-slate-500 ml-1.5">
              /월
            </span>
          </p>
          <p className="text-xs text-slate-400 mt-2">VAT 별도</p>
        </div>
        <div className="admin-card p-6 border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-slate-500 mb-1">
            API 사용 요금
          </p>
          <p className="text-lg font-semibold text-slate-700">
            구간별 과금 (아래 표 참조)
          </p>
          <p className="text-xs text-slate-400 mt-2">
            0~5,000건 무료 · 250,001건 이상 협의
          </p>
        </div>
      </div>

      {/* 사용량 구간 테이블 */}
      <div className="admin-card overflow-hidden mb-10 max-w-3xl">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">
            월간 API 사용량 구간별 요금
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">당월 누적 사용량 기준</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left">
                <th className="px-6 py-3 font-medium text-slate-600">
                  사용량 구간
                </th>
                <th className="px-6 py-3 font-medium text-slate-600 text-right">
                  건당 요금
                </th>
              </tr>
            </thead>
            <tbody>
              {USAGE_TIERS.map((tier, i) => (
                <tr
                  key={i}
                  className="border-t border-slate-100 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-4 text-slate-700 font-medium">
                    {tier.label}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tier.pricePerCall === null ? (
                      <span className="text-amber-600 font-medium">
                        협의 필요
                      </span>
                    ) : tier.pricePerCall === 0 ? (
                      <span className="text-emerald-600 font-medium">무료</span>
                    ) : (
                      <span className="text-slate-800 font-semibold">
                        {formatWon(tier.pricePerCall)}/건
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 비용 계산기 */}
      <div className="admin-card p-6 mb-8 max-w-3xl">
        <h3 className="font-semibold text-slate-800 mb-1">예상 비용 계산</h3>
        <p className="text-sm text-slate-500 mb-6">
          예상 월 사용량을 입력하면 대략적인 비용을 확인할 수 있습니다.
        </p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              월 예상 사용량 (건)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={inputCalls}
              onChange={(e) =>
                setInputCalls(e.target.value.replace(/[^\d]/g, ""))
              }
              placeholder="10000"
              className="w-48 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        {inputEstimate && (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
            {inputEstimate.hasNegotiation ? (
              <p className="text-amber-700 font-medium">
                250,001건 이상의 사용량은 별도 협의가 필요합니다. 담당자에게
                문의해 주세요.
              </p>
            ) : (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">월 구독료</span>
                  <span className="font-medium text-slate-800">
                    {formatWon(SUBSCRIPTION_MONTHLY)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    API 사용 요금 ({usageNum.toLocaleString()}건)
                  </span>
                  <span className="font-medium text-slate-800">
                    {formatWon(inputEstimate.usageCost)}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2">
                  <span className="text-slate-600">소계 (VAT 별도)</span>
                  <span className="font-semibold text-slate-900">
                    {formatWon(inputEstimate.totalBeforeVat)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">VAT (10%)</span>
                  <span className="font-medium text-slate-700">
                    {formatWon(inputEstimate.vatAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base pt-3 border-t border-slate-200">
                  <span className="font-semibold text-slate-800">
                    예상 월 결제 금액
                  </span>
                  <span className="font-bold text-indigo-600">
                    {formatWon(inputEstimate.totalWithVat)}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* 안내 문구 */}
      <div className="admin-card p-6 max-w-3xl bg-slate-50/80 border-slate-200">
        <h4 className="font-medium text-slate-700 mb-2">안내 사항</h4>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc list-inside">
          <li>월 구독료 80만원은 VAT 별도입니다.</li>
          <li>API 사용량은 월 단위로 집계되며, 다음 달 초에 청구됩니다.</li>
          <li>
            250,001건 이상 사용 시 별도 협의를 통해 맞춤 요금이 적용됩니다.
          </li>
          <li>문의: 담당자에게 연락해 주세요.</li>
        </ul>
      </div>
    </div>
  );
}
