"use client"

type Props = {
  scoreA: number
  scoreB: number
  round: number
  isPlayerA: boolean
  myName?: string | null
  opponentName?: string | null
  myDots?: (boolean | null)[]
  theirDots?: (boolean | null)[]
}

function Dot({ value }: { value: boolean | null }) {
  if (value === null) {
    return <span className="w-2 h-2 rounded-full border border-white/15 bg-transparent" />
  }
  return (
    <span
      className={`w-2 h-2 rounded-full ${
        value ? "bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.5)]" : "bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.5)]"
      }`}
    />
  )
}

export function ScoreBoard({ scoreA, scoreB, round, isPlayerA, myName, opponentName, myDots = [], theirDots = [] }: Props) {
  const myScore = isPlayerA ? scoreA : scoreB
  const theirScore = isPlayerA ? scoreB : scoreA

  return (
    <div className="bg-[#0B1120] px-4 py-3">
      <div className="max-w-md mx-auto">
        {/* Top row: names + score */}
        <div className="flex items-stretch gap-0 mb-2">
          {/* My side */}
          <div className="flex-1 flex flex-col justify-center items-end pr-3 min-w-0">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50">
              Kamu
            </span>
            {myName && (
              <span className="text-[10px] text-white/30 truncate max-w-full leading-tight">
                {myName}
              </span>
            )}
          </div>

          {/* Score */}
          <div className="flex items-center gap-2.5">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">
              {String(myScore).padStart(2, "0")}
            </span>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-white/30" />
              <span className="text-[9px] font-semibold tracking-widest uppercase text-white/40">
                R{round}/2
              </span>
              <div className="w-1 h-1 rounded-full bg-white/30" />
            </div>
            <span className="text-2xl font-bold font-mono tabular-nums text-white/70">
              {String(theirScore).padStart(2, "0")}
            </span>
          </div>

          {/* Their side */}
          <div className="flex-1 flex flex-col justify-center items-start pl-3 min-w-0">
            <span className="text-[10px] font-semibold tracking-widest uppercase text-white/50 truncate max-w-full">
              {opponentName || "Lawan"}
            </span>
          </div>
        </div>

        {/* Bottom row: penalty dots */}
        <div className="flex items-center gap-0">
          <div className="flex-1 flex justify-end pr-3 gap-[3px]">
            {myDots.map((d, i) => <Dot key={i} value={d} />)}
          </div>
          <div className="w-[72px] shrink-0" />
          <div className="flex-1 flex justify-start pl-3 gap-[3px]">
            {theirDots.map((d, i) => <Dot key={i} value={d} />)}
          </div>
        </div>
      </div>
    </div>
  )
}
