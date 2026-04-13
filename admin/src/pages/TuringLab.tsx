import { TuringDashboardView } from "../turing/TuringDashboardView";

/**
 * 현재 Turing 본 화면 — 상세 지표는 카드 그리드(`detailLayout="cards"`).
 */
export function TuringLab() {
  return (
    <TuringDashboardView
      pageTitle="Turing"
      detailLayout="cards"
    />
  );
}
