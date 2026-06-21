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
      await swipeLeft(userId, current.id, current.user_id)
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

      // Mutual match — trigger handles chat creation, realtime will show popup
      setMatchedNickname("")
    } catch {
      setError("Gagal, coba lagi")
      setIsMatching(false)
    }
  }

  if (showLimitModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={() => setShowLimitModal(false)} />
        <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-24 animate-in slide-in-from-bottom">
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

      {/* Card stack */}
      <div style={{
        position: "relative",
        width: "100%", maxWidth: 380,
        height: 480,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
      }}>
        {cards.slice(0, 2).map((card, i) => {
          if (i === 0) {
            return (
              <BisikCard
                key={card.id}
                card={{
                  id: card.id,
                  content: card.content,
                  topic: card.topic ?? { name: "Topik", emoji: "💬" },
                  created_at: card.created_at,
                  owner_name: "",
                }}
                isTop={true}
                onSwipeLeft={handleLeft}
                onSwipeRight={handleRight}
              />
            )
          }
          return (
            <div key={card.id} style={{
              position: "absolute",
              width: "100%", maxWidth: 380,
              height: 480,
              transform: "scale(0.94) translateY(10px)",
              zIndex: 2,
              opacity: 0.8,
            }}>
              <BisikCard
                card={{
                  id: card.id,
                  content: card.content,
                  topic: card.topic ?? { name: "Topik", emoji: "💬" },
                  created_at: card.created_at,
                  owner_name: "",
                }}
                isTop={false}
                stackOffset={10}
                stackScale={0.94}
                onSwipeLeft={() => {}}
                onSwipeRight={() => {}}
              />
            </div>
          )
        })}
      </div>

      {/* Action buttons */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 32,
        marginTop: 32,
      }}>
        <button
          onClick={handleLeft}
          style={{
            width: 64, height: 64,
            borderRadius: "50%",
            background: "#FFFFFF",
            border: "2px solid #E2E8F0",
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 24,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(239,68,68,0.3)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
        >
          ✕
        </button>
        <button
          onClick={handleRight}
          style={{
            width: 80, height: 80,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #084463, #0E7490)",
            border: "none",
            boxShadow: "0 8px 24px rgba(8,68,99,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", fontSize: 32,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"}
        >
          ❤️
        </button>
      </div>
      <div style={{
        display: "flex", justifyContent: "center",
        gap: 80, marginTop: 8,
      }}>
        <span style={{ fontSize: 11, color: "#647488", fontFamily: "Inter" }}>Lewati</span>
        <span style={{ fontSize: 11, color: "#647488", fontFamily: "Inter" }}>Dengerin</span>
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center mt-2">{error}</p>
      )}
    </div>
  )
}
