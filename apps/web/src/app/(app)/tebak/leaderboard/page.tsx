"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trophy, Medal, Loader2, Bot, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type LeaderboardEntry = {
  id: string
  full_name: string
  avatar_url: string | null
  total_games: number
  total_wins: number
  total_losses: number
  win_rate: number
  is_bot: boolean
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showBots, setShowBots] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    if (!supabase) { setLoading(false); return }

    const q = supabase
      .from("users")
      .select("id, full_name, avatar_url, total_games, total_wins, total_losses, is_bot")
      .gt("total_games", 0)

    if (!showBots) q.eq("is_bot", false)

    q.order("total_wins", { ascending: false })
      .order("total_games", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!data) { setPlayers([]); setLoading(false); return }
        const mapped: LeaderboardEntry[] = data.map((u: any) => ({
          ...u,
          win_rate: u.total_games > 0
            ? Math.round((u.total_wins / u.total_games) * 100)
            : 0,
        }))
        setPlayers(mapped)
        setLoading(false)
      })
  }, [showBots])

  return (
    <div className="min-h-screen bg-bg">
      <div className="bg-surface border-b border-border">
        <div className="max-w-content mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push("/tebak")} className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-text-primary">Leaderboard</h1>
        </div>
      </div>

      <div className="max-w-content mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-text-secondary">Pemain dengan total kemenangan terbanyak</p>
          <button
            onClick={() => setShowBots(!showBots)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              showBots
                ? "bg-primary/10 text-primary"
                : "bg-surface text-text-secondary border border-border"
            }`}
          >
            {showBots ? <User size={14} /> : <Bot size={14} />}
            {showBots ? "Pemain" : "Bot"}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
            <Trophy size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Belum ada data permainan</p>
            <p className="text-xs mt-1">Mainkan Tebak Aku untuk muncul di papan peringkat</p>
          </div>
        ) : (
          <div className="space-y-2">
            {players.map((p, i) => {
              let rankIcon = null
              let rankStyle = "bg-surface border-border"
              if (i === 0) { rankIcon = <Trophy size={16} className="text-yellow-500" />; rankStyle = "bg-yellow-50 border-yellow-200" }
              else if (i === 1) { rankIcon = <Medal size={16} className="text-gray-400" />; rankStyle = "bg-gray-50 border-gray-200" }
              else if (i === 2) { rankIcon = <Medal size={16} className="text-amber-600" />; rankStyle = "bg-amber-50 border-amber-200" }

              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-3 p-4 rounded-xl border ${rankStyle}`}
                >
                  <div className="w-8 text-center font-bold text-sm text-text-secondary">
                    {rankIcon || `#${i + 1}`}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-primary">
                        {p.full_name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-text-primary truncate">
                        {p.full_name}
                      </span>
                      {p.is_bot && (
                        <Bot size={12} className="text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary">
                      {p.total_games} game · {p.total_wins} menang · {p.total_losses} kalah
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      p.win_rate >= 70 ? "text-green-600" :
                      p.win_rate >= 40 ? "text-amber-600" :
                      "text-red-500"
                    }`}>
                      {p.win_rate}%
                    </p>
                    <p className="text-[10px] text-text-secondary">win rate</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
