"use client"

import { useEffect, useState, useRef } from "react"
import { Check, X, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { DigitalClock } from "./DigitalClock"

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

  const icon = resultType === 'correct'
    ? <Check size={40} className="text-green-500" />
    : resultType === 'wrong'
    ? <X size={40} className="text-red-500" />
    : <Clock size={40} className="text-orange-500" />

  const iconBg = resultType === 'correct'
    ? 'bg-green-100'
    : resultType === 'wrong'
    ? 'bg-red-100'
    : 'bg-orange-100'

  let title: string
  let subtitle: string

  switch (resultType) {
    case 'correct':
      title = 'Tebakan tepat!'
      subtitle = `${guesserName ?? 'Penebak'} berhasil menebak jawaban ${subjectName ?? 'Subjek'}`
      break
    case 'wrong':
      title = 'Meleset!'
      subtitle = `Jawaban ${subjectName ?? 'Subjek'}: ${correctAnswer || '(tidak ada)'}`
      break
    case 'subject_timeout':
      title = 'Waktu habis!'
      subtitle = `${subjectName ?? 'Subjek'} tidak sempat menjawab. Poin untuk ${guesserName ?? 'Penebak'}`
      break
    case 'guesser_timeout':
      title = 'Waktu habis!'
      subtitle = `${guesserName ?? 'Penebak'} tidak sempat menebak. Tidak ada poin tambahan`
      break
  }

  const countdownLabel = isLastRound && isLastQuestion
    ? 'Menuju hasil akhir'
    : !isLastRound && isLastQuestion
    ? 'Bersiap tukar peran'
    : 'Pertanyaan berikutnya'

  return (
    <div className="flex-1 flex flex-col px-4 py-4">
      <div className="bg-surface rounded-2xl border border-border shadow-xl overflow-hidden relative">
        <div className="h-1.5 bg-gradient-to-r from-accent via-primary to-secondary" />
        <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-primary/[0.03] pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 rounded-full bg-accent/[0.03] pointer-events-none" />

        <div className="p-6 flex flex-col items-center gap-4 relative z-10 min-h-[420px]">
          {/* Icon + Title */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
          <h2 className="text-xl font-bold text-text-primary text-center">{title}</h2>
          <p className="text-sm text-text-secondary text-center max-w-xs">{subtitle}</p>

          {/* Score bar */}
          <div className="w-full max-w-xs flex items-center justify-between px-5 py-3 rounded-xl bg-muted/50 border border-border text-sm font-semibold">
            <span className="text-text-primary">{myScore}</span>
            <span className="text-text-secondary">—</span>
            <span className="text-text-primary">{theirScore}</span>
          </div>

          {/* Lead indicator */}
          {(() => {
            const diff = myScore - theirScore
            let text = ''
            if (diff > 0) text = `Kamu unggul ${diff} poin 🔥`
            else if (diff < 0) text = `Tertinggal ${Math.abs(diff)} poin — kejar!`
            else text = 'Skor seri — siapa duluan?'
            return (
              <p className="text-sm font-semibold text-text-secondary text-center">{text}</p>
            )
          })()}

          {/* Banner slot */}
          {bannerUrl && (
            <div className="w-full max-w-xs">
              <img
                src={bannerUrl}
                alt="Banner"
                className="w-full object-cover rounded-lg"
              />
            </div>
          )}

          {/* Countdown */}
          <div className="mt-auto pt-4">
            <DigitalClock deadline={deadline} onTimeout={() => {}} label={countdownLabel} />
          </div>
        </div>
      </div>
    </div>
  )
}
