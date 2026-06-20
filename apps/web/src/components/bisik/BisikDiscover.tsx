"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, Crown, X } from "lucide-react"
import { swipeLeft, swipeRight, getDiscoverCards } from "@/lib/bisik/swipe-actions"
import BisikCard from "./BisikCard"
import type { BisikCard as BisikCardType } from "@/lib/bisik/swipe-actions"

export default function BisikDiscover({
  userId,
  topicIds,
}: {
  userId: string
  topicIds: string[]
}) {
  const [cards, setCards] = useState<BisikCardType[]>([])
  const [isMatching, setIsMatching] = useState(false)
  const [matchedNickname, setMatchedNickname] = useState("")
  const [error, setError] = useState("")
  const [showLimitModal, setShowLimitModal] = useState(false)
  const [maxAllowed, setMaxAllowed] = useState(5)
  const router = useRouter()

  const loadMore = async () => {
    const fresh = await getDiscoverCards(userId, topicIds)
    setCards((prev) => [...prev, ...fresh])
  }

  useEffect(() => {
    if (cards.length === 0 && !isMatching) {
      loadMore()
    }
  }, [cards.length, isMatching])

  const handleLeft = async () => {
    const current = cards[0]
    if (!current) return
    setError("")
    try {
      await swipeLeft(userId, current.id)
      setCards((prev) => prev.slice(1))
    } catch {
      setError("Gagal, coba lagi")
    }
  }

  const handleRight = async () => {
    const current = cards[0]
    if (!current) return
    setIsMatching(true)
    setError("")

    try {
      const result = await swipeRight(userId, current)

      if (result.error === "CHAT_LIMIT_REACHED") {
        setMaxAllowed(result.maxAllowed ?? 5)
        setShowLimitModal(true)
        setIsMatching(false)
        return
      }

      if (result.chatId) {
        setMatchedNickname("")
        setTimeout(() => {
          router.push(`/bisik/chat/${result.chatId}`)
        }, 1500)
      }
    } catch {
      setError("Gagal, coba lagi")
      setIsMatching(false)
    }
  }

  if (showLimitModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowLimitModal(false)} />
        <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <Crown size={22} className="text-amber-500" />
            </div>
            <h3 className="text-base font-bold text-text-primary">Batas Obrolan Aktif</h3>
            <p className="text-sm text-text-secondary mt-1">
              Kamu sudah punya {maxAllowed} obrolan aktif. Upgrade ke Pro untuk lebih banyak obrolan.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowLimitModal(false)}
              className="flex-1 py-3 rounded-xl border border-border text-text-primary font-medium text-sm hover:bg-muted transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={() => router.push("/bisik/upgrade")}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors cursor-pointer"
            >
              Upgrade ke Pro
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isMatching) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-3"
        style={{ background: "linear-gradient(160deg, #F0F9FF, #E0F2FE)" }}
      >
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-2">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-text-primary">Cocok!</h2>
        <p className="text-sm text-text-secondary">Kamu siap ngobrol</p>
        <p className="text-xs text-text-secondary mt-2">Membuka ruang ngobrol...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
        <p className="text-2xl">😴</p>
        <p className="text-sm font-medium text-text-primary">Tidak ada kartu baru</p>
        <p className="text-xs text-text-secondary">
          Belum ada orang yang posting dengan topik ini. Coba topik lain atau kembali lagi nanti.
        </p>
        <button
          onClick={() => router.push("/bisik")}
          className="mt-2 bg-primary text-white rounded-full px-6 py-2 text-sm cursor-pointer"
        >
          Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-4 pb-6">
      <div className="flex items-center justify-between py-3">
        <p className="text-xs text-text-secondary">
          {cards.length} kartu tersedia · swipe kanan untuk ngobrol
        </p>
      </div>

      <div className="relative flex-1 min-h-[360px]">
        {cards.slice(0, 2).reverse().map((card, i) => (
          <BisikCard
            key={card.id}
            card={{
              id: card.id,
              content: card.content,
              topic: card.topic ?? { name: "Topik", emoji: "💬" },
              created_at: card.created_at,
              swipe_count: card.swipe_count,
            }}
            isTop={i === Math.min(cards.length, 2) - 1}
            onSwipeLeft={handleLeft}
            onSwipeRight={handleRight}
          />
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center mt-2">{error}</p>
      )}

      <p className="text-xs text-text-secondary text-center mt-4">
        ← Lewati &nbsp;&nbsp; Ngobrol →
      </p>
    </div>
  )
}
