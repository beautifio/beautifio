"use client"

import { useState } from "react"
import { Star, X } from "lucide-react"

type Props = {
  sessionId: string
  officerName?: string
  onClose: () => void
}

export function SurveyPopup({ sessionId, officerName, onClose }: Props) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")

  const needsComment = rating > 0 && rating <= 3

  const handleSubmit = async () => {
    if (!rating) return
    if (needsComment && !comment.trim()) {
      setError("Mohon ceritakan alasannya ya kak...")
      return
    }
    setSubmitting(true)
    setError("")
    try {
      const res = await fetch("/api/care/sessions/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, rating, comment: comment.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal")
      setDone(true)
      setTimeout(onClose, 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-surface rounded-t-2xl px-6 pt-6 pb-10 max-w-content w-full animate-in slide-in-from-bottom" onClick={e => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">❤️</p>
            <p className="text-sm font-bold text-text-primary">Terima kasih!</p>
            <p className="text-xs text-text-secondary mt-1">Masukanmu membantu kami lebih baik.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-text-primary">
                {needsComment ? "Apa yang bisa kami perbaiki?" : "Bagaimana pengalamanmu?"}
              </p>
              <button onClick={onClose} className="text-text-secondary/50 cursor-pointer"><X size={16} /></button>
            </div>

            {officerName && (
              <p className="text-xs text-text-secondary mb-3">dengan Kak {officerName}</p>
            )}

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  className="text-3xl cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={n <= (hover || rating) ? "fill-accent text-accent" : "text-border"}
                  />
                </button>
              ))}
            </div>

            {rating > 3 && (
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Ada masukan? (opsional)"
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm resize-none outline-none focus:border-primary mb-3"
              />
            )}

            {needsComment && (
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Mohon ceritakan alasannya ya kak..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-border bg-bg text-sm resize-none outline-none focus:border-primary mb-3"
              />
            )}

            {error && <p className="text-xs text-danger mb-2">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={!rating || submitting}
              className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Mengirim..." : "Kirim"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
