"use client";

import { useState, useEffect } from "react";
import { Pencil, Plus, Save, Trash2, X, MapPin, Calendar, Users, Eye, Download } from "lucide-react";
import { Button } from "@beautifio/ui";
import { UploadWithPreview } from "@/features/media/UploadWithPreview";

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  // Convert to WIB (UTC+7)
  const wib = new Date(d.getTime() + 7 * 60 * 60 * 1000);
  return wib.toISOString().slice(0, 16);
}

interface EventForm {
  title: string; description: string; event_date: string; location: string;
  registration_url: string; category: string; partner_name: string;
  is_active: boolean; image_url: string;
  price: string; quota: string; registration_deadline: string;
  discount_type: string; discount_value: string; code: string;
  event_mode: "free" | "paid" | "discount";
}

const emptyForm: EventForm = { title: "", description: "", event_date: "", location: "", registration_url: "", category: "workshop", partner_name: "", is_active: true, image_url: "", price: "", quota: "", registration_deadline: "", discount_type: "percentage", discount_value: "", code: "", event_mode: "free" };
const CATS = ["workshop", "seminar", "career-expo", "networking", "komunitas", "lainnya"];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);
  const [showRegs, setShowRegs] = useState<string | null>(null);
  const [regs, setRegs] = useState<any[]>([]);
  const [regLoading, setRegLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/events");
    if (res.ok) {
      const { data } = await res.json();
      // Load reg counts for each event
        const withCounts = await Promise.all((data || []).map(async (e: any) => {
          try {
            const regRes = await fetch(`/api/events/${e.id}/registrations`);
            if (regRes.ok) {
              const { data: regs } = await regRes.json();
              e._reg_count = regs?.length || 0;
              e._pending_count = (regs || []).filter((r: any) => r.status === "pending").length;
            }
          } catch {}
          return e;
        }));
      setEvents(withCounts);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  function openNew() { setEditId(null); setForm({ ...emptyForm }); setUploadKey(k => k + 1); setShowForm(true); }

  function openEdit(e: any) {
    setEditId(e.id);
    const mode = e.discount_type && e.discount_value ? "discount" : e.is_free === false ? "paid" : "free";
    setForm({
      title: e.title, description: e.description || "",
      event_date: toDatetimeLocal(e.event_date),
      location: e.location || "", registration_url: e.registration_url || "",
      category: e.category || "workshop", partner_name: e.partner_name || "",
      is_active: e.is_active, image_url: e.image_url || "",
      price: e.price ? String(e.price) : "",
      quota: e.quota ? String(e.quota) : "",
      registration_deadline: toDatetimeLocal(e.registration_deadline),
      discount_type: e.discount_type || "percentage",
      discount_value: e.discount_value ? String(e.discount_value) : "",
      code: e.code || "",
      event_mode: mode,
    });
    setUploadKey(k => k + 1);
    setShowForm(true);
  }

  async function save() {
    if (!form.title || !form.event_date) return;
    setSaving(true);
    const body: any = {
      ...form, slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      price: form.price ? parseFloat(form.price) : null,
      quota: form.quota ? parseInt(form.quota) : null,
      is_free: form.event_mode === "free",
      discount_type: form.event_mode === "discount" ? form.discount_type : null,
      discount_value: form.event_mode === "discount" ? (parseFloat(form.discount_value) || null) : null,
      code: form.event_mode === "discount" ? (form.code || null) : null,
      // Convert WIB local datetime to UTC ISO for API
      event_date: new Date(form.event_date + ":00+07:00").toISOString(),
      registration_deadline: form.registration_deadline ? new Date(form.registration_deadline + ":00+07:00").toISOString() : null,
    };
    delete body.event_mode;
    delete body._reg_count;
    delete body._pending_count;
    const url = editId ? `/api/admin/events/${editId}` : "/api/admin/events";
    try {
      const res = await fetch(url, { method: editId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const json = await res.json();
      if (!res.ok) { alert(json.error || "Gagal"); setSaving(false); return; }
      setShowForm(false); load();
    } catch (e: any) { alert(e.message); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("Hapus event?")) return;
    const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    if (!res.ok) { const json = await res.json().catch(() => ({})); alert(json.error || "Gagal menghapus"); return; }
    load();
  }

  async function loadRegs(eventId: string) {
    setShowRegs(eventId);
    setRegLoading(true);
    const res = await fetch(`/api/events/${eventId}/registrations`);
    if (res.ok) { const { data } = await res.json(); setRegs(data || []); }
    setRegLoading(false);
  }

  async function updateRegStatus(regId: string, status: string) {
    await fetch(`/api/events/registrations/${regId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (showRegs) { loadRegs(showRegs); load(); }
  }

  if (loading) return <div className="p-6 text-sm" style={{ color: "#647488" }}>Memuat...</div>;

  return (
    <div className="space-y-4 max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold" style={{ color: "#1E2938" }}>Events</h1>
        <Button variant="accent" size="sm" onClick={openNew} className="cursor-pointer"><Plus size={14} /> Tambah Event</Button>
      </div>

      <div className="space-y-2">
        {events.map(e => {
          const isUpcoming = new Date(e.event_date) > new Date();
          const remainingQuota = e.quota ? (e.quota - (e.total_registrations || 0)) : null;
          return (
            <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4" style={{ opacity: e.is_active ? 1 : 0.6 }}>
              <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                {e.image_url ? <img src={e.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300">📅</div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">{e.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{e.category}</span>
                  {isUpcoming && <span className="text-[10px] text-green-600">Active</span>}
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ 
                    background: e.discount_type ? "rgba(255,198,79,0.12)" : e.is_free === false ? "rgba(8,68,99,0.08)" : "rgba(34,197,94,0.08)", 
                    color: e.discount_type ? "#1E2938" : e.is_free === false ? "#084463" : "#22C55E" 
                  }}>
                    {e.discount_type ? `🏷 ${e.discount_value}${e.discount_type === 'percentage' ? '%' : ''}` : e.is_free === false ? `💰 Rp ${(e.price || 0).toLocaleString()}` : "🆓 Gratis"}
                  </span>
                  {e._pending_count > 0 && (
                    <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "#EF4444" }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#EF4444" }} />{e._pending_count} Menunggu
                    </span>
                  )}

                </div>
                <div className="flex items-center gap-3 text-[10px] mt-1" style={{ color: "#647488" }}>
                  <span><Calendar size={10} className="inline mr-0.5" />{new Date(e.event_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {e.location && <span><MapPin size={10} className="inline mr-0.5" />{e.location}</span>}
                  {remainingQuota !== null && <span><Users size={10} className="inline mr-0.5" />{remainingQuota}/{e.quota}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => loadRegs(e.id)} className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 cursor-pointer text-xs"
                  style={{ color: "#6BB9D4" }} title="Lihat Peserta">
                  <Users size={12} />
                  {e._reg_count > 0 && <span className="text-[10px] font-bold">{e._reg_count}</span>}
                </button>
                <button onClick={() => openEdit(e)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer"><Pencil size={14} className="text-gray-400" /></button>
                <button onClick={() => remove(e.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 px-4 pt-6 overflow-y-auto pb-24">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-sm font-bold text-gray-900 mb-3">{editId ? "Edit Event" : "Tambah Event"}</h3>
            <div className="space-y-3">

              <UploadWithPreview key={`evt-${uploadKey}`} label="Cover Image" currentUrl={form.image_url || undefined} aspectRatio={16 / 9} hint="16:9" maxSizeMb={3}
                onUploadSuccess={(url) => setForm(f => ({ ...f, image_url: url }))} />

              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Judul event *" className="w-full px-3 py-2 text-xs border border-gray-200 rounded" />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Deskripsi" rows={3} className="w-full px-3 py-2 text-xs border border-gray-200 rounded resize-none" />
              <input value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} type="datetime-local" className="w-full px-3 py-2 text-xs border border-gray-200 rounded" />
              <input value={form.registration_deadline} onChange={e => setForm(f => ({ ...f, registration_deadline: e.target.value }))} type="datetime-local" placeholder="Batas pendaftaran" className="w-full px-3 py-2 text-xs border border-gray-200 rounded" />
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Lokasi" className="w-full px-3 py-2 text-xs border border-gray-200 rounded" />
              <input value={form.registration_url} onChange={e => setForm(f => ({ ...f, registration_url: e.target.value }))} placeholder="URL Pendaftaran" className="w-full px-3 py-2 text-xs border border-gray-200 rounded" />

              <div className="grid grid-cols-2 gap-2">
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="px-3 py-2 text-xs border border-gray-200 rounded">
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={form.partner_name} onChange={e => setForm(f => ({ ...f, partner_name: e.target.value }))} placeholder="Partner" className="px-3 py-2 text-xs border border-gray-200 rounded" />
              </div>

              {/* Tipe Event */}
              <div className="p-3 rounded-lg" style={{ background: "#F8FAFC" }}>
                <label className="text-xs font-semibold block mb-2">💰 Tipe Event</label>
                <div className="flex gap-3 mb-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name="type" checked={form.event_mode === "free"} onChange={() => setForm(f => ({ ...f, event_mode: "free" }))} /> 🆓 Gratis
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name="type" checked={form.event_mode === "paid"} onChange={() => setForm(f => ({ ...f, event_mode: "paid" }))} /> 💰 Berbayar
                  </label>
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input type="radio" name="type" checked={form.event_mode === "discount"} onChange={() => setForm(f => ({ ...f, event_mode: "discount" }))} /> 🏷 Diskon
                  </label>
                </div>

                {(form.event_mode === "paid" || form.event_mode === "discount") && (
                  <div className="space-y-2 pl-2 border-l-2" style={{ borderColor: form.event_mode === "paid" ? "#084463" : "#FFC64F" }}>
                    <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} type="number" placeholder="Harga (Rp)" className="w-full px-3 py-2 text-xs border border-gray-200 rounded" />
                  </div>
                )}

                {form.event_mode === "discount" && (
                  <div className="space-y-2 pl-2 border-l-2 mt-2" style={{ borderColor: "#FFC64F" }}>
                    <select value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))} className="w-full px-3 py-2 text-xs border border-gray-200 rounded">
                      <option value="percentage">Persentase (%)</option>
                      <option value="nominal">Nominal (Rp)</option>
                      <option value="free">Gratis</option>
                    </select>
                    <input value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} placeholder="Nilai diskon (20 atau 50000)" className="w-full px-3 py-2 text-xs border border-gray-200 rounded" />
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Kode promo (opsional)" className="w-full px-3 py-2 text-xs border border-gray-200 rounded" />
                  </div>
                )}

                <input value={form.quota} onChange={e => setForm(f => ({ ...f, quota: e.target.value }))} type="number" placeholder="Kuota peserta (opsional)" className="w-full mt-2 px-3 py-2 text-xs border border-gray-200 rounded" />
              </div>

              <div className="flex gap-3">
                <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Aktif</label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 text-xs border border-gray-200 rounded-lg cursor-pointer" style={{ color: "#647488" }}>Batal</button>
              <button onClick={save} disabled={saving || !form.title || !form.event_date} className="flex-1 py-2 text-xs rounded-lg text-white cursor-pointer disabled:opacity-50" style={{ background: "#084463" }}><Save size={14} className="inline mr-1" />{saving ? "..." : "Simpan"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Registrations Modal */}
      {showRegs && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 px-4 pt-6 overflow-y-auto pb-24">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">👥 Peserta — {events.find(e => e.id === showRegs)?.title}</h3>
              <button onClick={() => setShowRegs(null)} className="cursor-pointer"><X size={18} className="text-gray-400" /></button>
            </div>

            {regLoading ? (
              <p className="text-xs text-gray-400">Memuat...</p>
            ) : regs.length === 0 ? (
              <p className="text-xs text-gray-400">Belum ada pendaftar</p>
            ) : (
              <>
                <button onClick={() => {
                  const csv = ["Nama,Email/WA,Bukti Bayar,Status"].concat(
                    regs.map((r: any) => `"${r.name || r.user?.full_name || ""}","${r.email || r.whatsapp || ""}","${r.payment_proof_url || ""}",${r.status}`)
                  ).join("\n");
                  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                  a.download = `peserta-${showRegs}.csv`; a.click();
                }} className="mb-3 flex items-center gap-1 text-[10px] px-2 py-1 rounded cursor-pointer"
                  style={{ background: "#084463", color: "#FFFFFF" }}>
                <Download size={10} /> Export CSV
                </button>
                <div className="overflow-x-auto">
                <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", color: "#647488" }}>
                      <th className="text-left p-2">Nama</th>
                      <th className="text-left p-2">Email/WA</th>
                      <th className="text-left p-2">Bukti</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regs.map((r: any) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #E2E8F0", background: r.status === "pending" ? "rgba(255,198,79,0.06)" : "transparent" }}>
                        <td className="p-2" style={{ color: "#1E2938" }}>{r.name || r.user?.full_name || r.user?.email || r.user_id?.slice(0, 8)}</td>
                        <td className="p-2" style={{ color: "#647488" }}>{r.email || r.whatsapp || "-"}</td>
                        <td className="p-2">
                          {r.payment_proof_url ? <a href={r.payment_proof_url} target="_blank" className="text-blue-400"><Eye size={14} /></a> : "-"}
                        </td>
                        <td className="p-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{
                            background: r.status === "confirmed" ? "rgba(34,197,94,0.1)" : r.status === "rejected" ? "rgba(239,68,68,0.1)" : "rgba(255,198,79,0.1)",
                            color: r.status === "confirmed" ? "#22C55E" : r.status === "rejected" ? "#EF4444" : "#1E2938"
                          }}>{r.status}</span>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            {r.status !== "confirmed" && (
                              <button onClick={() => updateRegStatus(r.id, "confirmed")} className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer" style={{ background: "rgba(34,197,94,0.1)", color: "#22C55E" }}>Konfirmasi</button>
                            )}
                            {r.status !== "rejected" && (
                              <button onClick={() => updateRegStatus(r.id, "rejected")} className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>Tolak</button>
                            )}
                            {r.status !== "pending" && (
                              <button onClick={() => updateRegStatus(r.id, "pending")} className="text-[9px] px-1.5 py-0.5 rounded cursor-pointer" style={{ background: "rgba(255,198,79,0.1)", color: "#1E2938" }}>Pending</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </>)}
          </div>
        </div>
      )}
    </div>
  );
}
