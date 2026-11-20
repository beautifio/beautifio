"use client"

import { useEffect } from "react"

/**
 * Drives the landing page's depth: pointer parallax (--px/--py, -1..1),
 * hero scroll offset (--sy, px) and sunrise-seam progress (--seam, 0..1).
 * Writes CSS variables on #landing only; everything else is pure CSS.
 */
export function LandingMotion() {
  useEffect(() => {
    const root = document.getElementById("landing")
    if (!root) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) {
      root.style.setProperty("--seam", "1")
      return
    }
    const fine = window.matchMedia("(pointer: fine)").matches
    const seam = document.getElementById("sunrise-seam")

    let tx = 0, ty = 0, cx = 0, cy = 0
    let raf = 0
    let running = false

    const tick = () => {
      cx += (tx - cx) * 0.08
      cy += (ty - cy) * 0.08
      root.style.setProperty("--px", cx.toFixed(4))
      root.style.setProperty("--py", cy.toFixed(4))
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        raf = requestAnimationFrame(tick)
      } else {
        running = false
      }
    }
    const kick = () => {
      if (!running) { running = true; raf = requestAnimationFrame(tick) }
    }
    const onPointer = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1
      ty = (e.clientY / window.innerHeight) * 2 - 1
      kick()
    }

    let scrollRaf = 0
    const onScroll = () => {
      if (scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        const y = window.scrollY
        if (y < window.innerHeight * 1.2) root.style.setProperty("--sy", y.toFixed(1))
        if (seam) {
          const r = seam.getBoundingClientRect()
          const vh = window.innerHeight
          const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.75 + r.height * 0.4)))
          root.style.setProperty("--seam", p.toFixed(3))
        }
      })
    }

    if (fine) window.addEventListener("pointermove", onPointer, { passive: true })
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener("pointermove", onPointer)
      window.removeEventListener("scroll", onScroll)
      cancelAnimationFrame(raf)
      cancelAnimationFrame(scrollRaf)
    }
  }, [])
  return null
}
