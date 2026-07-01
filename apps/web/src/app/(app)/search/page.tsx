"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Loader2, BookOpen, Users, Briefcase, ArrowRight } from "lucide-react"

const TYPE_LABELS: Record<string, { label: string; icon: typeof BookOpen }> = {
  articles: { label: "Artikel", icon: BookOpen },
  circles: { label: "Circle", icon: Users },
  opportunities: { label: "Peluang", icon: Briefcase },
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<{ type: string; items: any[] }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        if (r.ok) setResults((await r.json()).results || [])
      } catch { setResults([]) }
      setLoading(false)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="min-h-screen pb-24" style={{ background: "#F8FAFC" }}>
      <div className="max-w-content mx-auto px-6 pt-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#647488" }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Cari artikel, circle, peluang..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none"
            style={{ borderColor: "#E2E8F0", color: "#1E2938" }}
            autoFocus
          />
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} />
          </div>
        )}

        {!loading && query.length >= 2 && results.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "#647488" }}>Tidak ditemukan untuk &quot;{query}&quot;</p>
          </div>
        )}

        {results.map(group => {
          const meta = TYPE_LABELS[group.type] || { label: group.type, icon: BookOpen }
          const Icon = meta.icon
          return (
            <div key={group.type} className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} style={{ color: "#6BB9D4" }} />
                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#647488" }}>{meta.label}</span>
              </div>
              <div className="space-y-2">
                {group.items.map((item: any) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.href)}
                    className="w-full text-left p-4 rounded-xl border cursor-pointer hover:bg-white transition-colors"
                    style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#1E2938" }}>{item.title}</p>
                        {item.subtitle && (
                          <p className="text-xs mt-0.5 truncate" style={{ color: "#647488" }}>{item.subtitle}</p>
                        )}
                      </div>
                      <ArrowRight size={14} style={{ color: "#E2E8F0", flexShrink: 0 }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        {query.length < 2 && (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "#647488" }}>Mulai ketik untuk mencari</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
