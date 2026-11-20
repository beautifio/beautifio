"use client"

import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { DigitalClock } from "./DigitalClock"
import { AdBanner } from "./AdBanner"
import { Tebi } from "./art/Tebi"
import { Confetti } from "./art/Confetti"

type Props = {
  resultType: 'correct' | 'wrong' | 'subject_timeout' | 'guesser_timeout'
  subjectName: string | null
  guesserName: string | null
  correctAnswer: string
  myScore: number
  theirScore: number
  isLastQuestion: boolean
  isLastRound: boolean
  deadline: string
  onAdvance: () => void
  // DISC variant props (optional — default false/null untuk backward compat callsite)
  isDiscRound?: boolean
  myDiscAnswer?: string | null
  theirDiscAnswer?: string | null
  opponentName?: string | null
  sessionId?: string
}

export function JedaScreen({
  resultType,
  subjectName,
  guesserName,
  correctAnswer,
  myScore,
  theirScore,
  isLastQuestion,
  isLastRound,
  deadline,
  onAdvance,
  isDiscRound = false,
  myDiscAnswer,
  theirDiscAnswer,
  opponentName,
  sessionId,
}: Props) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return
    supabase
      .from('media_assets')
      .select('url')
      .eq('slot', 'tebak_jeda_banner')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.url) setBannerUrl(data.url)
      })
  }, [])

  const countdownLabel = isLastRound && isLastQuestion
    ? 'Menuju hasil akhir'
    : !isLastRound && isLastQuestion
    ? 'Ronde berikutnya'
    : 'Soal berikutnya'

  const banner = bannerUrl ? <img src={bannerUrl} alt="" className="w-full object-cover rounded-2xl" /> : null
  const ad = sessionId ? <AdBanner location="jeda" sessionId={sessionId} /> : null

  // ═══ VARIAN DISC ═══
  if (isDiscRound) {
    const fmt = (a?: string | null) => a === '__timeout__' ? 'Tidak sempat menjawab' : a ?? '…'
    const same = !!myDiscAnswer && myDiscAnswer === theirDiscAnswer && myDiscAnswer !== '__timeout__'
    return (
      <div className="relative flex flex-col gap-4 animate-tb-slide-in">
        {same && <Confetti pieces={14} seed={myDiscAnswer!.length} />}
        <div className="tb-board p-5 flex flex-col items-center text-center">
          <Tebi mood={same ? "party" : "happy"} size={80} className="animate-tb-pop" />
          <h2 className="font-tebak text-2xl font-semibold text-tb-ink mt-2">
            {same ? "Kalian sehati!" : "Jawaban tersimpan"}
          </h2>
          <p className="text-sm text-tb-soft mt-1">
            {same ? "Pilihan kalian sama persis" : "Begini pilihan kalian berdua"}
          </p>

          <div className="w-full mt-4 space-y-2.5 text-left">
            <div className="rounded-2xl border-2 border-tb-me/50 bg-tb-me/10 px-4 py-3">
              <p className="text-xs font-semibold text-tb-me">Kamu</p>
              <p className="text-[15px] font-semibold text-tb-ink leading-snug">{fmt(myDiscAnswer)}</p>
            </div>
            <div className="rounded-2xl border-2 border-tb-them/50 bg-tb-them/10 px-4 py-3">
              <p className="text-xs font-semibold text-tb-them">{opponentName ?? 'Lawan'}</p>
              <p className="text-[15px] font-semibold text-tb-ink leading-snug">{fmt(theirDiscAnswer)}</p>
            </div>
          </div>

          <div className="w-full mt-5">
            <DigitalClock deadline={deadline} onTimeout={onAdvance} label={countdownLabel} />
          </div>
        </div>
        {ad}
      </div>
    )
  }

  // ═══ VARIAN TEBAK ═══
  const mood = resultType === 'correct' ? 'happy' : resultType === 'wrong' ? 'sad' : 'sleepy'
  const accent = resultType === 'correct' ? 'text-tb-yes' : resultType === 'wrong' ? 'text-tb-no' : 'text-tb-me'

  let title: string
  let subtitle: string
  switch (resultType) {
    case 'correct':
      title = 'Tebakan tepat!'
      subtitle = `${guesserName ?? 'Penebak'} berhasil menebak jawaban ${subjectName ?? 'lawan'}`
      break
    case 'wrong':
      title = 'Meleset!'
      subtitle = `Jawaban ${subjectName ?? 'lawan'} ternyata:`
      break
    case 'subject_timeout':
      title = 'Waktu habis'
      subtitle = `${subjectName ?? 'Penjawab'} tidak sempat menjawab. Poin untuk ${guesserName ?? 'penebak'}`
      break
    case 'guesser_timeout':
      title = 'Waktu habis'
      subtitle = `${guesserName ?? 'Penebak'} tidak sempat menebak. Tidak ada poin`
      break
  }

  const diff = myScore - theirScore
  const leadText = diff > 0 ? `Kamu unggul ${diff} poin` : diff < 0 ? `Tertinggal ${Math.abs(diff)} poin, kejar!` : 'Skor masih seri'

  return (
    <div className="relative flex flex-col gap-4 animate-tb-slide-in">
      {resultType === 'correct' && <Confetti pieces={16} seed={myScore + theirScore + 1} />}
      <div className={`tb-board p-5 flex flex-col items-center text-center ${resultType === 'wrong' ? 'animate-tb-shake' : ''}`}>
        <Tebi mood={mood} size={84} className="animate-tb-pop" />
        <h2 className={`font-tebak text-3xl font-semibold mt-2 ${accent}`}>{title}</h2>
        <p className="text-sm text-tb-soft mt-1 max-w-[30ch]">{subtitle}</p>
        {resultType === 'wrong' && correctAnswer ? (
          <p className="mt-3 rounded-2xl border-2 border-tb-yes/60 bg-tb-yes/10 px-4 py-2.5 text-[15px] font-semibold text-tb-ink">{correctAnswer}</p>
        ) : null}

        <div className="mt-5 flex items-center gap-4">
          <span className="font-tebak text-4xl font-semibold text-tb-me tabular-nums">{myScore}</span>
          <span className="font-tebak text-tb-soft">vs</span>
          <span className="font-tebak text-4xl font-semibold text-tb-them tabular-nums">{theirScore}</span>
        </div>
        <p className="text-sm font-semibold text-tb-ink/80 mt-1">{leadText}</p>

        <div className="w-full mt-5">
          <DigitalClock deadline={deadline} onTimeout={onAdvance} label={countdownLabel} />
        </div>
      </div>
      {banner}
      {ad}
    </div>
  )
}
