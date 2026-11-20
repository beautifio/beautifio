"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Tebi } from "@/components/tebak/art/Tebi"
import { DiscCritter } from "@/components/tebak/art/DiscCritters"
import { IconBolt, IconChat, IconHeart, IconSearch, IconTrophy } from "@/components/tebak/art/icons"
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
      <div className="tb-stage min-h-[100dvh] flex items-center justify-center">
        <Tebi mood="think" size={80} className="animate-tb-bob" title="Memuat" />
      </div>
    )
  }

  const steps = [
    { icon: <IconChat size={20} />, tone: "text-tb-me bg-tb-me/15", title: "Kenalan dulu", desc: "Ronde 1–2: jawab 5 soal tentang dirimu, barengan dengan lawan." },
    { icon: <IconSearch size={20} />, tone: "text-tb-them bg-tb-them/15", title: "Tebak lawan", desc: "Ronde 3–4: tebak jawaban lawan dalam 15 detik. Benar = 10 poin." },
    { icon: <IconHeart size={20} />, tone: "text-tb-no bg-tb-no/15", title: "Lihat kecocokan", desc: "Dapatkan hewan kepribadianmu, skor kecocokan, lalu lanjut ngobrol di Bisik." },
  ]

  return (
    <div className="tb-stage min-h-[100dvh] pb-28">
      <div className="max-w-content mx-auto px-4 pt-6 flex flex-col gap-5">
        {/* Hero */}
        <section className="tb-board px-5 pt-6 pb-5 text-center">
          <div className="relative h-[140px] flex items-end justify-center">
            <DiscCritter type="D" size={46} className="absolute left-1 top-2 -rotate-12 animate-tb-bob [animation-delay:-0.4s]" />
            <DiscCritter type="I" size={42} className="absolute right-2 top-0 rotate-12 animate-tb-bob [animation-delay:-1.1s]" />
            <DiscCritter type="S" size={44} className="absolute left-6 bottom-0 animate-tb-bob [animation-delay:-1.7s]" />
            <DiscCritter type="C" size={44} className="absolute right-6 bottom-1 animate-tb-bob [animation-delay:-0.8s]" />
            <Tebi mood="happy" size={112} className="relative" />
          </div>
          <h1 className="font-tebak text-[2rem] leading-tight font-semibold text-tb-ink mt-3">Tebak Aku</h1>
          <p className="text-sm text-tb-soft mt-1 max-w-[30ch] mx-auto">
            Main 1 lawan 1, saling menebak, lalu temukan hewan kepribadianmu.
          </p>
        </section>

        {/* Cara main */}
        <section aria-label="Cara bermain" className="flex flex-col gap-2.5">
          {steps.map(st => (
            <div key={st.title} className="flex items-start gap-3 rounded-3xl bg-tb-deep/60 border border-tb-line px-4 py-3">
              <span className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${st.tone}`}>{st.icon}</span>
              <div className="min-w-0">
                <p className="font-tebak text-base font-semibold text-tb-ink leading-tight">{st.title}</p>
                <p className="text-sm text-tb-soft leading-snug mt-0.5">{st.desc}</p>
              </div>
            </div>
          ))}
        </section>

        {error && (
          <p className="rounded-2xl border-2 border-tb-no/50 bg-tb-no/10 px-4 py-3 text-sm text-tb-ink">{error}</p>
        )}

        {limitMsg && (
          <div className="tb-board p-5 text-center flex flex-col items-center">
            <Tebi mood="sleepy" size={64} />
            <p className="font-tebak text-lg font-semibold text-tb-ink mt-2">Jatah main hari ini habis</p>
            <p className="text-sm text-tb-soft mt-1">Kamu sudah main {limitMsg.max}x hari ini. Upgrade untuk main lebih banyak.</p>
            <button
              onClick={() => router.push("/bisik/upgrade")}
              className="tb-chunky mt-4 px-6 py-3 bg-tb-them border-tb-them text-tb-stage text-sm font-semibold cursor-pointer [--tb-edge:var(--color-tb-them-dark)]"
            >
              Upgrade sekarang
            </button>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleStart}
            disabled={joining}
            className="tb-chunky w-full py-4 bg-tb-me border-tb-me text-tb-stage font-tebak text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 [--tb-edge:var(--color-tb-me-dark)]"
          >
            {joining ? (
              <><Loader2 size={18} className="animate-spin" /> Mencari lawan…</>
            ) : (
              <><IconBolt size={20} /> Mulai bermain</>
            )}
          </button>
          <button
            onClick={() => router.push("/tebak/leaderboard")}
            className="tb-chunky w-full py-3.5 bg-transparent border-tb-line text-tb-ink font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer hover:border-tb-them"
          >
            <IconTrophy size={18} className="text-tb-me" /> Papan juara
          </button>
        </div>
      </div>
    </div>
  )
}
