import type { ReactNode } from "react";

export function SectionHeader({
  title,
  description,
  action,
  className = "",
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-end justify-between gap-3 mb-3 ${className}`}>
      <div className="min-w-0">
        <h2 className="font-display text-[17px] font-semibold text-tinta leading-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-[13px] text-kabut mt-0.5">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 text-sm font-medium text-laut-500">{action}</div> : null}
    </div>
  );
}
