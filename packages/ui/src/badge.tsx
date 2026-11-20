import type { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "accent"
  | "secondary"
  | "success"
  | "warning"
  | "destructive";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-laut-50 text-kabut",
  accent: "bg-fajar-soft text-[#8A5A00]",
  secondary: "bg-langit-soft text-laut-700",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-[#8A5A00]",
  destructive: "bg-danger-soft text-danger",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-sm ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function BadgeDot({ variant = "default" }: { variant?: BadgeVariant }) {
  const dotStyles: Record<BadgeVariant, string> = {
    default: "bg-kabut",
    accent: "bg-accent",
    secondary: "bg-secondary",
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-danger",
  };

  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`}
    />
  );
}
