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
  default: "bg-muted text-muted-foreground",
  accent: "bg-accent/15 text-accent-foreground",
  secondary: "bg-secondary/15 text-secondary-foreground",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  destructive: "bg-destructive/10 text-destructive",
};

export function Badge({
  variant = "default",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-sm ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function BadgeDot({ variant = "default" }: { variant?: BadgeVariant }) {
  const dotStyles: Record<BadgeVariant, string> = {
    default: "bg-text-secondary",
    accent: "bg-accent",
    secondary: "bg-secondary",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    destructive: "bg-destructive",
  };

  return (
    <span
      className={`inline-block w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`}
    />
  );
}
