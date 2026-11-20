"use client"

import { useBranding } from "@/hooks/use-branding"

/** Admin-uploaded logo, rendered raw (no filters/backgrounds). Text wordmark until it loads. */
export function BrandLogo({
  variant = "horizontal",
  className = "",
  wordmarkClassName = "text-white",
}: {
  variant?: "horizontal" | "square"
  className?: string
  wordmarkClassName?: string
}) {
  const b = useBranding()
  const src = variant === "square" ? b.logoSquare || b.logoHorizontal : b.logoHorizontal
  if (src) {
    return <img src={src} alt="Beautifio" className={`w-auto object-contain ${className}`} />
  }
  return (
    <span className={`font-display font-bold tracking-[-0.03em] text-[26px] leading-none ${wordmarkClassName}`}>
      beautifio
    </span>
  )
}
