import type { ReactNode } from "react";

type Tone = "laut" | "langit" | "fajar" | "senja" | "success" | "danger";
type Size = "sm" | "md" | "lg";

const toneStyles: Record<Tone, string> = {
  laut: "bg-gradient-to-b from-laut-50 to-laut-100 text-laut-700 ring-laut-700/10",
  langit: "bg-gradient-to-b from-[#EEF8FC] to-langit-soft text-laut-600 ring-langit/30",
  fajar: "bg-gradient-to-b from-[#FFF8E9] to-fajar-soft text-[#9A6300] ring-fajar/30",
  senja: "bg-gradient-to-b from-[#FFF3EE] to-[#FDE4DA] text-[#B2532F] ring-senja/30",
  success: "bg-gradient-to-b from-[#F0FAF5] to-success-soft text-success ring-success/20",
  danger: "bg-gradient-to-b from-[#FEF3F3] to-danger-soft text-danger ring-danger/20",
};

const sizeStyles: Record<Size, string> = {
  sm: "w-9 h-9 rounded-md [&_svg]:w-[18px] [&_svg]:h-[18px]",
  md: "w-11 h-11 rounded-lg [&_svg]:w-5 [&_svg]:h-5",
  lg: "w-14 h-14 rounded-lg [&_svg]:w-6 [&_svg]:h-6",
};

/** Two-tone icon container — replaces ad-hoc colored circles. */
export function IconTile({
  tone = "laut",
  size = "md",
  className = "",
  children,
}: {
  tone?: Tone;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ring-1 ring-inset shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(3,24,42,0.06)] ${toneStyles[tone]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}
