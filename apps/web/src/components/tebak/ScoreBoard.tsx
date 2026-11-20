"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  scoreA: number
  scoreB: number
  round: number
  isPlayerA: boolean
  myName?: string | null
  opponentName?: string | null
  myDots?: (boolean | null)[]
  theirDots?: (boolean | null)[]
  isDiscRound?: boolean
  discProgress?: number
  discTotal?: number
}

function Dot({ value }: { value: boolean | null }) {
  if (value === null) return <span className="w-2 h-2 rounded-full border border-white/20" />
  return <span className={`w-2 h-2 rounded-full ${value ? "bg-tb-yes" : "bg-tb-no"}`} />
}

/** Skor yang memantul + "+10" melayang setiap kali naik. */
function Score({ value, tone }: { value: number; tone: "me" | "them" }) {
  const prev = useRef(value)
  const [gain, setGain] = useState<{ n: number; key: number } | null>(null)

  useEffect(() => {
    if (value > prev.current) setGain({ n: value - prev.current, key: Date.now() })
    prev.current = value
  }, [value])

  return (
    <span className="relative inline-flex">
      <span
        key={gain?.key ?? "base"}
        className={`font-tebak text-3xl font-semibold leading-none tabular-nums ${tone === "me" ? "text-tb-me" : "text-tb-them"} ${gain ? "animate-tb-bump" : ""}`}
      >
        {value}
      </span>
      {gain && (
        <span
          key={`g${gain.key}`}
          className={`absolute -top-3 left-full ml-1 font-tebak text-sm font-semibold animate-tb-float-up ${tone === "me" ? "text-tb-me" : "text-tb-them"}`}
          aria-hidden
        >
          +{gain.n}
        </span>
      )}
    </span>
  )
}

function Avatar({ name, tone }: { name?: string | null; tone: "me" | "them" }) {
  const initial = name?.trim()?.[0]?.toUpperCase() || "?"
  return (
    <span
      className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center font-tebak text-base font-semibold text-tb-stage border-2 border-tb-deep ${
        tone === "me" ? "bg-tb-me" : "bg-tb-them"
      }`}
      aria-hidden
    >
      {initial}
    </span>
  )
}

export function ScoreBoard({ scoreA, scoreB, isPlayerA, myName, opponentName, myDots = [], theirDots = [], isDiscRound = false, discProgress = 0, discTotal = 0 }: Props) {
  const myScore = isPlayerA ? scoreA : scoreB
  const theirScore = isPlayerA ? scoreB : scoreA

  return (
    <div className="rounded-3xl bg-tb-deep/70 border border-tb-line px-3 py-2.5">
      <div className="flex items-center gap-2">
        {/* Kamu */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <Avatar name={myName} tone="me" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-tb-me leading-tight">Kamu</p>
            <p className="text-[11px] text-tb-soft truncate leading-tight">{myName || " "}</p>
          </div>
        </div>

        {/* Tengah */}
        {isDiscRound ? (
          <div className="flex flex-col items-center gap-1 px-1">
            <span className="text-[11px] text-tb-soft">Kenalan</span>
            <span className="font-tebak text-base font-semibold text-tb-ink tabular-nums leading-none">
              {discProgress}/{discTotal}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-1">
            <Score value={myScore} tone="me" />
            <span className="text-tb-soft/60 font-tebak text-sm">vs</span>
            <Score value={theirScore} tone="them" />
          </div>
        )}

        {/* Lawan */}
        <div className="flex-1 min-w-0 flex items-center gap-2 justify-end text-right">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-tb-them leading-tight truncate">{opponentName || "Lawan"}</p>
            <p className="text-[11px] text-tb-soft leading-tight">Lawan</p>
          </div>
          <Avatar name={opponentName} tone="them" />
        </div>
      </div>

      {(myDots.length > 0 || theirDots.length > 0) && !isDiscRound && (
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1">{myDots.map((d, i) => <Dot key={i} value={d} />)}</div>
          <div className="flex gap-1">{theirDots.map((d, i) => <Dot key={i} value={d} />)}</div>
        </div>
      )}
    </div>
  )
}
