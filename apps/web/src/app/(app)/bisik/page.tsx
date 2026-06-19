"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Shield, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { joinBisikQueue } from "@/lib/bisik/actions"
import { CategoryPicker } from "@/components/bisik/CategoryPicker"
import { MoodCheck } from "@/components/bisik/MoodCheck"
import type { BisikCategory, BisikMood } from "@/lib/bisik/actions"

export default function BisikPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [step, setStep] = useState<"category" | "mood" | "joining">("category")
  const [category, setCategory] = useState<BisikCategory | null>(null)
  const [mood, setMood] = useState<BisikMood | null>(null)
  const [error, setError] = useState("")

  const handleCategorySelect = (cat: string) => {
    setCategory(cat as BisikCategory)
    setStep("mood")
  }

  const handleMoodSelect = async (m: BisikMood) => {
    setMood(m)
    setStep("joining")
    setError("")
    try {
      const { sessionId } = await joinBisikQueue(category!, m)
      router.push(`/bisik/${sessionId}`)
    } catch (e) {
      setError("Gagal bergabung. Coba lagi.")
      setStep("mood")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="bg-surface border-b border-border">
        <div className="max-w-content mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-text-primary">Bisik</h1>
          <p className="text-xs text-text-secondary mt-0.5">Ngobrol anonim dengan teman baru</p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6 space-y-6">
        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Shield size={18} className="text-primary" />
          </div>
          <div className="text-xs text-text-secondary leading-relaxed">
            <span className="font-semibold text-text-primary">Anonim & Aman.</span> Identitasmu tidak akan ditampilkan. Jika ada yang tidak nyaman, kamu bisa melaporkan kapan saja.
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === "category" && <CategoryPicker onSelect={handleCategorySelect} />}
        {step === "mood" && <MoodCheck onSelect={handleMoodSelect} />}

        {step === "joining" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-sm text-text-secondary">Menghubungkan...</p>
          </div>
        )}
      </div>
    </div>
  )
}
