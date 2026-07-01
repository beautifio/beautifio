"use client"

import { useState } from "react"
import { Bold, Italic, Underline, Strikethrough, List, ListOrdered, CheckSquare, AlignLeft, AlignCenter, AlignRight, Link, Image, Video, Code, Undo, Redo, Quote, Minus, Sparkles, Heading1, Heading2, Heading3, Table } from "lucide-react"

const TOOLBAR_GROUPS = [
  [
    { icon: Bold, label: "Bold" },
    { icon: Italic, label: "Italic" },
    { icon: Underline, label: "Underline" },
    { icon: Strikethrough, label: "Strike" },
  ],
  [
    { icon: Heading1, label: "H1" },
    { icon: Heading2, label: "H2" },
    { icon: Heading3, label: "H3" },
  ],
  [
    { icon: List, label: "Bullet List" },
    { icon: ListOrdered, label: "Numbered List" },
    { icon: CheckSquare, label: "Checklist" },
  ],
  [
    { icon: AlignLeft, label: "Left" },
    { icon: AlignCenter, label: "Center" },
    { icon: AlignRight, label: "Right" },
  ],
  [
    { icon: Table, label: "Table" },
    { icon: Link, label: "Link" },
    { icon: Image, label: "Image" },
    { icon: Video, label: "Video" },
    { icon: Code, label: "Code" },
    { icon: Quote, label: "Quote" },
    { icon: Minus, label: "Divider" },
  ],
  [
    { icon: Undo, label: "Undo" },
    { icon: Redo, label: "Redo" },
  ],
]

export function ArticleEditor() {
  const [title, setTitle] = useState("Mengenal Diri Sendiri: Perjalanan Menuju Kesadaran Diri yang Lebih Dalam")
  const [subtitle, setSubtitle] = useState("Bagaimana memahami kepribadian, nilai hidup, dan potensi diri melalui refleksi harian")
  const [content, setContent] = useState("Mulai menulis artikelmu di sini...\n\nGunakan toolbar di atas untuk format teks. Kamu bisa menambahkan heading, gambar, tabel, kode, kutipan, dan masih banyak lagi.\n\nEditor ini dirancang agar kamu fokus menulis tanpa gangguan.")

  return (
    <div className="max-w-[900px] mx-auto">
      {/* Title */}
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Judul Artikel..."
        className="w-full text-[40px] font-bold leading-tight outline-none bg-transparent mb-2"
        style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}
      />

      {/* Subtitle */}
      <input
        value={subtitle}
        onChange={e => setSubtitle(e.target.value)}
        placeholder="Subtitle atau deskripsi singkat..."
        className="w-full text-lg outline-none bg-transparent mb-6"
        style={{ color: "#647488" }}
      />

      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 mb-6 p-1.5 rounded-2xl border sticky top-0 z-10" style={{ background: "#FFFFFF", borderColor: "#E2E8F0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && <div className="w-px h-5 mx-0.5" style={{ background: "#E2E8F0" }} />}
            {group.map(item => (
              <button
                key={item.label}
                title={item.label}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer hover:bg-gray-50"
                style={{ color: "#647488" }}
              >
                <item.icon size={15} />
              </button>
            ))}
          </div>
        ))}
        <div className="w-px h-5 mx-0.5" style={{ background: "#E2E8F0" }} />
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ml-1"
          style={{ background: "rgba(8,68,99,0.08)", color: "#084463" }}
        >
          <Sparkles size={13} /> AI Writing
        </button>
      </div>

      {/* Reading Info */}
      <div className="flex items-center gap-4 mb-6 text-xs" style={{ color: "#647488" }}>
        <span>📖 8 menit membaca</span>
        <span>📝 1,247 kata</span>
        <span>💬 0 komentar</span>
      </div>

      {/* Content Editor */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Mulai menulis..."
        className="w-full min-h-[400px] outline-none bg-transparent resize-none leading-relaxed text-[15px]"
        style={{ color: "#1E2938", fontFamily: "Inter, sans-serif", lineHeight: "1.8" }}
      />

      {/* Bottom Insight Section */}
      <div className="mt-12 pt-8" style={{ borderTop: "1px solid #E2E8F0" }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>📊 Insight Konten</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Internal Links", value: "3 saran", icon: "🔗" },
            { label: "Related Articles", value: "5 ditemukan", icon: "📄" },
            { label: "FAQ Suggestions", value: "4 pertanyaan", icon: "❓" },
            { label: "Heading Structure", value: "H1 → H2 → H3 ✓", icon: "📑" },
            { label: "Readability", value: "Grade 8 • Mudah", icon: "📖" },
            { label: "Word Count", value: "1,247 kata", icon: "📝" },
          ].map(card => (
            <div key={card.label} className="p-3 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="flex items-center gap-2">
                <span>{card.icon}</span>
                <span className="text-xs font-semibold" style={{ color: "#1E2938" }}>{card.label}</span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: "#647488" }}>{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
