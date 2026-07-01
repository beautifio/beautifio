"use client"

import { useState, useMemo } from "react"
import { Search, Sparkles, ChevronDown, ChevronUp, RotateCw, Check, AlertTriangle, X } from "lucide-react"
import { useCMS } from "./CMSContext"

function Card({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors">
        <span className="text-xs font-semibold" style={{ color: "#1E2938" }}>{title}</span>
        {open ? <ChevronUp size={14} style={{ color: "#647488" }} /> : <ChevronDown size={14} style={{ color: "#647488" }} />}
      </button>
      {open && <div className="px-4 pb-3">{children}</div>}
    </div>
  )
}

function calculateSEOScore(params: {
  title: string; wordCount: number; keywords: string[]; headings: { level: number; text: string }[]
}): { score: number; checks: { label: string; done: boolean }[] } {
  const checks = [
    { label: "Focus Keyword in Title", done: params.keywords.some(k => params.title.toLowerCase().includes(k.toLowerCase())) },
    { label: "SEO Title 50-70 chars", done: params.title.length >= 30 && params.title.length <= 70 },
    { label: "Meta Description 120-160 chars", done: true },
    { label: "Word Count > 300", done: params.wordCount > 300 },
    { label: "Has H2 Headings", done: params.headings.some(h => h.level === 2) },
    { label: "Has H3 Headings", done: params.headings.some(h => h.level === 3) },
    { label: "Internal Links", done: false },
    { label: "External Links", done: true },
    { label: "Image Alt Text", done: false },
  ]
  const done = checks.filter(c => c.done).length
  return { score: Math.round((done / checks.length) * 100), checks }
}

export function SEOPanel() {
  const { title, subtitle, slug, wordCount, headings, keywords } = useCMS()
  const [focusKeyword, setFocusKeyword] = useState("")
  const [seoTitle, setSeoTitle] = useState(title)
  const [metaDesc, setMetaDesc] = useState(subtitle)

  const { score, checks } = useMemo(() => calculateSEOScore({ title, wordCount, keywords, headings }), [title, wordCount, keywords, headings])
  const scoreColor = score >= 80 ? "#22C55E" : score >= 50 ? "#FFC64F" : "#EF4444"
  const scoreLabel = score >= 80 ? "Baik" : score >= 50 ? "Cukup" : "Perlu Perbaikan"

  // Auto-sync SEO title when article title changes
  useState(() => { setSeoTitle(title) })
  useState(() => { setMetaDesc(subtitle) })

  const keywordDensity = wordCount > 0 && focusKeyword
    ? Math.round((title.toLowerCase().split(focusKeyword.toLowerCase()).length - 1) / wordCount * 100 * 100) / 100
    : 0

  return (
    <aside className="w-[420px] flex-shrink-0 overflow-y-auto p-4 space-y-3" style={{ borderLeft: "1px solid #E2E8F0", background: "#F8FAFC" }}>
      {/* SEO Score — live */}
      <Card title="🎯 SEO Score">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#E2E8F0" strokeWidth="6" fill="none" />
              <circle cx="32" cy="32" r="28" stroke={scoreColor} strokeWidth="6" fill="none" strokeDasharray={`${score * 1.76} 176`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: "#1E2938" }}>{score}</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: scoreColor }}>{scoreLabel}</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#647488" }}>
              {checks.filter(c => !c.done).length} saran perbaikan
            </p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {checks.filter(c => !c.done).slice(0, 3).map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <AlertTriangle size={12} style={{ color: "#FFC64F", flexShrink: 0 }} />
              <span className="text-[10px]" style={{ color: "#647488" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Focus Keyword */}
      <Card title="🔑 Focus Keyword">
        <div className="flex items-center gap-2 mb-2">
          <input
            value={focusKeyword}
            onChange={e => setFocusKeyword(e.target.value)}
            placeholder="Kata kunci utama..."
            className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none"
            style={{ borderColor: "#E2E8F0", color: "#1E2938" }}
          />
          <button className="p-2 rounded-lg cursor-pointer" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>
            <Search size={14} />
          </button>
        </div>
        {focusKeyword && (
          <div className="text-[10px] space-y-1 mb-2" style={{ color: "#647488" }}>
            <div className="flex justify-between"><span>Keyword Density</span><span style={{ color: keywordDensity > 3 ? "#EF4444" : "#22C55E" }}>{keywordDensity}%</span></div>
            <div className="flex justify-between"><span>In Title</span><span>{title.toLowerCase().includes(focusKeyword.toLowerCase()) ? <Check size={12} style={{ color: "#22C55E" }} /> : <X size={12} style={{ color: "#EF4444" }} />}</span></div>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {keywords.map(k => (
            <button key={k} onClick={() => setFocusKeyword(k)} className="text-[10px] px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors" style={{ background: focusKeyword === k ? "rgba(8,68,99,0.12)" : "rgba(8,68,99,0.06)", color: "#084463" }}>{k}</button>
          ))}
        </div>
      </Card>

      {/* SEO Title & Meta */}
      <Card title="🏷️ SEO Title & Meta">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium" style={{ color: "#647488" }}>SEO Title</span>
              <span className="text-[10px]" style={{ color: seoTitle.length > 70 ? "#EF4444" : seoTitle.length < 30 ? "#FFC64F" : "#22C55E" }}>{seoTitle.length}/70</span>
            </div>
            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border text-[11px] outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium" style={{ color: "#647488" }}>Meta Description</span>
              <span className="text-[10px]" style={{ color: metaDesc.length > 160 ? "#EF4444" : metaDesc.length < 120 ? "#FFC64F" : "#22C55E" }}>{metaDesc.length}/160</span>
            </div>
            <textarea rows={2} value={metaDesc} onChange={e => setMetaDesc(e.target.value)} className="w-full px-3 py-1.5 rounded-lg border text-[11px] outline-none resize-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
          </div>
          <button className="flex items-center gap-1 text-[10px] font-medium cursor-pointer" style={{ color: "#6BB9D4" }}>
            <Sparkles size={11} /> Generate dengan AI
          </button>
        </div>
      </Card>

      {/* Slug */}
      <Card title="🔗 Slug URL">
        <div className="flex items-center gap-2">
          <input className="flex-1 px-3 py-1.5 rounded-lg border text-[11px] outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} value={slug} readOnly />
          <button className="p-1.5 rounded-lg cursor-pointer" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }} onClick={() => navigator.clipboard.writeText(slug)}>
            <RotateCw size={13} />
          </button>
        </div>
      </Card>

      {/* Heading Structure — live from editor */}
      <Card title="📑 Heading Structure" defaultOpen={headings.length > 0}>
        {headings.length === 0 ? (
          <p className="text-[10px]" style={{ color: "#647488" }}>Belum ada heading. Tambahkan H2 dan H3.</p>
        ) : (
          <div className="space-y-1">
            {headings.map((h, i) => {
              const validHierarchy = i === 0 ? h.level <= 2 : h.level <= (headings[i - 1]?.level || 2) + 1
              return (
                <div key={i} className="flex items-center gap-2" style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
                  {validHierarchy ? <Check size={11} style={{ color: "#22C55E" }} /> : <AlertTriangle size={11} style={{ color: "#FFC64F" }} />}
                  <span className="text-[10px] font-mono" style={{ color: "#647488" }}>H{h.level}</span>
                  <span className="text-[10px] truncate" style={{ color: "#1E2938" }}>{h.text}</span>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Readability — live */}
      <Card title="📖 Readability">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "#647488" }}>Word Count</span>
            <span className="text-[10px] font-medium" style={{ color: wordCount >= 300 ? "#22C55E" : "#FFC64F" }}>{wordCount} kata{wordCount < 300 ? " (min 300)" : ""}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px]" style={{ color: "#647488" }}>Reading Time</span>
            <span className="text-[10px] font-medium" style={{ color: "#1E2938" }}>{Math.max(1, Math.ceil(wordCount / 200))} menit</span>
          </div>
        </div>
      </Card>

      {/* Checklist — live */}
      <Card title="✅ SEO Checklist" defaultOpen={false}>
        <div className="space-y-1.5">
          {checks.map(c => (
            <div key={c.label} className="flex items-center gap-2">
              {c.done ? <Check size={12} style={{ color: "#22C55E" }} /> : <X size={12} style={{ color: "#EF4444" }} />}
              <span className="text-[10px]" style={{ color: c.done ? "#22C55E" : "#647488" }}>{c.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Google Preview */}
      <Card title="🔍 Google Preview" defaultOpen={false}>
        <div className="p-2 rounded-lg" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0" }}>
          <p className="text-xs font-medium" style={{ color: "#1a0dab" }}>{seoTitle.slice(0, 70)}</p>
          <p className="text-[10px]" style={{ color: "#006621" }}>beautifio.id › inspirasi › {slug.slice(0, 40)}</p>
          <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "#545454" }}>{metaDesc.slice(0, 160)}</p>
        </div>
      </Card>
    </aside>
  )
}
