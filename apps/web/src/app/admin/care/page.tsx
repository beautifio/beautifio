"use client"

import { useState, useEffect } from "react"
import {
  HeartHandshake, RefreshCw, CheckCircle, PlayCircle,
  XCircle, Clock, UserPlus, StickyNote, Plus, Edit2, Trash2,
} from "lucide-react"

const STATUS_LABELS: Record<string, string> = { pending: "Pending", in_progress: "In Progress", resolved: "Resolved", closed: "Closed" }
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
}

type Tab = "tickets" | "categories" | "officers"

export default function CareAdminPage() {
  const [tab, setTab] = useState<Tab>("tickets")

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { key: "tickets" as Tab, label: "Tickets" },
          { key: "categories" as Tab, label: "Kategori" },
          { key: "officers" as Tab, label: "Petugas" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
              tab === t.key
                ? "bg-primary text-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tickets" && <TicketsTab />}
      {tab === "categories" && <CategoriesTab />}
      {tab === "officers" && <OfficersTab />}
    </div>
  )
}

function TicketsTab() {
  const [tickets, setTickets] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [adminUsers, setAdminUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [tRes, sRes, uRes] = await Promise.all([
        fetch("/api/admin/care/tickets"),
        fetch("/api/admin/care/stats"),
        fetch("/api/admin/users?limit=100"),
      ])
      if (tRes.ok) { const { data } = await tRes.json(); setTickets(data || []) }
      if (sRes.ok) { const { data } = await sRes.json(); setStats(data) }
      if (uRes.ok) { const { data } = await uRes.json(); setAdminUsers(data?.filter((u: any) => ["admin", "superadmin"].includes(u.role)) || []) }
    } catch (e) { console.error("Failed to load", e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  async function updateStatus(id: string, status: string) {
    try {
      await fetch("/api/admin/care/tickets", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) })
      await fetchAll()
    } catch (e) { console.error("Update failed", e) }
  }

  async function assignTicket(id: string, assigned_to: string | null) {
    try {
      await fetch("/api/admin/care/tickets", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, assigned_to }) })
      await fetchAll()
    } catch (e) { console.error("Assign failed", e) }
  }

  const filtered = statusFilter ? tickets.filter((t) => t.status === statusFilter) : tickets

  const CATEGORY_LABELS: Record<string, string> = {
    kekerasan: "Kekerasan", pelecehan: "Pelecehan", kecemasan: "Kecemasan", depresi: "Depresi",
    trauma: "Trauma", hubungan: "Hubungan", karir: "Karir", keuangan: "Keuangan",
    adiksi: "Adiksi", spiritual: "Spiritual", keluarga: "Keluarga", pendidikan: "Pendidikan",
    identitas: "Identitas", lainnya: "Lainnya",
  }

  return (
    <>
      <h1 className="text-lg font-bold text-gray-900">Care Tickets</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {["pending", "in_progress", "resolved", "closed"].map((s) => {
            const count = stats.by_status[s]
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${statusFilter === s ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300" : "bg-white border-gray-200 hover:border-amber-200"}`}>
                <div className="flex items-center gap-2">
                  {s === "pending" ? <Clock className="w-4 h-4 text-yellow-500" /> : s === "in_progress" ? <PlayCircle className="w-4 h-4 text-blue-500" /> : s === "resolved" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-400" />}
                  <span className="text-[10px] font-medium text-gray-500">{STATUS_LABELS[s]}</span>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{count}</p>
              </button>
            )
          })}
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Tidak ada tiket</p>}
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[t.status]}`}>{STATUS_LABELS[t.status]}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{CATEGORY_LABELS[t.category] || t.category}</span>
                    {t.partner_type && <span className="text-[10px] text-gray-400">{t.partner_type}</span>}
                  </div>
                  {t.story && <p className="text-sm text-gray-900 line-clamp-3 mb-1">{t.story}</p>}
                  {t.form_data && typeof t.form_data === "object" && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {Object.keys(t.form_data).map((key) => {
                        const val = (t.form_data as any)[key]
                        return val ? <span key={key} className="text-[10px] px-2 py-0.5 bg-gray-50 rounded-full text-gray-500">{key}: {String(val)}</span> : null
                      })}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                    <span className="font-medium">{t.users?.full_name || t.users?.email}</span>
                    <span>{new Date(t.created_at).toLocaleString("id-ID")}</span>
                    {t.assigned_to && <span>Assigned to {adminUsers.find((u) => u.id === t.assigned_to)?.full_name || t.assigned_to}</span>}
                    {t.resolved_at && <span>Resolved {new Date(t.resolved_at).toLocaleString("id-ID")}</span>}
                  </div>
                  {t.notes && <p className="text-[10px] text-gray-400 mt-1 italic">Notes: {t.notes}</p>}
                </div>

                <div className="flex flex-col gap-1 flex-shrink-0">
                  {t.status === "pending" && (
                    <button onClick={() => updateStatus(t.id, "in_progress")}
                      className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center cursor-pointer" title="Take">
                      <PlayCircle className="w-3.5 h-3.5 text-blue-500" />
                    </button>
                  )}
                  {t.status === "in_progress" && (
                    <button onClick={() => updateStatus(t.id, "resolved")}
                      className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center cursor-pointer" title="Resolve">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    </button>
                  )}
                  {(t.status === "pending" || t.status === "in_progress") && (
                    <select onChange={(e) => assignTicket(t.id, e.target.value || null)} defaultValue={t.assigned_to || ""}
                      className="w-7 text-[8px] p-0 border-0 bg-transparent cursor-pointer" title="Assign">
                      <option value="">—</option>
                      {adminUsers.map((u) => <option key={u.id} value={u.id}>{u.full_name || u.email}</option>)}
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function CategoriesTab() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<any | null>(null)
  const [showForm, setShowForm] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const r = await fetch("/api/admin/care/stats")
      const supabase = (await import("@/lib/supabase/client")).createClient()
      if (!supabase) return
      const { data } = await supabase.from("care_categories").select("*").order("display_order")
      setCategories(data ?? [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchCategories() }, [])

  const saveCategory = async (cat: any) => {
    const supabase = (await import("@/lib/supabase/client")).createClient()
    if (!supabase) return
    if (cat.id) {
      await supabase.from("care_categories").update(cat).eq("id", cat.id)
    } else {
      await supabase.from("care_categories").insert(cat)
    }
    setEditing(null)
    setShowForm(false)
    fetchCategories()
  }

  const deleteCategory = async (id: string) => {
    if (!confirm("Hapus kategori ini?")) return
    const supabase = (await import("@/lib/supabase/client")).createClient()
    if (!supabase) return
    await supabase.from("care_categories").delete().eq("id", id)
    fetchCategories()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Kategori Bantuan</h1>
        <button onClick={() => { setEditing({}); setShowForm(true) }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium cursor-pointer">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {showForm && (
        <CategoryForm
          initial={editing}
          onSave={saveCategory}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-500">
                    {cat.contact_name && `${cat.contact_name} · `}
                    {cat.contact_phone || cat.contact_wa || "No kontak"}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(cat); setShowForm(true) }}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => deleteCategory(cat.id)}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function CategoryForm({ initial, onSave, onCancel }: { initial: any; onSave: (cat: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState<any>(initial?.id ? initial : {
    name: "", emoji: "🆘", description: "",
    contact_name: "", contact_phone: "", contact_wa: "", contact_email: "",
    display_order: 0, is_active: true,
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500">Nama</label>
          <input value={form.name} onChange={e => setForm((p: any) => ({...p, name: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Emoji</label>
          <input value={form.emoji} onChange={e => setForm((p: any) => ({...p, emoji: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500">Deskripsi</label>
        <textarea value={form.description} onChange={e => setForm((p: any) => ({...p, description: e.target.value}))} rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500">Nama Kontak</label>
          <input value={form.contact_name} onChange={e => setForm((p: any) => ({...p, contact_name: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Display Order</label>
          <input type="number" value={form.display_order} onChange={e => setForm((p: any) => ({...p, display_order: parseInt(e.target.value)}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500">Phone</label>
          <input value={form.contact_phone} onChange={e => setForm((p: any) => ({...p, contact_phone: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">WhatsApp</label>
          <input value={form.contact_wa} onChange={e => setForm((p: any) => ({...p, contact_wa: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Email</label>
          <input value={form.contact_email} onChange={e => setForm((p: any) => ({...p, contact_email: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={form.is_active} onChange={e => setForm((p: any) => ({...p, is_active: e.target.checked}))} />
        <span className="text-sm text-gray-600">Aktif</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(form)}
          disabled={!form.name}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium cursor-pointer disabled:opacity-40">
          Simpan
        </button>
        <button onClick={onCancel}
          className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm cursor-pointer">
          Batal
        </button>
      </div>
    </div>
  )
}

function OfficersTab() {
  const [officers, setOfficers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient()
      if (!supabase) return
      const [oRes, cRes] = await Promise.all([
        supabase.from("care_officers").select("*, category:care_categories(name, emoji)").order("name"),
        supabase.from("care_categories").select("*").eq("is_active", true).order("display_order"),
      ])
      setOfficers(oRes.data ?? [])
      setCategories(cRes.data ?? [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const saveOfficer = async (off: any) => {
    const supabase = (await import("@/lib/supabase/client")).createClient()
    if (!supabase) return
    if (off.id) {
      await supabase.from("care_officers").update(off).eq("id", off.id)
    } else {
      await supabase.from("care_officers").insert(off)
    }
    setEditing(null)
    setShowForm(false)
    fetchData()
  }

  const toggleOnline = async (id: string, isOnline: boolean) => {
    const supabase = (await import("@/lib/supabase/client")).createClient()
    if (!supabase) return
    await supabase.from("care_officers").update({ is_online: isOnline }).eq("id", id)
    fetchData()
  }

  const deleteOfficer = async (id: string) => {
    if (!confirm("Hapus petugas ini?")) return
    const supabase = (await import("@/lib/supabase/client")).createClient()
    if (!supabase) return
    await supabase.from("care_officers").delete().eq("id", id)
    fetchData()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Petugas Care</h1>
        <button onClick={() => { setEditing({}); setShowForm(true) }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium cursor-pointer">
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      {showForm && (
        <OfficerForm
          initial={editing}
          categories={categories}
          onSave={saveOfficer}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {officers.map(off => (
            <div key={off.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${off.is_online ? "bg-green-500" : "bg-gray-300"}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{off.name}</p>
                  <p className="text-xs text-gray-500">
                    {off.category?.emoji} {off.category?.name}
                    {off.next_available && ` · Kembali ${new Date(off.next_available).toLocaleDateString("id-ID")}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <button onClick={() => toggleOnline(off.id, !off.is_online)}
                  className={`text-xs px-2 py-1 rounded-lg cursor-pointer ${off.is_online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {off.is_online ? "Online" : "Offline"}
                </button>
                <button onClick={() => { setEditing(off); setShowForm(true) }}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function OfficerForm({ initial, categories, onSave, onCancel }: { initial: any; categories: any[]; onSave: (off: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState<any>(initial?.id ? initial : {
    name: "", category_id: "", is_online: false, next_available: null,
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500">Nama</label>
          <input value={form.name} onChange={e => setForm((p: any) => ({...p, name: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500">Kategori</label>
          <select value={form.category_id} onChange={e => setForm((p: any) => ({...p, category_id: e.target.value}))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm">
            <option value="">Pilih kategori</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-gray-500">Ketersediaan petugas dijadwalkan:</label>
        <input type="datetime-local" value={form.next_available?.slice(0, 16) || ""}
          onChange={e => setForm((p: any) => ({...p, next_available: e.target.value ? new Date(e.target.value).toISOString() : null}))}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(form)}
          disabled={!form.name}
          className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium cursor-pointer disabled:opacity-40">
          Simpan
        </button>
        <button onClick={onCancel}
          className="px-4 py-1.5 rounded-lg border border-gray-200 text-gray-600 text-sm cursor-pointer">
          Batal
        </button>
      </div>
    </div>
  )
}
