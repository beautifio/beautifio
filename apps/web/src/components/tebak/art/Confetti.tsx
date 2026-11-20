"use client"

import { useMemo } from "react"

const COLORS = ["#FFC64F", "#6BB9D4", "#3DDC97", "#FF7A6B", "#EAF6FB"]

/** Ledakan confetti CSS-only, sekali jalan (~1.4 dtk). Mati otomatis saat prefers-reduced-motion. */
export function Confetti({ pieces = 16, seed = 1 }: { pieces?: number; seed?: number }) {
  const items = useMemo(() => {
    let s = seed * 9301 + 49297
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
    return Array.from({ length: pieces }, (_, i) => ({
      left: 6 + rnd() * 88,
      dx: (rnd() - 0.5) * 120,
      rot: 360 + rnd() * 540,
      delay: rnd() * 0.25,
      dur: 1.1 + rnd() * 0.5,
      color: COLORS[i % COLORS.length],
      round: rnd() > 0.5,
      w: 6 + rnd() * 5,
    }))
  }, [pieces, seed])

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible z-20" aria-hidden>
      {items.map((p, i) => (
        <span
          key={i}
          className="tb-confetti-piece absolute top-0 block"
          style={{
            left: `${p.left}%`,
            width: p.w,
            height: p.round ? p.w : p.w * 1.6,
            borderRadius: p.round ? 999 : 2,
            background: p.color,
            opacity: 0,
            animation: `tb-confetti ${p.dur}s cubic-bezier(0.2, 0.6, 0.4, 1) ${p.delay}s forwards`,
            ["--tb-dx" as string]: `${p.dx}px`,
            ["--tb-rot" as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}
