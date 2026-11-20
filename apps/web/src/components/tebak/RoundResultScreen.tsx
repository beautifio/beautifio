"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import type { TebakSession, TebakQuestion, TebakAnswer } from "@/lib/tebak/queries"
import { DigitalClock } from "./DigitalClock"
import { Tebi } from "./art/Tebi"
import { IconRepeat } from "./art/icons"

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

  const banner = bannerUrl ? <img src={bannerUrl} alt="" className="w-full object-cover rounded-2xl" /> : null
  const nextRoundLabel = round === 1 ? 'Ronde 2: kenalan lagi' : round === 2 ? 'Ronde 3: saatnya menebak' : `Ronde ${round + 1} dimulai`

  const ScoreRow = () => (
    <div className="w-full mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="rounded-2xl border-2 border-tb-me/50 bg-tb-me/10 py-2.5">
        <p className="text-xs text-tb-me font-semibold truncate px-2">{myName || 'Kamu'}</p>
        <p className="font-tebak text-3xl font-semibold text-tb-me tabular-nums leading-none mt-1">{myScore}</p>
      </div>
      <span className="font-tebak text-tb-soft">vs</span>
      <div className="rounded-2xl border-2 border-tb-them/50 bg-tb-them/10 py-2.5">
        <p className="text-xs text-tb-them font-semibold truncate px-2">{opponentName || 'Lawan'}</p>
        <p className="font-tebak text-3xl font-semibold text-tb-them tabular-nums leading-none mt-1">{theirScore}</p>
      </div>
    </div>
  )

  // ═══ VARIAN DISC ═══
  if (isDiscRound) {
    return (
      <div className="flex flex-col gap-4 animate-tb-slide-in">
        <div className="tb-board p-5 flex flex-col items-center text-center">
          <Tebi mood="party" size={88} className="animate-tb-pop" />
          <h2 className="font-tebak text-3xl font-semibold text-tb-ink mt-2">Ronde {round} beres!</h2>
          <p className="text-sm text-tb-soft mt-1 max-w-[30ch]">
            {round === 1 ? 'Satu ronde lagi untuk kenal lebih dalam.' : 'Sekarang kalian bergantian menebak jawaban satu sama lain.'}
          </p>
          <div className="w-full mt-5">
            <DigitalClock deadline={deadline} onTimeout={onAdvance} label={nextRoundLabel} />
          </div>
        </div>
        {banner}
      </div>
    )
  }

  // ═══ VARIAN TEBAK ═══
  const playerAId = session.player_a_id
  const playerBId = session.player_b_id
  const myId = isPlayerA ? playerAId : playerBId
  const theirId = isPlayerA ? playerBId : playerAId

  const myRoundAnswers = answers.filter(a => questions.some(q => q.id === a.question_id) && a.guesser_id === myId)
  const theirRoundAnswers = answers.filter(a => questions.some(q => q.id === a.question_id) && a.guesser_id === theirId)

  const myCorrect = myRoundAnswers.filter(a => a.is_correct).length
  const myTotal = myRoundAnswers.length
  const theirCorrect = theirRoundAnswers.filter(a => a.is_correct).length
  const theirTotal = theirRoundAnswers.length

  return (
    <div className="flex flex-col gap-4 animate-tb-slide-in">
      <div className="tb-board p-5 flex flex-col items-center text-center">
        <Tebi mood={myScore >= theirScore ? 'happy' : 'think'} size={84} className="animate-tb-pop" />
        <h2 className="font-tebak text-3xl font-semibold text-tb-ink mt-2">Ronde {round} beres!</h2>
        <ScoreRow />

        <div className="w-full mt-4 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl bg-tb-deep/60 border border-tb-line px-3 py-2.5">
            <p className="text-xs text-tb-soft">Tebakan benar</p>
            <p className="font-tebak text-xl font-semibold text-tb-me tabular-nums">{myCorrect}<span className="text-tb-soft text-sm">/{myTotal}</span></p>
          </div>
          <div className="rounded-2xl bg-tb-deep/60 border border-tb-line px-3 py-2.5">
            <p className="text-xs text-tb-soft">Tebakan benar lawan</p>
            <p className="font-tebak text-xl font-semibold text-tb-them tabular-nums">{theirCorrect}<span className="text-tb-soft text-sm">/{theirTotal}</span></p>
          </div>
        </div>

        <div className="w-full mt-4 rounded-2xl border-2 border-dashed border-tb-me/40 px-4 py-3 flex items-center gap-3 text-left">
          <IconRepeat size={22} className="text-tb-me shrink-0" />
          <p className="text-sm text-tb-ink leading-snug">Giliran bertukar: yang tadi menebak, sekarang menjawab.</p>
        </div>

        <div className="w-full mt-5">
          <DigitalClock deadline={deadline} onTimeout={onAdvance} label={nextRoundLabel} />
        </div>
      </div>
      {banner}
    </div>
  )
}
