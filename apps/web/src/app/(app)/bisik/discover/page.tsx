"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getDiscoverCards } from "@/lib/bisik/swipe-actions"
import BisikDiscover from "@/components/bisik/BisikDiscover"
import type { BisikCard } from "@/lib/bisik/swipe-actions"

export default function DiscoverPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100svh",
          }}
        >
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      }
    >
      <BisikDiscoverWrapper />
    </Suspense>
  )
}

function BisikDiscoverWrapper() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [cards, setCards] = useState<BisikCard[]>([])
  const [loading, setLoading] = useState(true)

  const topicIdsStr = searchParams.get("topicIds")
  const topicIds = topicIdsStr ? topicIdsStr.split(",") : []

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (topicIds.length === 0) {
      router.replace("/bisik")
      return
    }

    getDiscoverCards(user.id, topicIds).then((data) => {
      setCards(data)
      setLoading(false)
    })
  }, [user, isLoading, topicIds, router])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-bg pb-24 flex flex-col">
      <BisikDiscover userId={user!.id} topicIds={topicIds} />
    </main>
  )
}
