import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function StatCard({
  label,
  icon,
  headerRight,
  children,
  footer,
  className = "",
  onClick,
}: StatCardProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group admin-card relative flex flex-col overflow-hidden p-5 sm:p-6 transition-[border-color,box-shadow] duration-700 ease-out hover:shadow-xl hover:shadow-brand-violet/25 group-hover:border-transparent group-hover:ring-0 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
      onClick={onClick}
    >
      {/* opacity + 미세 scale → 한 방울이 번지듯 (GPU-friendly transform) */}
      <div
        className="pointer-events-none absolute -inset-px origin-[58%_18%] rounded-3xl bg-gradient-to-br from-brand-violet via-[#6E56E0] to-brand-navy opacity-0 scale-[0.94] transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.25,0.46,0.45,0.99)] will-change-[opacity,transform] group-hover:opacity-100 group-hover:scale-100 group-hover:will-change-auto"
        aria-hidden
      />
      {/* 은은한 하이라이트: 위쪽에서 먼저 비침 */}
      <div
        className="pointer-events-none absolute -inset-px rounded-3xl bg-[radial-gradient(ellipse_95%_65%_at_50%_-5%,rgba(255,255,255,0.22),transparent_52%)] opacity-0 transition-opacity duration-[850ms] ease-out group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-px overflow-hidden rounded-3xl opacity-100 transition-opacity duration-[850ms] ease-out group-hover:opacity-0"
        aria-hidden
      >
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-brand-violet/[0.12] to-transparent blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-28 w-28 rounded-full bg-gradient-to-tr from-brand-accent/[0.14] to-transparent blur-2xl" />
      </div>
      {icon ? (
        <div className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-line/70 bg-gradient-to-br from-white to-brand-surface text-brand-navy shadow-inner transition-[border-color,background-color,color] duration-700 ease-out delay-100 [&>svg]:h-5 [&>svg]:w-5 group-hover:border-brand-violet group-hover:bg-white group-hover:text-brand-violet [&>svg]:stroke-current">
          {icon}
        </div>
      ) : null}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div
          className={`mb-3 flex flex-wrap items-start justify-between gap-2 ${icon ? "pr-12" : ""}`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-slate transition-colors duration-700 ease-out delay-100 group-hover:text-white/90">
            {label}
          </p>
          {headerRight ? (
            <div className="stat-card-header-extra shrink-0 -mr-0.5 transition-colors duration-700 ease-out delay-100 [&_button]:transition-colors [&_button]:duration-700">
              {headerRight}
            </div>
          ) : null}
        </div>
        <div className="mt-auto delay-100 [&_p]:transition-colors [&_p]:duration-700 [&_p]:ease-out [&_span]:transition-colors [&_span]:duration-700 [&_strong]:transition-colors [&_strong]:duration-700 group-hover:[&_p]:text-white group-hover:[&_span]:!text-white/85 group-hover:[&_strong]:text-white">
          {children}
        </div>
        {footer ? (
          <div className="mt-3 border-t border-brand-line/70 pt-3 text-xs text-brand-slate transition-[border-color,color] duration-700 ease-out delay-[120ms] [&_strong]:transition-colors [&_strong]:duration-700 group-hover:border-white/25 group-hover:text-white/85 group-hover:[&_strong]:text-white">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
