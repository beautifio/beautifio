"use client"

import { useBranding } from "@/hooks/use-branding"
import styles from "./landing.module.css"

/** Desktop: admin hero photo in a floating, pointer-tilted frame standing in front of the hills. */
export function HeroPhotoFrame({ className = "" }: { className?: string }) {
  const b = useBranding()
  const src = b.heroImageMobile || b.heroImage
  if (!src) return null
  return (
    <div className={`${styles.photoEnter} ${className}`}>
      <div
        className={`${styles.photoFrame} relative mx-auto w-full max-w-[380px] aspect-[4/5] rounded-2xl overflow-hidden ring-1 ring-white/15 shadow-2xl`}
      >
        <img src={src} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        {/* dawn light falling on the photo + glass edge */}
        <div className="absolute inset-0 bg-gradient-to-t from-laut-950/70 via-transparent to-fajar/10" />
        <div className="absolute inset-0 rounded-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
      </div>
    </div>
  )
}

/** Mobile: the same photo as a tinted layer high in the sky, fading into night. */
export function HeroPhotoBackdrop() {
  const b = useBranding()
  const src = b.heroImageMobile || b.heroImage
  if (!src) return null
  return (
    <div
      aria-hidden
      className="md:hidden absolute inset-x-0 top-0 h-[78%] opacity-35 mix-blend-luminosity"
      style={{
        maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 85%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 85%)",
      }}
    >
      <img src={src} alt="" fetchPriority="high" className="h-full w-full object-cover" />
    </div>
  )
}
