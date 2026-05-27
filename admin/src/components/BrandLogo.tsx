/**
 * donky. 로고 — Pretendard Black(900), "donky" 검정 + "." 시안(#40E0D0).
 * className 으로 크기(text-lg 등)만 조절.
 */
export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`font-black tracking-tight ${className}`}>
      <span className="text-brand-ink">donky</span>
      <span className="text-brand-accent">.</span>
    </span>
  );
}
