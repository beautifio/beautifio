"use client"

import { useEffect, useState } from "react"
import { Clock, Check, X, RefreshCw } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import type { TebakSession, TebakQuestion, TebakAnswer } from "@/lib/tebak/queries"

type Props = {
  session: TebakSession
  round: number
  answers: TebakAnswer[]
  questions: TebakQuestion[]
  isPlayerA: boolean
  myName: string | null
  opponentName: string | null
  onComplete: () => void
}

export function RoundResultScreen({
  session,
  round,
  answers,
  questions,
  isPlayerA,
  myName,
  opponentName,
  onComplete,
}: Props) {
  const [count, setCount] = useState(8)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)

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

  useEffect(() => {
    if (count <= 0) { onComplete(); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, onComplete])

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

  return (
    <div className="flex-1 flex flex-col px-4 py-4">
      <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden relative">
        <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-secondary" />
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/[0.03] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-accent/[0.03] pointer-events-none" />

        <div className="p-6 flex flex-col items-center gap-4 relative z-10">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary text-center">Babak {round} Selesai</h2>

          {/* Scores */}
          <div className="w-full max-w-xs flex items-center justify-between px-5 py-4 rounded-xl bg-muted/50 border border-border">
            <div className="text-center">
              <p className="text-xs text-text-secondary mb-1">{myName || 'Kamu'}</p>
              <p className="text-xl font-bold text-text-primary">{session.score_a}</p>
            </div>
            <p className="text-lg font-bold text-text-secondary">-</p>
            <div className="text-center">
              <p className="text-xs text-text-secondary mb-1">{opponentName || 'Lawan'}</p>
              <p className="text-xl font-bold text-text-primary">{session.score_b}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="w-full max-w-xs space-y-2">
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
              <span className="text-green-700 flex items-center gap-1.5">
                <Check size={14} /> {myName || 'Kamu'}
              </span>
              <span className="font-bold text-green-700">{myCorrect}/{myTotal}</span>
            </div>
            {myTimeouts > 0 && (
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-orange-50 border border-orange-200 text-sm">
                <span className="text-orange-700 flex items-center gap-1.5">
                  <Clock size={14} /> {myName || 'Kamu'} timeout
                </span>
                <span className="font-bold text-orange-700">{myTimeouts}x</span>
              </div>
            )}
            <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
              <span className="text-green-700 flex items-center gap-1.5">
                <Check size={14} /> {opponentName || 'Lawan'}
              </span>
              <span className="font-bold text-green-700">{theirCorrect}/{theirTotal}</span>
            </div>
            {theirTimeouts > 0 && (
              <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-orange-50 border border-orange-200 text-sm">
                <span className="text-orange-700 flex items-center gap-1.5">
                  <Clock size={14} /> {opponentName || 'Lawan'} timeout
                </span>
                <span className="font-bold text-orange-700">{theirTimeouts}x</span>
              </div>
            )}
          </div>

          {/* Role swap info */}
          <div className="w-full max-w-xs p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
            <p className="text-sm font-semibold text-primary">
              Babak 2: Giliran Bertukar
            </p>
            <p className="text-xs text-text-secondary mt-1">
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
          <div className="flex items-center gap-2 text-sm text-text-secondary mt-2">
            <Clock size={16} />
            <span>Babak 2 dimulai dalam {count}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
