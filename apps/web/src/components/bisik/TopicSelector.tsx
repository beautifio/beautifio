"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { enterBisikQueue } from "@/lib/bisik/swipe-actions"
import type { BisikCategory, BisikMood } from "@/lib/bisik/actions"

const CATEGORIES = [
  { value: "karir" as BisikCategory, label: "💼 Karir" },
  { value: "keluarga" as BisikCategory, label: "👨‍👩‍👧 Keluarga" },
  { value: "percintaan" as BisikCategory, label: "💕 Percintaan" },
  { value: "pendidikan" as BisikCategory, label: "📚 Pendidikan" },
  { value: "kesehatan_mental" as BisikCategory, label: "🧠 Mental" },
  { value: "keuangan" as BisikCategory, label: "💰 Keuangan" },
]

const MOODS = [
  { value: "didengar" as BisikMood, label: "🗣 Mau cerita / didengar" },
  { value: "mendengarkan" as BisikMood, label: "👂 Siap mendengarkan" },
  { value: "keduanya" as BisikMood, label: "🤝 Keduanya oke" },
]

export default function TopicSelector() {
  const router = useRouter()
  const [category, setCategory] = useState<BisikCategory | null>(null)
  const [mood, setMood] = useState<BisikMood | null>(null)
  const [hint, setHint] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!category || !mood) return
    setSubmitting(true)
    setError("")
    try {
      const { queueId } = await enterBisikQueue(category, mood, hint.trim() || undefined)
      router.push(`/bisik/discover?queueId=${queueId}&category=${category}`)
    } catch {
      setError("Gagal masuk antrian. Coba lagi.")
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <div>
        <h1 className="text-base font-medium">Bisik</h1>
        <p className="text-xs text-text-secondary mt-1">Mau ngobrol tentang apa?</p>
      </div>

      <section>
        <p className="text-xs font-medium text-primary mb-2">TOPIK</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-xl py-3 px-3 text-xs text-left border transition-colors ${
                category === cat.value
                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                  : "border-border"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-medium text-primary mb-2">POSISI KAMU</p>
        <div className="flex flex-col gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => setMood(m.value)}
              className={`rounded-xl py-3 px-4 text-xs text-left border transition-colors ${
                mood === m.value
                  ? "bg-primary/10 border-primary/30 text-primary font-medium"
                  : "border-border"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <p className="text-xs font-medium text-primary mb-2">
          HINT TOPIK{" "}
          <span className="font-normal text-text-secondary">
            (opsional, maks 60 karakter)
          </span>
        </p>
        <input
          type="text"
          maxLength={60}
          value={hint}
          onChange={e => setHint(e.target.value)}
          placeholder="Contoh: soal interview kerja besok..."
          className="w-full rounded-xl bg-muted px-4 py-3 text-xs border-none outline-none"
        />
        <p className="text-right text-xs text-text-secondary mt-1">{hint.length}/60</p>
      </section>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!category || !mood || submitting}
        className="w-full bg-primary text-white rounded-full py-3 text-sm font-medium disabled:opacity-40"
      >
        {submitting ? "Memproses..." : "Cari lawan ngobrol →"}
      </button>
    </div>
  )
}
