"use client"

import { Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import TopicSelector from "@/components/bisik/TopicSelector"

export default function BisikPage() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-bg pb-24">
      <TopicSelector />
    </main>
  )
}
