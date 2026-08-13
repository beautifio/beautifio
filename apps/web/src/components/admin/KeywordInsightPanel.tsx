"use client"

import { useState } from "react"
import { Search, TrendingUp, Bot, BarChart3, Loader2, Lightbulb } from "lucide-react"

type Props = {
  localInsight: {
    curhat?: { title: string; users: string } | null
    journey?: { title: string } | null
    circle?: { name: string; members: string } | null
  } | null
}

export function KeywordInsightPanel({ localInsight }: Props) {
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSearch = async () => {
    if (!keyword.trim()) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/admin/konten/keyword-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword.trim() }),
      })
      if (!res.ok) throw new Error("API error")
      const result = await res.json()
      setData(result)
    } catch {
      setError("Gagal mengambil insight")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface rounded-2xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-text-secondary" />
          <h3 className="text-sm font-bold text-text-primary">Keyword Insight</h3>
        </div>
        <div className="flex gap-2 mt-3">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="Cari keyword: skincare routine..."
            className="flex-1 px-3 py-2 rounded-xl border border-border bg-bg text-sm outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={loading || !keyword.trim()}
            className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Analisis
          </button>
        </div>
        {error && <p className="text-xs text-danger mt-2">{error}</p>}
      </div>

      <div className="p-4 space-y-4">
        {/* Google Trends */}
        {keyword.trim() && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp size={14} className="text-accent" />
              <p className="text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Google Trends</p>
            </div>
            <a
              href={`https://trends.google.com/trends/explore?q=${encodeURIComponent(keyword.trim())}&geo=ID`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-border bg-bg hover:bg-muted transition-colors cursor-pointer text-xs font-medium text-text-secondary"
            >
              <TrendingUp size={14} className="text-accent" />
              Buka Google Trends untuk "{keyword.trim()}" →
            </a>
          </div>
        )}

        {/* AI Suggestions */}
        {data?.suggestions?.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Bot size={14} className="text-secondary" />
              <p className="text-[10px] font-semibold tracking-wider uppercase text-text-secondary">AI Suggestions</p>
              {data.searchVolume && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-text-secondary ml-auto">Volume {data.searchVolume} · Kompetisi {data.competition}</span>}
            </div>
            <div className="space-y-2">
              {data.suggestions.map((s: any, i: number) => (
                <div key={i} className="p-2.5 rounded-xl border border-border bg-bg hover:border-primary/30 transition-colors">
                  <p className="text-xs font-semibold text-text-primary">{s.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-text-secondary">{s.angle}</span>
                    {s.category && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/5 text-primary font-medium">{s.category}</span>}
                  </div>
                </div>
              ))}
            </div>
            {data.trendingTopics?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {data.trendingTopics.map((t: string, i: number) => (
                  <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">🔥 {t}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Local Beautifio Data */}
        {localInsight && (localInsight.curhat || localInsight.journey || localInsight.circle) && (
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <BarChart3 size={14} className="text-primary" />
              <p className="text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Data Komunitas Beautifio</p>
            </div>
            <div className="space-y-1.5">
              {localInsight.curhat && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 text-xs">
                  <Lightbulb size={12} className="text-primary shrink-0" />
                  <span className="text-text-secondary">Curhat populer: <strong className="text-text-primary">{localInsight.curhat.title}</strong> · {localInsight.curhat.users} user</span>
                </div>
              )}
              {localInsight.journey && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/5 text-xs">
                  <Lightbulb size={12} className="text-accent shrink-0" />
                  <span className="text-text-secondary">Journey trending: <strong className="text-text-primary">{localInsight.journey.title}</strong></span>
                </div>
              )}
              {localInsight.circle && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/5 text-xs">
                  <Lightbulb size={12} className="text-secondary shrink-0" />
                  <span className="text-text-secondary">Circle aktif: <strong className="text-text-primary">{localInsight.circle.name}</strong> · {localInsight.circle.members} member</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
