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
      className={`admin-card mb-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-7 ${className}`}
    >
      <div className="min-w-0">
        <h2 className="admin-page-title mb-1.5">{title}</h2>
        {subtitle ? (
          <p className="max-w-2xl text-sm leading-relaxed text-brand-slate">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
