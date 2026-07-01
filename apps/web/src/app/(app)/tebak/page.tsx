"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, HelpCircle, ArrowRight, Loader2, Check, X, Trophy, Crown } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { joinTebakQueue } from "@/lib/tebak/actions"

export default function TebakPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState("")
  const [limitMsg, setLimitMsg] = useState<{ max: number } | null>(null)

  const handleStart = async () => {
    setJoining(true)
    setError("")
    setLimitMsg(null)
    try {
      const result = await joinTebakQueue()
      if (result.limitReached) {
        setLimitMsg({ max: result.maxPerDay || 0 })
        setJoining(false)
        return
      }
      router.push(`/tebak/${result.sessionId}`)
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
          <p className="text-xs text-text-secondary mt-0.5">Kenali kepribadianmu & lawan bicaramu</p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6 space-y-6">
        {/* Hero */}
        <div className="flex flex-col items-center py-8">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Users size={48} className="text-primary" />
          </div>
          <h2 className="text-lg font-bold text-text-primary text-center mb-2">
            4 Ronde Seru, 1 Profil Kepribadian
          </h2>
          <p className="text-sm text-text-secondary text-center max-w-xs">
            Jawab pertanyaan tentang dirimu, tebak kepribadian lawan, lalu lihat kecocokan untuk jadi teman ngobrol.
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-text-primary">Cara bermain:</h3>
          <div className="space-y-2.5">
            {[
              "Ronde 1 — Jawab 10 pertanyaan DISC tentang dirimu (serentak dengan lawan)",
              "Ronde 2 — Jawab 10 pertanyaan gaya komunikasimu (serentak dengan lawan)",
              "Ronde 3 & 4 — Giliran tebak jawaban lawan dalam 15 detik, benar = 10 poin",
              "Lihat Profil Kepribadian DISC kamu & lawan (Dominan / Influence / Steadiness / Conscientious)",
              "Cek skor kecocokan kalian & lanjut ngobrol di Bisik!",
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

        {limitMsg && (
          <div className="p-4 rounded-xl border text-center" style={{ background: "#F8FAFC", borderColor: "#FFC64F" }}>
            <Crown size={20} className="mx-auto mb-2" style={{ color: "#FFC64F" }} />
            <p className="text-sm font-semibold" style={{ color: "#1E2938" }}>Batas harian tercapai</p>
            <p className="text-xs mt-1" style={{ color: "#647488" }}>Kamu sudah main {limitMsg.max}x hari ini. Upgrade untuk main lebih banyak.</p>
            <button onClick={() => router.push("/bisik/upgrade")}
              className="mt-3 px-6 py-2 rounded-xl text-xs font-bold cursor-pointer" style={{ background: "#FFC64F", color: "#084463" }}>
              Upgrade Sekarang
            </button>
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
