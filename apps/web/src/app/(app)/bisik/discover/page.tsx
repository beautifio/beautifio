"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getDiscoverCards } from "@/lib/bisik/swipe-actions"
import BisikDiscover from "@/components/bisik/BisikDiscover"
import type { BisikQueueCard } from "@/lib/bisik/swipe-actions"
import type { BisikCategory } from "@/lib/bisik/actions"

export default function BisikDiscoverPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [cards, setCards] = useState<BisikQueueCard[]>([])
  const [loading, setLoading] = useState(true)

  const queueId = searchParams.get("queueId")
  const category = searchParams.get("category") as BisikCategory

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace("/login"); return }
    if (!queueId || !category) { router.replace("/bisik"); return }

    getDiscoverCards(category).then(data => {
      setCards(data)
      setLoading(false)
    })
  }, [user, isLoading, queueId, category, router])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-bg pb-24 flex flex-col">
      <BisikDiscover
        initialCards={cards}
        myQueueId={queueId!}
        category={category!}
      />
    </main>
  )
}
