"use client"

import { ArrowLeft, Eye, Save, Clock, Send, Bell, Search } from "lucide-react"
import { useRouter } from "next/navigation"

export function TopHeader({ title }: { title: string }) {
  const router = useRouter()

  return (
    <header
      className="h-[72px] flex items-center gap-4 px-6 flex-shrink-0"
      style={{ background: "#FFFFFF", borderBottom: "1px solid #E2E8F0", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium cursor-pointer" style={{ color: "#647488" }}>
        <ArrowLeft size={16} /> Kembali
      </button>

      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#22C55E12", color: "#22C55E" }}>
        <Clock size={10} className="inline mr-1" />
        Tersimpan 2m lalu
      </span>

      <div className="flex-1" />

      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
        <Search size={14} /> Cari
      </button>

      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
        <Eye size={14} /> Preview
      </button>

      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
        <Save size={14} /> Draft
      </button>

      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors hover:bg-gray-50" style={{ color: "#647488", border: "1px solid #E2E8F0" }}>
        <Clock size={14} /> Jadwalkan
      </button>

      <button className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer transition-opacity hover:opacity-90" style={{ background: "#084463" }}>
        <Send size={14} /> Publish
      </button>

      <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer" style={{ background: "#F8FAFC" }}>
        <Bell size={16} style={{ color: "#647488" }} />
      </div>

      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white cursor-pointer" style={{ background: "#6BB9D4" }}>
        TR
      </div>
    </header>
  )
}
