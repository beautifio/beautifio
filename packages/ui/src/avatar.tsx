import type { ReactNode } from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  initials?: string;
  alt?: string;
  size?: AvatarSize;
  children?: ReactNode;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-[10px]",
  md: "w-10 h-10 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-16 h-16 text-base",
};

export function Avatar({
  src,
  initials,
  alt = "",
  size = "md",
  children,
}: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || initials || ""}
        className={`rounded-full object-cover flex-shrink-0 ${sizeStyles[size]}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold flex-shrink-0 ${sizeStyles[size]}`}
    >
      {initials || children || "?"}
    </div>
  );
}

export function AvatarGroup({
  children,
  max = 4,
}: {
  children: ReactNode[];
  max?: number;
}) {
  const visible = children.slice(0, max);
  const remaining = children.length - max;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((child, i) => (
          <div key={i} className="ring-2 ring-card rounded-full">
            {child}
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <span className="ml-1.5 text-xs font-medium text-text-secondary">
          +{remaining}
        </span>
      )}
    </div>
  );
}
