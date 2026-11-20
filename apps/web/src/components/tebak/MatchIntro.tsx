"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Tebi } from "./art/Tebi"
import { IconBolt } from "./art/icons"

type Props = {
  myName?: string | null
  opponentName?: string | null
  onBegin: () => void
  deadline?: string
  onReady?: () => void
  opponentReady?: boolean
  sessionId?: string
}

export function MatchIntro({ myName, opponentName, onBegin, deadline }: Props) {
  const [remaining, setRemaining] = useState(8)
  const [show, setShow] = useState(false)
  const begunRef = useRef(false)

  const handleBegin = useCallback(() => {
    if (begunRef.current) return
    begunRef.current = true
    onBegin()
  }, [onBegin])

  useEffect(() => {
    setShow(true)
    const tick = () => {
      const dl = deadline ? new Date(deadline).getTime() : Date.now() + 8000
      const r = Math.max(0, Math.ceil((dl - Date.now()) / 1000))
      setRemaining(r)
      if (r <= 0) handleBegin()
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [deadline, handleBegin])

  const myInit = myName?.[0]?.toUpperCase() || "?"
  const oppInit = opponentName?.[0]?.toUpperCase() || "?"

  const Player = ({ init, name, sub, tone, from }: { init: string; name: string; sub: string; tone: "me" | "them"; from: number }) => (
    <div
      className="flex-1 min-w-0 flex flex-col items-center text-center"
      style={{
        transform: show ? "translateX(0)" : `translateX(${from}px)`,
        opacity: show ? 1 : 0,
        transition: "transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms ease",
      }}
    >
      <span
        className={`w-20 h-20 rounded-full flex items-center justify-center font-tebak text-3xl font-semibold text-tb-stage border-4 border-tb-deep ${tone === "me" ? "bg-tb-me" : "bg-tb-them"}`}
        style={{ boxShadow: "0 5px 0 var(--color-tb-deep)" }}
      >
        {init}
      </span>
      <p className={`mt-3 font-tebak text-lg font-semibold truncate max-w-full ${tone === "me" ? "text-tb-me" : "text-tb-them"}`}>{name}</p>
      <p className="text-xs text-tb-soft">{sub}</p>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 py-6">
      <div className="text-center">
        <Tebi mood="party" size={88} className="mx-auto animate-tb-bob" />
        <p className="font-tebak text-2xl font-semibold text-tb-ink mt-2">Lawan ditemukan!</p>
        <p className="text-sm text-tb-soft">Siap-siap kenalan sambil main</p>
      </div>

      <div className="w-full flex items-center gap-3">
        <Player init={myInit} name={myName || "Kamu"} sub="Kamu" tone="me" from={-60} />
        <span className="w-12 h-12 shrink-0 rounded-full bg-tb-me text-tb-stage flex items-center justify-center animate-tb-wiggle border-2 border-tb-deep">
          <IconBolt size={22} />
        </span>
        <Player init={oppInit} name={opponentName || "Lawan"} sub="Lawan" tone="them" from={60} />
      </div>

      <div className="flex flex-col items-center">
        <span
          key={remaining}
          className={`font-tebak text-7xl font-semibold tabular-nums leading-none animate-tb-bump ${remaining <= 3 ? "text-tb-me" : "text-tb-ink"}`}
          aria-live="polite"
        >
          {remaining > 0 ? remaining : "Mulai!"}
        </span>
        <span className="text-sm text-tb-soft mt-2">Ronde 1 dimulai</span>
      </div>
    </div>
  )
}
