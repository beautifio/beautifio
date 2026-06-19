"use client"

import { X, Heart } from "lucide-react"
import type { BisikQueueCard } from "@/lib/bisik/swipe-actions"

interface BisikCardProps {
  card: BisikQueueCard
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
}

const MOOD_LABEL: Record<string, string> = {
  didengar: "🗣 Mau cerita",
  mendengarkan: "👂 Siap mendengarkan",
  keduanya: "🤝 Keduanya oke",
}

export default function BisikCard({ card, onSwipeLeft, onSwipeRight, isTop }: BisikCardProps) {
  const minutesAgo = Math.floor(
    (Date.now() - new Date(card.created_at).getTime()) / 60000,
  )

  return (
    <div
      className={`absolute inset-0 rounded-2xl p-5 flex flex-col select-none transition-transform`}
      style={{
        background: "#FBEAF0",
        border: "1.5px solid #F4C0D1",
        zIndex: isTop ? 10 : 5,
        transform: isTop ? "none" : "scale(0.95) translateY(8px)",
      }}
    >
      <span className="inline-flex items-center gap-1 text-xs bg-pink-200 text-pink-700 px-2 py-0.5 rounded-full self-start mb-3">
        🔒 Anonim
      </span>

      <h2 className="text-xl font-semibold text-pink-900 mb-1">{card.nickname}</h2>
      <p className="text-sm text-pink-700 mb-1">{MOOD_LABEL[card.mood_check]}</p>
      <span className="text-xs bg-white/60 text-pink-600 px-2 py-0.5 rounded-full self-start mb-3">
        {card.category}
      </span>

      {card.topic_hint && (
        <div className="bg-white/60 rounded-xl p-3 text-xs text-pink-800 italic mt-auto mb-4">
          &ldquo;{card.topic_hint}&rdquo;
        </div>
      )}

      <p className="text-xs text-pink-400 mt-auto">
        Menunggu {minutesAgo < 1 ? "baru saja" : `${minutesAgo} menit lalu`}
      </p>

      {isTop && (
        <div className="flex justify-center gap-6 mt-5">
          <button
            onClick={onSwipeLeft}
            className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center"
            aria-label="Lewati"
          >
            <X className="w-6 h-6 text-red-400" />
          </button>
          <button
            onClick={onSwipeRight}
            className="w-14 h-14 rounded-full bg-pink-100 flex items-center justify-center"
            aria-label="Ngobrol"
          >
            <Heart className="w-6 h-6 text-pink-500" />
          </button>
        </div>
      )}
    </div>
  )
}
