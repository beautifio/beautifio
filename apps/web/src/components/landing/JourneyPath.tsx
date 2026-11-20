"use client"

import { useEffect, useRef, useState } from "react"
import { Check } from "lucide-react"
import styles from "./landing.module.css"

const STEPS = [
  { label: "Mimpi", title: "Jadi desainer produk" },
  { label: "Big Win", title: "Tingkat Pemula: kuasai dasar desain visual" },
  { label: "Small Win", title: "Selesaikan tiga latihan layout" },
  { label: "Aktivitas hari ini", title: "3 dari 6 aktivitas", tasks: [
    { text: "Tonton satu materi tipografi, 15 menit", done: true },
    { text: "Sketsa satu layar aplikasi favoritmu", done: false },
    { text: "Tulis refleksi singkat di Cerita", done: false },
  ] },
]

/** Steps light up one by one as the reader scrolls past them. */
export function JourneyPath() {
  const listRef = useRef<HTMLOListElement>(null)
  const [lit, setLit] = useState(-1)

  useEffect(() => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-step]") ?? [])
    if (!items.length) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || typeof IntersectionObserver === "undefined") {
      setLit(items.length - 1)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const i = Number((e.target as HTMLElement).dataset.step)
            setLit((cur) => Math.max(cur, i))
          }
        })
      },
      { rootMargin: "0px 0px -30% 0px", threshold: 0.35 }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const progress = lit <= 0 ? 0 : lit / (STEPS.length - 1)

  return (
    <div className="surface-raised relative rounded-2xl p-5 md:p-7">
      <p className="text-xs font-medium text-kabut">Contoh Journey</p>
      <ol ref={listRef} className="relative mt-5" style={{ ["--rail" as string]: progress }}>
        {/* rail: base + lit fill */}
        <span aria-hidden className="absolute bottom-6 left-[17px] top-4 w-0.5 rounded-full bg-garis" />
        <span aria-hidden className={`${styles.rail} absolute bottom-6 left-[17px] top-4 w-0.5 rounded-full bg-gradient-to-b from-fajar to-fajar-deep`} />
        {STEPS.map((s, i) => (
          <li
            key={s.label}
            data-step={i}
            className={`relative flex gap-4 pb-7 last:pb-0 ${i <= lit ? styles.stepLit : styles.stepDim}`}
          >
            <span
              className={`${styles.stepNode} relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-garis bg-white font-display text-sm font-semibold text-kabut shadow-xs`}
            >
              {i + 1}
            </span>
            <div className={`${styles.stepCard} min-w-0 flex-1 pt-1`}>
              <p className="text-xs font-semibold text-kabut">{s.label}</p>
              <p className="mt-0.5 font-display text-[17px] font-semibold leading-snug text-tinta">{s.title}</p>
              {s.tasks && (
                <ul className="mt-3 space-y-2">
                  {s.tasks.map((t) => (
                    <li key={t.text} className="flex items-center gap-3 rounded-lg border border-garis bg-embun/60 px-3 py-2.5 text-sm text-tinta">
                      <span
                        aria-hidden
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          t.done ? "border-success bg-success text-white" : "border-kabut/40 bg-white"
                        }`}
                      >
                        {t.done && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      <span className={t.done ? "text-kabut line-through decoration-kabut/40" : ""}>{t.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
