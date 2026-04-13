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
      className={`admin-card relative flex flex-col p-5 sm:p-6 transition-shadow duration-200 ${
        onClick
          ? "cursor-pointer hover:shadow-md"
          : "hover:shadow-md"
      } ${className}`}
      onClick={onClick}
    >
      {icon ? (
        <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg border border-brand-line bg-brand-surface text-brand-navy [&>svg]:h-5 [&>svg]:w-5">
          {icon}
        </div>
      ) : null}
      <div
        className={`mb-3 flex flex-wrap items-start justify-between gap-2 ${icon ? "pr-12" : ""}`}
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-slate">
          {label}
        </p>
        {headerRight ? (
          <div className="shrink-0 -mr-0.5">{headerRight}</div>
        ) : null}
      </div>
      <div className="mt-auto">{children}</div>
      {footer ? (
        <div className="mt-3 border-t border-brand-line/70 pt-3 text-xs text-brand-slate">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
