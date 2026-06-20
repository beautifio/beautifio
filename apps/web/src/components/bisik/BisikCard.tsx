"use client"

import { X, Heart } from "lucide-react"

interface BisikCardProps {
  card: {
    id: string
    content: string
    topic: { name: string; emoji: string }
    created_at: string
    swipe_count: number
  }
  onSwipeLeft: () => void
  onSwipeRight: () => void
  isTop: boolean
}

export default function BisikCard({ card, onSwipeLeft, onSwipeRight, isTop }: BisikCardProps) {
  const minutesAgo = Math.floor(
    (Date.now() - new Date(card.created_at).getTime()) / 60000,
  )

  return (
    <div
      className={`absolute inset-0 rounded-2xl p-5 flex flex-col select-none transition-transform`}
      style={{
        background: "#F8FAFC",
        border: "1.5px solid #E2E8F0",
        zIndex: isTop ? 10 : 5,
        transform: isTop ? "none" : "scale(0.95) translateY(8px)",
      }}
    >
      <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full self-start mb-3">
        {card.topic.emoji} {card.topic.name}
      </span>

      <p className="text-sm text-text-primary leading-relaxed italic mb-4">
        &ldquo;{card.content}&rdquo;
      </p>

      <div className="mt-auto flex items-center justify-between text-xs text-text-secondary">
        <span>Anonymous</span>
        <span>{minutesAgo < 1 ? "Baru saja" : `${minutesAgo} menit lalu`}</span>
      </div>

      {isTop && (
        <div className="flex justify-center gap-6 mt-5">
          <button
            onClick={onSwipeLeft}
            className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center cursor-pointer"
            aria-label="Lewati"
          >
            <X className="w-6 h-6 text-red-400" />
          </button>
          <button
            onClick={onSwipeRight}
            className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer"
            aria-label="Ngobrol"
          >
            <Heart className="w-6 h-6 text-primary" />
          </button>
        </div>
      )}
    </div>
  )
}
