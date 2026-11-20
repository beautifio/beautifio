"use client"

import { useRouter } from "next/navigation"
import { IconBack, IconSoundOff, IconSoundOn } from "./art/icons"
import { Tebi, type TebiMood } from "./art/Tebi"

/**
 * Panggung bersama semua layar Tebak Aku: latar navy penuh layar + satu kolom 420px.
 * Semua layar (menunggu, intro, soal, jeda, hasil, pemenang) dirender di dalamnya
 * supaya lebar & latar tidak pernah "loncat".
 */
export function TebakStage({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="tb-stage min-h-[100dvh] flex flex-col">
      <div className={`w-full max-w-content mx-auto px-4 flex-1 flex flex-col ${className}`}>{children}</div>
    </div>
  )
}

type TopBarProps = {
  /** Ronde aktif 1–4; tanpa ini progres ronde disembunyikan. */
  round?: number
  totalRounds?: number
  mood?: TebiMood
  onBack?: () => void
  muted?: boolean
  onToggleMute?: () => void
}

export function TebakTopBar({ round, totalRounds = 4, mood = "idle", onBack, muted, onToggleMute }: TopBarProps) {
  const router = useRouter()
  return (
    <header className="flex items-center gap-3 pt-4 pb-3">
      <button
        type="button"
        onClick={onBack ?? (() => router.back())}
        aria-label="Kembali"
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-tb-soft hover:text-tb-ink hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-3 focus-visible:outline-tb-me"
      >
        <IconBack size={22} />
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-tebak text-lg font-semibold leading-none text-tb-ink">Tebak Aku</p>
        {round ? (
          <div className="mt-1.5 flex items-center gap-2" aria-label={`Ronde ${round} dari ${totalRounds}`}>
            <span className="text-xs text-tb-soft">Ronde {round}</span>
            <span className="flex gap-1">
              {Array.from({ length: totalRounds }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i + 1 < round ? "w-3 bg-tb-me/60" : i + 1 === round ? "w-5 bg-tb-me" : "w-3 bg-white/15"
                  }`}
                />
              ))}
            </span>
          </div>
        ) : null}
      </div>
      {onToggleMute ? (
        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
          aria-pressed={!muted}
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-tb-soft hover:text-tb-ink hover:bg-white/5 transition-colors cursor-pointer"
        >
          {muted ? <IconSoundOff size={20} /> : <IconSoundOn size={20} />}
        </button>
      ) : null}
      <Tebi key={mood} mood={mood} size={40} className="animate-tb-pop shrink-0" />
    </header>
  )
}
