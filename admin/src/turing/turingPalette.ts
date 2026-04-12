/**
 * 튜링 대시보드 COLOR PALETTE
 * Primary/Base 60% · Secondary(다이어그램) 30% · Accent 10%
 */
import type { MetricTier } from "./metricGrades";

export const TURING_PALETTE = {
  primary: "#000000",
  base: {
    white: "#FFFFFF",
    offWhite: "#FAFAFA",
    coolGray: "#F4F7FA",
  },
  secondary: {
    /** Int Navy */
    navy: "#0A2465",
    /** Slate Blue */
    slateBlue: "#5B6B95",
    /** Mint Blue */
    mintBlue: "#7B8DB8",
  },
  accent: "#40E0D0",
} as const;

/** 다이어그램 등급 — 우수(밝은 세컨더리) → 미흡(딥 네이비) */
export function turingTierStroke(t: MetricTier): string {
  return {
    excellent: TURING_PALETTE.secondary.mintBlue,
    medium: TURING_PALETTE.secondary.slateBlue,
    poor: TURING_PALETTE.secondary.navy,
  }[t];
}

export function turingTierDotFill(t: MetricTier | "neutral"): string {
  if (t === "neutral") return TURING_PALETTE.secondary.mintBlue;
  return turingTierStroke(t);
}
