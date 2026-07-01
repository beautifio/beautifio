"use client"

import { useEffect, useState } from "react"
import { Clock, Check, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { TebakSession, TebakQuestion, TebakAnswer } from "@/lib/tebak/queries"
import { DigitalClock } from "./DigitalClock"

type Props = {
  session: TebakSession
  round: number
  answers: TebakAnswer[]
  questions: TebakQuestion[]
  isPlayerA: boolean
  myName: string | null
  opponentName: string | null
  deadline: string
  onAdvance: () => void
  isDiscRound?: boolean
}

export function RoundResultScreen({
  session,
  round,
  answers,
  questions,
  isPlayerA,
  myName,
  opponentName,
  deadline,
  onAdvance,
  isDiscRound = false,
}: Props) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)

  const myScore = isPlayerA ? session.score_a : session.score_b
  const theirScore = isPlayerA ? session.score_b : session.score_a

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('media_assets')
      .select('url')
      .eq('slot', 'tebak_round_banner')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.url) setBannerUrl(data.url)
      })
  }, [])

  // ═══ VARIAN DISC — return lebih awal, tanpa sentuh logika tebak ═══
  if (isDiscRound) {
    return (
      <div className="flex-1 flex flex-col px-4 py-4 bg-primary text-primary-foreground">
        <div className="bg-primary/20 rounded-2xl border border-primary/50 shadow-xl overflow-hidden relative">
          <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-secondary" />
          <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/[0.03] pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-accent/[0.03] pointer-events-none" />

          <div className="p-6 flex flex-col items-center gap-4 relative z-10 min-h-[420px]">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <RefreshCw size={32} className="text-accent" />
            </div>
            <h2 className="text-xl font-bold text-primary-foreground text-center">Babak {round} selesai</h2>
            <p className="text-sm text-primary-foreground/70 text-center max-w-xs">
              Kalian berdua sudah berbagi tentang diri masing-masing
            </p>

            {/* Scores (netral, tanpa frame benar/salah) */}
            <div className="w-full max-w-xs flex items-center justify-between px-5 py-4 rounded-xl bg-white/10 border border-white/20">
              <div className="text-center">
                <p className="text-xs text-primary-foreground/70 mb-1">{myName || 'Kamu'}</p>
                <p className="text-xl font-bold text-primary-foreground">{myScore}</p>
              </div>
              <p className="text-lg font-bold text-primary-foreground/50">-</p>
              <div className="text-center">
                <p className="text-xs text-primary-foreground/70 mb-1">{opponentName || 'Lawan'}</p>
                <p className="text-xl font-bold text-primary-foreground">{theirScore}</p>
              </div>
            </div>

            {/* Banner */}
            {bannerUrl && (
              <div className="w-full max-w-xs">
                <img src={bannerUrl} alt="" className="w-full object-cover rounded-lg" />
              </div>
            )}

            {/* Countdown */}
            <div className="mt-auto pt-4">
              <DigitalClock deadline={deadline} onTimeout={onAdvance} label={`Babak ${round + 1} dimulai`} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ═══ VARIAN TEBAK — TIDAK BERUBAH ═══
  const playerAId = session.player_a_id
  const playerBId = session.player_b_id
  const myId = isPlayerA ? playerAId : playerBId
  const theirId = isPlayerA ? playerBId : playerAId

  const myRoundAnswers = answers.filter(a => {
    const q = questions.find(q => q.id === a.question_id)
    return q && a.guesser_id === myId
  })
  const theirRoundAnswers = answers.filter(a => {
    const q = questions.find(q => q.id === a.question_id)
    return q && a.guesser_id === theirId
  })

  const myCorrect = myRoundAnswers.filter(a => a.is_correct).length
  const myTotal = myRoundAnswers.length
  const myTimeouts = myRoundAnswers.filter(a => a.answer === '__timeout__').length
  const theirCorrect = theirRoundAnswers.filter(a => a.is_correct).length
  const theirTotal = theirRoundAnswers.length
  const theirTimeouts = theirRoundAnswers.filter(a => a.answer === '__timeout__').length

  return (
    <div className="flex-1 flex flex-col px-4 py-4 bg-primary text-primary-foreground">
      <div className="bg-primary/20 rounded-2xl border border-primary/50 shadow-xl overflow-hidden relative">
        <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-secondary" />
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/[0.03] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-accent/[0.03] pointer-events-none" />

        <div className="p-6 flex flex-col items-center gap-4 relative z-10 min-h-[420px]">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <RefreshCw size={32} className="text-accent" />
          </div>
          <h2 className="text-xl font-bold text-primary-foreground text-center">Babak {round} Selesai</h2>

          {/* Scores */}
          <div className="w-full max-w-xs flex items-center justify-between px-5 py-4 rounded-xl bg-white/10 border border-white/20">
            <div className="text-center">
              <p className="text-xs text-primary-foreground/70 mb-1">{myName || 'Kamu'}</p>
              <p className="text-xl font-bold text-primary-foreground">{myScore}</p>
            </div>
            <p className="text-lg font-bold text-primary-foreground/50">-</p>
            <div className="text-center">
              <p className="text-xs text-primary-foreground/70 mb-1">{opponentName || 'Lawan'}</p>
              <p className="text-xl font-bold text-primary-foreground">{theirScore}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-sm">
              <span className="text-green-400 flex items-center gap-1.5">
                <Check size={14} /> {myName || 'Kamu'}
              </span>
              <span className="font-bold text-green-400">{myCorrect}/{myTotal}</span>
            </div>
            {myTimeouts > 0 && (
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-sm">
                <span className="text-orange-400 flex items-center gap-1.5">
                  <Clock size={14} /> {myName || 'Kamu'} timeout
                </span>
                <span className="font-bold text-orange-400">{myTimeouts}x</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-sm">
              <span className="text-green-400 flex items-center gap-1.5">
                <Check size={14} /> {opponentName || 'Lawan'}
              </span>
              <span className="font-bold text-green-400">{theirCorrect}/{theirTotal}</span>
            </div>
            {theirTimeouts > 0 && (
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-sm">
                <span className="text-orange-400 flex items-center gap-1.5">
                  <Clock size={14} /> {opponentName || 'Lawan'} timeout
                </span>
                <span className="font-bold text-orange-400">{theirTimeouts}x</span>
              </div>
            )}
          </div>

          {/* Role swap info */}
          <div className="w-full max-w-xs p-4 rounded-xl bg-white/10 border border-white/20 text-center">
            <p className="text-sm font-semibold text-accent">
              Babak {round + 1}: Giliran Bertukar
            </p>
            <p className="text-xs text-primary-foreground/70 mt-1">
              {opponentName || 'Lawan'} sekarang jadi Subjek<br />
              {myName || 'Kamu'} sekarang jadi Penebak
            </p>
          </div>

          {/* Banner */}
          {bannerUrl && (
            <div className="w-full max-w-xs">
              <img src={bannerUrl} alt="" className="w-full object-cover rounded-lg" />
            </div>
          )}

          {/* Countdown */}
          <div className="mt-auto pt-4">
            <DigitalClock deadline={deadline} onTimeout={onAdvance} label={`Babak ${round + 1} dimulai`} />
          </div>
        </div>
      </div>
    </div>
  )
}
