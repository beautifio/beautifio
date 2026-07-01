"use client"

import { useState, useEffect } from "react"
import { Loader2, Check, X } from "lucide-react"

export default function AdminMitraPage() {
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"pending" | "approved" | "rejected">("pending")
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch("/api/admin/mitra").then(r => r.json()).then(d => { setApps(d.applications || []); setLoading(false) })
  }, [])

  const handleAction = async (id: string, action: string, notes?: string) => {
    setSaving(true)
    await fetch("/api/admin/mitra", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ app_id: id, action, admin_notes: notes }) })
    setRejectId(null); setRejectNote(""); setSaving(false)
    setApps(prev => prev.map(a => a.id === id ? { ...a, status: action === "approve" ? "approved" : "rejected", admin_notes: notes } : a))
  }

  const filtered = apps.filter(a => a.status === (tab === "pending" ? "pending_review" : tab))

  if (loading) return <div className="flex justify-center py-16"><Loader2 size={24} className="animate-spin" style={{ color: "#084463" }} /></div>

  return (
    <div className="space-y-4 max-w-2xl p-6">
      <h1 className="text-lg font-bold" style={{ color: "#1E2938", fontFamily: "Poppins, sans-serif" }}>👥 Manajemen Mitra</h1>
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
        {(["pending","approved","rejected"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className="flex-1 py-2 rounded-lg text-xs font-semibold cursor-pointer" style={{ background: tab === t ? "#FFFFFF" : "transparent", color: tab === t ? "#1E2938" : "#647488", boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.06)" : "none" }}>{t === "pending" ? `⏳ Pending (${apps.filter(a => a.status === "pending_review").length})` : t === "approved" ? "✅ Disetujui" : "❌ Ditolak"}</button>
        ))}
      </div>
      {filtered.length === 0 ? <p className="text-xs text-center py-8" style={{ color: "#647488" }}>Tidak ada</p> : (
        <div className="space-y-2">
          {filtered.map(a => (
            <div key={a.id} className="p-4 rounded-xl border" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold" style={{ color: "#1E2938" }}>{a.full_name}</span>
                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: a.role === "psychologist" ? "rgba(255,198,79,0.1)" : "rgba(34,197,94,0.1)", color: a.role === "psychologist" ? "#FFC64F" : "#22C55E" }}>{a.role === "psychologist" ? "Psikolog" : "Volunteer"}</span>
                </div>
                <span className="text-[10px]" style={{ color: "#647488" }}>{new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" })}</span>
              </div>
              <div className="text-xs mb-2" style={{ color: "#647488" }}>
                {a.phone && <span>📱 {a.phone} · </span>}
                {a.email && <span>{a.email} · </span>}
                {a.credentials && <span>{a.credentials} · </span>}
                {a.experience_years > 0 && <span>{a.experience_years} thn</span>}
                {a.category && <span>📂 {a.category}</span>}
                {a.motivation && <p className="mt-1 italic">"{a.motivation}"</p>}
              </div>
              {a.status === "pending_review" && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(a.id, "approve")} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-white" style={{ background: "#22C55E" }}><Check size={12} /> Setujui</button>
                  <button onClick={() => setRejectId(a.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer" style={{ background: "rgba(239,68,68,0.08)", color: "#EF4444" }}><X size={12} /> Tolak</button>
                </div>
              )}
              {rejectId === a.id && (
                <div className="mt-2 flex gap-2">
                  <input value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Alasan penolakan" className="flex-1 px-2 py-1.5 text-xs rounded-lg border" style={{ borderColor: "#E2E8F0" }} />
                  <button onClick={() => handleAction(a.id, "reject", rejectNote)} disabled={saving} className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-white" style={{ background: "#EF4444" }}>Kirim</button>
                </div>
              )}
              {a.admin_notes && <p className="text-[10px] mt-1" style={{ color: "#EF4444" }}>Alasan: {a.admin_notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
