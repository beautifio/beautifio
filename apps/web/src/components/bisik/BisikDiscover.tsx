"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { swipeLeft, swipeRight, getDiscoverCards } from "@/lib/bisik/swipe-actions"
import BisikCard from "./BisikCard"
import type { BisikQueueCard } from "@/lib/bisik/swipe-actions"
import type { BisikCategory } from "@/lib/bisik/actions"

export default function BisikDiscover({
  initialCards,
  myQueueId,
  category,
}: {
  initialCards: BisikQueueCard[]
  myQueueId: string
  category: BisikCategory
}) {
  const [cards, setCards] = useState(initialCards)
  const [isMatching, setIsMatching] = useState(false)
  const [matchedNickname, setMatchedNickname] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const loadMore = async () => {
    const fresh = await getDiscoverCards(category)
    setCards(prev => [...prev, ...fresh])
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
      await swipeLeft(current.id)
      setCards(prev => prev.slice(1))
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
      const { sessionId } = await swipeRight(current.id, myQueueId)
      setMatchedNickname(current.nickname)
      setTimeout(() => {
        router.push(`/bisik/${sessionId}`)
      }, 2000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : ""
      if (message === "ALREADY_MATCHED") {
        setCards(prev => prev.slice(1))
        setIsMatching(false)
      } else {
        setError("Gagal, coba lagi")
        setIsMatching(false)
      }
    }
  }

  if (isMatching) {
    return (
      <div
        className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-3"
        style={{ background: "linear-gradient(160deg, #FDF0F5, #FBEAF0)" }}
      >
        <div className="w-16 h-16 rounded-full bg-pink-500 flex items-center justify-center mb-2">
          <Heart className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-lg font-semibold text-pink-900">Cocok!</h2>
        <p className="text-sm text-pink-700">{matchedNickname} siap ngobrol</p>
        <p className="text-xs text-pink-400 mt-2">Membuka ruang ngobrol...</p>
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 px-6 text-center gap-4">
        <p className="text-2xl">😴</p>
        <p className="text-sm font-medium">Tidak ada yang menunggu sekarang</p>
        <p className="text-xs text-text-secondary">
          Coba lagi beberapa menit lagi, atau kamu yang duluan menunggu di antrian
        </p>
        <button
          onClick={() => router.push("/bisik")}
          className="mt-2 bg-primary text-white rounded-full px-6 py-2 text-sm"
        >
          Kembali
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 px-4 pb-6">
      <div className="flex items-center justify-between py-3">
        <div>
          <p className="text-sm font-medium capitalize">{category}</p>
          <p className="text-xs text-text-secondary">
            {cards.length} orang menunggu · swipe kanan untuk ngobrol
          </p>
        </div>
      </div>

      <div className="relative flex-1 min-h-[320px]">
        {cards.slice(0, 2).reverse().map((card, i) => (
          <BisikCard
            key={card.id}
            card={card}
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
