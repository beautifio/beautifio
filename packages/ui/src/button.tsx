import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "fajar"
  | "ghost"
  | "glass"
  | "destructive"
  | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-laut-700 text-white shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_6px_16px_-6px_rgba(8,68,99,0.55)] hover:bg-laut-600 active:bg-laut-800",
  secondary:
    "bg-white text-laut-700 border border-laut-700/20 shadow-xs hover:border-laut-700/40 hover:bg-laut-50 active:bg-laut-100",
  accent:
    "bg-fajar text-laut-950 shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_6px_16px_-6px_rgba(242,163,27,0.6)] hover:bg-[#FFC866] active:bg-fajar-deep",
  fajar:
    "bg-fajar text-laut-950 shadow-glow-fajar hover:bg-[#FFC866] active:bg-fajar-deep",
  ghost: "text-tinta hover:bg-laut-50 active:bg-laut-100",
  glass:
    "text-white bg-white/10 border border-white/15 backdrop-blur-md hover:bg-white/15 active:bg-white/20",
  destructive:
    "bg-danger text-white shadow-[0_6px_16px_-6px_rgba(217,71,75,0.55)] hover:bg-danger/90 active:bg-danger/80",
  danger:
    "bg-danger text-white shadow-[0_6px_16px_-6px_rgba(217,71,75,0.55)] hover:bg-danger/90 active:bg-danger/80",
};

const sizeStyles: Record<Size, string> = {
  sm: "h-9 px-4 text-xs gap-1.5 rounded-md",
  md: "h-11 px-5 text-sm gap-2 rounded-md",
  lg: "h-13 px-7 text-[15px] gap-2.5 rounded-lg",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  disabled,
  loading,
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-display font-semibold tracking-[-0.005em] cursor-pointer select-none transition-[transform,background-color,box-shadow,border-color] duration-150 ease-out-expo active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span
          aria-hidden
          className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
        />
      ) : null}
      {children}
    </button>
  );
}
