import type { HTMLAttributes, ReactNode } from "react";

type Elevation = "flat" | "raised" | "floating";
type Tone = "light" | "deep" | "glass" | "glass-dark";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
  elevation?: Elevation;
  tone?: Tone;
  interactive?: boolean;
  children: ReactNode;
}

const paddingStyles = {
  none: "p-0",
  sm: "p-4",
  md: "p-5",
  lg: "p-7",
};

const toneStyles: Record<Tone, string> = {
  light: "bg-card text-card-foreground border border-laut-700/[0.07]",
  deep: "surface-deep grain text-white",
  glass: "surface-glass text-tinta",
  "glass-dark": "surface-glass-dark text-white",
};

const elevationStyles: Record<Elevation, string> = {
  flat: "shadow-none",
  raised: "shadow-sm",
  floating: "shadow-lg",
};

export function Card({
  padding = "md",
  elevation = "raised",
  tone = "light",
  interactive = false,
  className = "",
  children,
  ...props
}: CardProps) {
  // deep/glass tones carry their own shadow; only apply elevation to light
  const elev = tone === "light" ? elevationStyles[elevation] : "";
  const inter = interactive
    ? "cursor-pointer transition-[transform,box-shadow] duration-200 ease-out-expo hover:shadow-md active:scale-[0.99]"
    : "";
  return (
    <div
      className={`rounded-xl ${toneStyles[tone]} ${elev} ${inter} ${paddingStyles[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col gap-1 mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`font-display text-base font-semibold text-tinta ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm leading-relaxed text-kabut ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}
