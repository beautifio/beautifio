"use client"

import { Trophy, Home, RotateCcw } from "lucide-react"
import type { TebakSession } from "@/lib/tebak/queries"

type Props = {
  session: TebakSession
  isPlayerA: boolean
  opponentName: string | null
  myName: string | null
  compatibility: number
  onRematch: () => void
  onHome: () => void
}

export function WinnerScreen({
  session,
  isPlayerA,
  opponentName,
  myName,
  compatibility,
  onRematch,
  onHome,
}: Props) {
  const myScore = isPlayerA ? session.score_a : session.score_b
  const theirScore = isPlayerA ? session.score_b : session.score_a
  const isWin = myScore > theirScore
  const isDraw = myScore === theirScore
  const margin = Math.abs(myScore - theirScore)

  let marginText: string
  if (isDraw) {
    marginText = "SERI! Tidak ada yang menang hari ini 😅"
  } else if (margin < 10) {
    marginText = "Sengit sekali!"
  } else if (margin <= 30) {
    marginText = "Kemenangan solid!"
  } else {
    marginText = "Dominasi total!"
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* CSS confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-70"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10px`,
              backgroundColor: ['#FFC64F', '#6BB9D4', '#084463', '#EF4444', '#22C55E'][i % 5],
              animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>

      <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${
        isWin ? "bg-yellow-100" : isDraw ? "bg-blue-100" : "bg-gray-100"
      }`}>
        <Trophy size={48} className={
          isWin ? "text-yellow-500 animate-pulse" : isDraw ? "text-blue-500" : "text-gray-400"
        } />
      </div>

      <h2 className="text-2xl font-bold text-text-primary mb-1">
        {isDraw ? "" : isWin ? "Kamu Menang!" : "Kamu Kalah"}
      </h2>
      {isDraw && <h2 className="text-2xl font-bold text-text-primary mb-1">SERI!</h2>}
      <p className="text-sm text-text-secondary mb-2">{marginText}</p>
      <p className="text-lg font-bold text-text-primary mb-8">
        {myScore} - {theirScore}
      </p>

      {/* Player scores */}
      <div className="w-full max-w-xs space-y-3 mb-6">
        <div className="flex justify-between p-4 rounded-xl bg-surface border border-border">
          <span className="text-sm text-text-secondary">{myName || "Kamu"}</span>
          <span className="text-sm font-bold text-text-primary">{myScore} poin</span>
        </div>
        <div className="flex justify-between p-4 rounded-xl bg-surface border border-border">
          <span className="text-sm text-text-secondary">{opponentName || "Lawan"}</span>
          <span className="text-sm font-bold text-text-primary">{theirScore} poin</span>
        </div>
      </div>

      {/* Compatibility */}
      <div className="w-full max-w-xs mb-8">
        <div className="p-5 rounded-xl bg-surface border border-border text-center">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-text-secondary mb-3">
            Tingkat Kecocokan
          </p>
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                compatibility <= 30 ? "bg-red-400" : compatibility <= 60 ? "bg-orange-400" : compatibility <= 85 ? "bg-green-400" : "bg-accent"
              }`}
              style={{ width: `${compatibility}%` }}
            />
          </div>
          <p className={`text-sm font-bold ${
            compatibility <= 30 ? "text-red-500" : compatibility <= 60 ? "text-orange-500" : compatibility <= 85 ? "text-green-600" : "text-accent"
          }`}>
            {compatibility <= 30 ? "Kurang cocok" : compatibility <= 60 ? "Cukup cocok" : compatibility <= 85 ? "Cocok!" : "Soulmate! 😱"}
          </p>
        </div>
      </div>

      {/* Buttons */}
      <button
        onClick={onRematch}
        className="w-full max-w-xs py-3.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer mb-3"
      >
        <RotateCcw size={16} /> Main Lagi
      </button>
      <button
        onClick={onHome}
        className="w-full max-w-xs py-3.5 rounded-xl border border-border text-text-secondary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-surface transition-colors cursor-pointer"
      >
        <Home size={16} /> Kembali ke Home
      </button>
    </div>
  )
}
