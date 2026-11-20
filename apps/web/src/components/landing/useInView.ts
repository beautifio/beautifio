"use client"

import { useEffect, useRef, useState } from "react"

/** True once the element has scrolled into view (stays true). */
export function useInView<T extends Element>(rootMargin = "0px 0px -20% 0px") {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setSeen(true); io.disconnect() } },
      { rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, seen])
  return { ref, seen }
}
