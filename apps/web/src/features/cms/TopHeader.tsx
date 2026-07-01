"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, Eye, Save, Clock, Send, Check, Search, Image as ImageIcon, Calendar, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCMS } from "./CMSContext"

export function TopHeader() {
  const router = useRouter()
  const { title: articleTitle, content, slug, wordCount, seoTitle, metaDesc, setSeoTitle, setMetaDesc } = useCMS()
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [articleId, setArticleId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [scheduleDate, setScheduleDate] = useState("")
  const [scheduleTime, setScheduleTime] = useState("08:00")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [coverUrl, setCoverUrl] = useState("")
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const doSave = useCallback(async (status: "draft" | "publish" | "schedule") => {
    setSaving(true)
    try {
      const body: any = { article_id: articleId, title: articleTitle, content, slug, status }
      if (seoTitle) body.seo_title = seoTitle
      if (metaDesc) body.meta_description = metaDesc
      if (coverUrl) body.cover_image = coverUrl
      if (status === "schedule") body.scheduled_at = `${scheduleDate}T${scheduleTime}:00.000Z`

      const res = await fetch("/api/admin/konten/posts/save", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.id) {
        if (!articleId) setArticleId(data.id)
        setLastSaved(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))
        setShowToast(status === "publish" ? "Dipublikasikan!" : status === "schedule" ? "Dijadwalkan!" : "Disimpan")
        setShowSchedule(false)
        setTimeout(() => setShowToast(""), 2000)
      }
    } catch {} finally { setSaving(false) }
  }, [articleId, articleTitle, content, slug, seoTitle, metaDesc, coverUrl, scheduleDate, scheduleTime])

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (!content) return
    saveTimer.current = setTimeout(() => doSave("draft"), 30000)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [content, articleId])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    const { supabase } = await import("@/lib/supabase/client")
    if (!supabase) return
    const { data } = await supabase.from("stories")
      .select("id, title, is_published, updated_at")
      .ilike("title", `%${searchQuery}%`)
      .order("updated_at", { ascending: false }).limit(5)
    setSearchResults(data || [])
  }

  const loadArticle = (s: any) => {
    router.push(`/admin/konten/posts/editor?id=${s.id}`)
  }

  return (
    <header className="h-[72px] flex items-center gap-4 px-6 flex-shrink-0 relative" style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button onClick={() => router.push("/admin/konten/posts")} className="flex items-center gap-1.5 text-sm font-medium cursor-pointer" style={{ color: "#647488" }}>
        <ArrowLeft size={16} /> Kembali
      </button>

      {lastSaved ? (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "#22C55E12", color: "#22C55E" }}>
          <Check size={10} /> Tersimpan {lastSaved}
        </span>
      ) : (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#64748812", color: "#647488" }}>
          <Clock size={10} className="inline mr-1" /> Belum tersimpan
        </span>
      )}

      <div className="flex-1" />

      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-1.5">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleSearch(); if (e.key === "Escape") setShowSearch(false) }} onFocus={() => setShowSearch(true)} placeholder="Cari artikel..." className="w-40 px-3 py-2 rounded-xl border text-xs outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
          <button onClick={handleSearch} className="p-2 rounded-xl cursor-pointer hover:bg-gray-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
            <Search size={14} />
          </button>
        </div>
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full right-0 mt-1 w-72 rounded-xl border shadow-xl z-50" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            {searchResults.map((s: any) => (
              <button key={s.id} onClick={() => { loadArticle(s); setShowSearch(false) }} className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 border-b last:border-0 transition-colors cursor-pointer" style={{ borderColor: "#E2E8F0", color: s.is_published ? "#22C55E" : "#FFC64F" }}>
                <p className="font-semibold" style={{ color: "#1E2938" }}>{s.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#647488" }}>{s.is_published ? "Published" : "Draft"} · {new Date(s.updated_at).toLocaleDateString("id-ID")}</p>
              </button>
            ))}
            <button onClick={() => { router.push("/admin/konten/posts"); setShowSearch(false) }} className="w-full text-center px-4 py-2 text-[10px] font-semibold hover:bg-gray-50 cursor-pointer" style={{ color: "#084463" }}>Lihat semua →</button>
          </div>
        )}
      </div>

      {/* Cover Image */}
      <button onClick={() => { const u = window.prompt("URL cover image:", coverUrl); if (u) setCoverUrl(u) }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50" style={{ color: coverUrl ? "#22C55E" : "#647488", border: "1px solid #E2E8F0" }}>
        <ImageIcon size={14} /> {coverUrl ? "Ganti Cover" : "Cover"}
      </button>

      {/* Preview */}
      <button onClick={() => { /* noop - preview needs articleId */ }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50 disabled:opacity-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
        <Eye size={14} /> Preview
      </button>

      {/* Draft */}
      <button onClick={() => doSave("draft")} disabled={saving || wordCount === 0} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50 disabled:opacity-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
        <Save size={14} /> {saving ? "Menyimpan..." : "Draft"}
      </button>

      {/* Schedule */}
      <div className="relative">
        <button onClick={() => setShowSchedule(!showSchedule)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
          <Calendar size={14} /> Jadwalkan
        </button>
        {showSchedule && (
          <div className="absolute top-full right-0 mt-2 w-64 p-4 rounded-xl border shadow-xl z-50" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold" style={{ color: "#1E2938" }}>Jadwalkan Publish</span>
              <button onClick={() => setShowSchedule(false)}><X size={14} style={{ color: "#647488" }} /></button>
            </div>
            <label className="block mb-2">
              <span className="text-[10px] font-medium" style={{ color: "#647488" }}>Tanggal</span>
              <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full mt-0.5 px-3 py-2 rounded-lg border text-xs outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
            </label>
            <label className="block mb-3">
              <span className="text-[10px] font-medium" style={{ color: "#647488" }}>Jam</span>
              <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full mt-0.5 px-3 py-2 rounded-lg border text-xs outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
            </label>
            <button onClick={() => doSave("schedule")} disabled={!scheduleDate || saving} className="w-full py-2 rounded-xl text-xs font-semibold text-white cursor-pointer disabled:opacity-50" style={{ background: "#084463" }}>
              <Calendar size={12} className="inline mr-1" /> Jadwalkan
            </button>
          </div>
        )}
      </div>

      {/* Publish */}
      <button onClick={() => doSave("publish")} disabled={saving || wordCount === 0} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: "#084463" }}>
        <Send size={14} /> {saving ? "..." : "Publish"}
      </button>

      {/* Toast */}
      {showToast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg z-50" style={{ background: "#084463" }}>
          {showToast}
        </div>
      )}
    </header>
  )
}
