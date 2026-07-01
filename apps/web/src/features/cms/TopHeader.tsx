"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ArrowLeft, Eye, Save, Clock, Send, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCMS } from "./CMSContext"

export function TopHeader() {
  const router = useRouter()
  const { title: articleTitle, content, slug, wordCount } = useCMS()
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)
  const [articleId, setArticleId] = useState<string | null>(null)
  const [showToast, setShowToast] = useState("")
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const doSave = useCallback(async (status: "draft" | "publish") => {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/konten/posts/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ article_id: articleId, title: articleTitle, content, slug, status }),
      })
      const data = await res.json()
      if (data.id) {
        if (!articleId) setArticleId(data.id)
        setLastSaved(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }))
        const msg = status === "publish" ? "Dipublikasikan!" : "Disimpan"
        setShowToast(msg)
        setTimeout(() => setShowToast(""), 2000)
      }
    } catch {} finally {
      setSaving(false)
    }
  }, [articleId, articleTitle, content, slug])

  // Auto-save every 30 seconds
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    if (!content) return
    saveTimer.current = setTimeout(() => doSave("draft"), 30000)
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current) }
  }, [content, articleId])

  const handlePreview = () => {
    if (!articleId && !content) return
    // Show inline preview via alert or open new tab
    if (articleId) window.open(`/inspirasi/preview/${articleId}`, "_blank")
    else window.open(`/inspirasi/preview?title=${encodeURIComponent(articleTitle)}&content=${encodeURIComponent(content.slice(0, 500))}`, "_blank")
  }

  return (
    <header
      className="h-[72px] flex items-center gap-4 px-6 flex-shrink-0 relative"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <button onClick={() => router.push("/admin/konten/posts")} className="flex items-center gap-1.5 text-sm font-medium cursor-pointer" style={{ color: "#647488" }}>
        <ArrowLeft size={16} /> Kembali
      </button>

      {lastSaved ? (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: "#22C55E12", color: "#22C55E" }}>
          <Check size={10} /> Tersimpan {lastSaved}
        </span>
      ) : (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#64748812", color: "#647488" }}>
          <Clock size={10} className="inline mr-1" />
          Belum tersimpan
        </span>
      )}

      <div className="flex-1" />

      {showToast && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg animate-bounce" style={{ background: "#084463" }}>
          {showToast}
        </div>
      )}

      <button onClick={handlePreview} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }} disabled={!articleId}>
        <Eye size={14} /> Preview
      </button>

      <button onClick={() => doSave("draft")} disabled={saving || wordCount === 0} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50 disabled:opacity-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
        <Save size={14} /> {saving ? "Menyimpan..." : "Draft"}
      </button>

      <button onClick={() => doSave("publish")} disabled={saving || wordCount === 0} className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50" style={{ background: "#084463" }}>
        <Send size={14} /> {saving ? "..." : "Publish"}
      </button>
    </header>
  )
}
