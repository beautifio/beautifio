"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, HelpCircle, ArrowRight, Loader2, Check, X, Trophy } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { joinTebakQueue } from "@/lib/tebak/actions"

export default function TebakPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")

  const handleStart = async () => {
    setJoining(true)
    setError("")
    try {
      const { sessionId } = await joinTebakQueue()
      router.push(`/tebak/${sessionId}`)
    } catch (e) {
      setError("Gagal bergabung. Coba lagi.")
      setJoining(false)
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
          <h1 className="text-xl font-bold text-text-primary">Tebak Aku</h1>
          <p className="text-xs text-text-secondary mt-0.5">Seberapa kenal kamu dengan lawan bicaramu?</p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="flex flex-col items-center py-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users size={48} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary text-center mb-2">
            Seru-seruan tebak-tebakan!
          </h2>
          <p className="text-sm text-text-secondary text-center max-w-xs">
            Setiap pemain menjawab 5 pertanyaan tentang diri mereka, lalu lawan harus menebak jawabannya.
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Cara bermain:</h3>
          <div className="space-y-2.5">
            {[
              "Setiap pemain mendapat giliran jadi subjek",
              "Subjek menjawab 5 pertanyaan tentang dirinya",
              "Lawan menebak jawaban subjek dalam 15 detik",
              "Tebakan benar = 10 poin",
              "Poin tertinggi menang!",
            ].map((rule, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <p className="text-sm text-text-secondary">{rule}</p>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={joining}
          className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {joining ? (
            <><Loader2 size={16} className="animate-spin" /> Mencari lawan...</>
          ) : (
            <><Users size={16} /> Mulai Bermain</>
          )}
        </button>

        <button
          onClick={() => router.push("/tebak/leaderboard")}
          className="w-full py-3.5 rounded-xl border-2 border-primary/20 text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-colors cursor-pointer"
        >
          <Trophy size={16} />
          Leaderboard
        </button>
      </div>
    </div>
  )
}
