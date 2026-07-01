"use client"

import { FilePlus, LayoutDashboard, FileText, Archive, Calendar, Trash2, Tag, FolderOpen, Image, MessageCircle, BarChart3, Settings, HardDrive } from "lucide-react"
import { useState } from "react"

const primaryItems = [
  { icon: FilePlus, label: "Artikel Baru", active: true },
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: FileText, label: "Semua Artikel" },
  { icon: Archive, label: "Draft" },
  { icon: SendIcon, label: "Published" },
  { icon: Calendar, label: "Terjadwal" },
  { icon: Trash2, label: "Trash" },
]

const secondaryItems = [
  { icon: Tag, label: "Kategori" },
  { icon: FolderOpen, label: "Tags" },
  { icon: Image, label: "Media" },
  { icon: MessageCircle, label: "Komentar" },
  { icon: BarChart3, label: "Analitik" },
  { icon: Settings, label: "Pengaturan" },
]

function SendIcon(props: any) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function Sidebar() {
  const [active, setActive] = useState("Artikel Baru")

  return (
    <aside className="w-[260px] flex flex-col flex-shrink-0 overflow-y-auto" style={{ background: "#084463" }}>
      <div className="flex items-center gap-2 px-4 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#FFC64F" }}>
          <span className="text-xs font-bold" style={{ color: "#084463" }}>B</span>
        </div>
        <span className="text-sm font-bold" style={{ color: "#FFFFFF", fontFamily: "Poppins, sans-serif" }}>Beautifio CMS</span>
      </div>

      <nav className="flex-1 py-3">
        <div className="px-3 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Utama</span>
        </div>
        {primaryItems.map(item => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all text-left cursor-pointer"
            style={{
              background: active === item.label ? "rgba(255,255,255,0.12)" : "transparent",
              color: active === item.label ? "#FFFFFF" : "rgba(255,255,255,0.5)",
              margin: "0 6px",
              borderRadius: 10,
              width: "calc(100% - 12px)",
            }}
          >
            <item.icon size={16} className="flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}

        <div className="px-3 mt-4 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.3)" }}>Lainnya</span>
        </div>
        {secondaryItems.map(item => (
          <button
            key={item.label}
            onClick={() => setActive(item.label)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium transition-all text-left cursor-pointer"
            style={{
              background: active === item.label ? "rgba(255,255,255,0.12)" : "transparent",
              color: active === item.label ? "#FFFFFF" : "rgba(255,255,255,0.5)",
              margin: "0 6px",
              borderRadius: 10,
              width: "calc(100% - 12px)",
            }}
          >
            <item.icon size={16} className="flex-shrink-0" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", padding: "12px" }}>
        <div className="flex items-center gap-2 mb-2">
          <HardDrive size={14} style={{ color: "rgba(255,255,255,0.4)" }} />
          <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>Storage 45%</span>
        </div>
        <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
          <div className="h-full rounded-full" style={{ width: "45%", background: "#6BB9D4" }} />
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)", color: "#FFFFFF" }}>TR</div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium truncate" style={{ color: "#FFFFFF" }}>Tara Redaksi</p>
          <p className="text-[10px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>Beautifio Workspace</p>
        </div>
      </div>
    </aside>
  )
}
