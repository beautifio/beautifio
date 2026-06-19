"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, MessageSquare, ArrowLeft, Smile } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { joinBisikQueue } from "@/lib/bisik/actions"
import { BisikWaiting } from "@/components/bisik/BisikWaiting"
import { CategoryPicker } from "@/components/bisik/CategoryPicker"
import { MoodCheck } from "@/components/bisik/MoodCheck"
import type { BisikCategory, BisikMood } from "@/lib/bisik/actions"

export default function BisikWaitingPage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) router.replace("/login")
  }, [user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="bg-surface border-b border-border">
        <div className="max-w-content mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-text-primary">Mencari Teman</h1>
            <p className="text-xs text-text-secondary">Bisik anonim</p>
          </div>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Smile size={40} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">Sabar, ya!</h2>
          <p className="text-sm text-text-secondary mb-2">Kami sedang mencari teman bicara yang cocok</p>
          <p className="text-xs text-text-secondary/50 mb-8">Biasanya tidak butuh waktu lama</p>
          <button
            onClick={() => router.push("/bisik")}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  )
}
