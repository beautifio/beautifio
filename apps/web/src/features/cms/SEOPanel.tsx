"use client"

import { useState } from "react"
import { Search, Sparkles, ChevronDown, ChevronUp, RotateCw, ExternalLink, Check, AlertTriangle, X } from "lucide-react"

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

export function SEOPanel() {
  const [seoScore] = useState(72)

  return (
    <aside className="w-[420px] flex-shrink-0 overflow-y-auto p-4 space-y-3" style={{ borderLeft: "1px solid #E2E8F0", background: "#F8FAFC" }}>
      {/* SEO Score */}
      <Card title="🎯 SEO Score">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#E2E8F0" strokeWidth="6" fill="none" />
              <circle cx="32" cy="32" r="28" stroke={seoScore >= 80 ? "#22C55E" : seoScore >= 50 ? "#FFC64F" : "#EF4444"} strokeWidth="6" fill="none" strokeDasharray={`${seoScore * 1.76} 176`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: "#1E2938" }}>{seoScore}</span>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#FFC64F" }}>Cukup Baik</p>
            <p className="text-[10px] mt-0.5" style={{ color: "#647488" }}>3 saran perbaikan</p>
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          {["Tambahkan internal link", "Optimalkan meta description", "Alt text gambar belum lengkap"].map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <AlertTriangle size={12} style={{ color: "#FFC64F", flexShrink: 0 }} />
              <span className="text-[10px]" style={{ color: "#647488" }}>{s}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Focus Keyword */}
      <Card title="🔑 Focus Keyword">
        <div className="flex items-center gap-2 mb-2">
          <input placeholder="Kata kunci utama..." className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} />
          <button className="p-2 rounded-lg cursor-pointer" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>
            <Search size={14} />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["kesadaran diri", "refleksi harian", "pengembangan diri", "psikologi"].map(k => (
            <span key={k} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>{k}</span>
          ))}
        </div>
      </Card>

      {/* SEO Title + Meta */}
      <Card title="🏷️ SEO Title & Meta">
        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium" style={{ color: "#647488" }}>SEO Title</span>
              <span className="text-[10px]" style={{ color: "#22C55E" }}>58/70</span>
            </div>
            <input className="w-full px-3 py-1.5 rounded-lg border text-[11px] outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} defaultValue="Mengenal Diri Sendiri: Panduan Kesadaran Diri | Beautifio" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-medium" style={{ color: "#647488" }}>Meta Description</span>
              <span className="text-[10px]" style={{ color: "#EF4444" }}>182/160</span>
            </div>
            <textarea rows={2} className="w-full px-3 py-1.5 rounded-lg border text-[11px] outline-none resize-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} defaultValue="Pelajari cara mengenal diri sendiri lebih dalam melalui refleksi harian, memahami kepribadian, dan menemukan potensi terbaikmu." />
          </div>
          <button className="flex items-center gap-1 text-[10px] font-medium cursor-pointer" style={{ color: "#6BB9D4" }}>
            <Sparkles size={11} /> Generate dengan AI
          </button>
        </div>
      </Card>

      {/* Slug */}
      <Card title="🔗 Slug URL">
        <div className="flex items-center gap-2">
          <input className="flex-1 px-3 py-1.5 rounded-lg border text-[11px] outline-none" style={{ borderColor: "#E2E8F0", color: "#1E2938" }} defaultValue="mengenal-diri-sendiri-kesadaran-diri" />
          <button className="p-1.5 rounded-lg cursor-pointer" style={{ background: "rgba(8,68,99,0.06)", color: "#084463" }}>
            <RotateCw size={13} />
          </button>
        </div>
      </Card>

      {/* Readability */}
      <Card title="📖 Readability">
        <div className="space-y-2">
          {[
            { label: "Overall Score", value: "Baik • Grade 8", color: "#22C55E" },
            { label: "Sentence Length", value: "Rata-rata 14 kata", color: "#22C55E" },
            { label: "Paragraph Length", value: "Baik (2-4 kalimat)", color: "#22C55E" },
            { label: "Passive Voice", value: "12% (perlu dikurangi)", color: "#FFC64F" },
            { label: "Transition Words", value: "8% (cukup)", color: "#22C55E" },
          ].map(r => (
            <div key={r.label} className="flex items-center justify-between">
              <span className="text-[10px]" style={{ color: "#647488" }}>{r.label}</span>
              <span className="text-[10px] font-medium" style={{ color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Checklist */}
      <Card title="✅ SEO Checklist" defaultOpen={false}>
        <div className="space-y-1.5">
          {[
            { label: "Focus Keyword in Title", done: true },
            { label: "Meta Description Length", done: false },
            { label: "Alt Text on Images", done: false },
            { label: "Internal Links", done: false },
            { label: "External Links", done: true },
            { label: "Readability Grade < 9", done: true },
            { label: "Schema Markup", done: false },
            { label: "Featured Image", done: true },
            { label: "Table of Contents", done: false },
          ].map(c => (
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
          <p className="text-xs font-medium" style={{ color: "#1a0dab" }}>Mengenal Diri Sendiri: Panduan Kesadaran Diri | Beautifio</p>
          <p className="text-[10px]" style={{ color: "#006621" }}>beautifio.id › inspirasi › mengenal-diri-sendiri</p>
          <p className="text-[10px] mt-0.5 leading-relaxed" style={{ color: "#545454" }}>Pelajari cara mengenal diri sendiri lebih dalam melalui refleksi harian, memahami kepribadian, dan menemukan potensi terbaikmu.</p>
        </div>
      </Card>
    </aside>
  )
}
