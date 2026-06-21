import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-[#063650] shadow-[0_2px_8px_rgba(8,68,99,0.25)] active:shadow-none rounded-xl",
  secondary:
    "border-[1.5px] border-primary text-primary hover:bg-primary/5 active:bg-primary/10 rounded-xl",
  accent:
    "bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80 shadow-sm active:shadow-none",
  ghost:
    "hover:bg-muted active:bg-muted/80 text-text-primary",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/80 rounded-xl",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-xs gap-1.5",
  md: "h-11 px-6 text-sm gap-2",
  lg: "h-13 px-8 text-sm gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  loading,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
