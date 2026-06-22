"use client"


type Props = {
  scoreA: number
  scoreB: number
  round: number
  isPlayerA: boolean
  opponentName?: string
}

export function ScoreBoard({ scoreA, scoreB, round, isPlayerA, opponentName }: Props) {
  const myScore = isPlayerA ? scoreA : scoreB
  const theirScore = isPlayerA ? scoreB : scoreA

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex-1 text-right">
        <p className="text-xs text-text-secondary">Kamu</p>
        <p className="text-2xl font-bold text-primary">{myScore}</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-[10px] text-text-secondary uppercase tracking-wider">Round</p>
        <p className="text-lg font-bold text-text-primary">{round}/2</p>
      </div>
      <div className="flex-1">
        <p className="text-xs text-text-secondary">{opponentName || "Lawan"}</p>
        <p className="text-2xl font-bold text-text-secondary">{theirScore}</p>
      </div>
    </div>
  )
}
