import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  subtitle,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`admin-card relative mb-8 flex flex-col gap-5 overflow-hidden p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8 ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-gradient-to-br from-brand-violet/[0.14] to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full bg-gradient-to-tr from-brand-accent/[0.12] to-transparent blur-3xl"
        aria-hidden
      />
      <div className="relative z-10 min-w-0">
        <h2 className="admin-page-title mb-1.5">{title}</h2>
        {subtitle ? (
          <p className="max-w-2xl text-sm leading-relaxed text-brand-slate">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
