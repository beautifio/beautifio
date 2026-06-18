"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Trash2, Save, X, Star, Eye, EyeOff } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";

const CATEGORY_LABELS: Record<string, string> = {
  beasiswa: "Beasiswa", magang: "Magang", pekerjaan: "Pekerjaan",
  turnamen: "Turnamen", kompetisi: "Kompetisi", relawan: "Relawan",
  pendanaan: "Pendanaan", "program-kreator": "Program Kreator",
};

export default function OpportunitiesPage() {
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ title: "", category: "pekerjaan", organization: "", description: "", deadline: "", url: "", location: "", is_featured: false, is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchOpps = async () => {
    try {
      const res = await fetch("/api/admin/opportunities");
      if (res.ok) { const { data } = await res.json(); setOpps(data || []); }
    } catch (e) { console.error("Failed to load", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOpps(); }, []);

  function startEdit(o: any) {
    setEditId(o.id);
    setForm({ title: o.title, category: o.category, organization: o.organization, description: o.description || "", deadline: o.deadline?.slice(0, 16) || "", url: o.url || "", location: o.location || "", is_featured: o.is_featured, is_active: o.is_active });
    setShowAdd(true);
  }

  function startNew() {
    setEditId(null);
    setForm({ title: "", category: "pekerjaan", organization: "", description: "", deadline: "", url: "", location: "", is_featured: false, is_active: true });
    setShowAdd(true);
  }

  async function save() {
    if (!form.title || !form.category || !form.organization || !form.deadline) return;
    setSaving(true);
    try {
      if (editId) {
        await fetch("/api/admin/opportunities", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...form }) });
      } else {
        await fetch("/api/admin/opportunities", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      setShowAdd(false);
      setEditId(null);
      await fetchOpps();
    } catch (e) { console.error("Save failed", e); } finally { setSaving(false); }
  }

  async function toggleActive(id: string, current: boolean) {
    try { await fetch("/api/admin/opportunities", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_active: !current }) }); await fetchOpps(); } catch (e) { console.error("Toggle failed", e); }
  }

  async function remove(id: string) {
    if (!confirm("Hapus opportunity ini?")) return;
    try { await fetch("/api/admin/opportunities", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }); await fetchOpps(); } catch (e) { console.error("Delete failed", e); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Opportunities</h1>
        <Button variant="accent" size="sm" onClick={startNew} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {opps.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Belum ada data</p>}
          {opps.map((o) => (
            <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{o.title}</span>
                    {o.is_featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    {o.is_active ? <Badge variant="accent" className="text-[10px]">Active</Badge> : <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Badge variant="accent" className="text-[10px]">{CATEGORY_LABELS[o.category] || o.category}</Badge>
                    <span>{o.organization}</span>
                    {o.location && <span>📍 {o.location}</span>}
                  </div>
                  {o.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{o.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span>Deadline: {new Date(o.deadline).toLocaleDateString("id-ID")}</span>
                    {new Date(o.deadline) < new Date() && <span className="text-red-400">(Expired)</span>}
                    <span>Dibuat {new Date(o.created_at).toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(o)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer"><Briefcase className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button onClick={() => toggleActive(o.id, o.is_active)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${o.is_active ? "hover:bg-yellow-50" : "hover:bg-green-50"}`} title={o.is_active ? "Deactivate" : "Activate"}>
                    {o.is_active ? <EyeOff className="w-3.5 h-3.5 text-yellow-500" /> : <Eye className="w-3.5 h-3.5 text-green-500" />}
                  </button>
                  <button onClick={() => remove(o.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editId ? "Edit Opportunity" : "Tambah Opportunity"}</h3>
              <button onClick={() => setShowAdd(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Organization</label><input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Deadline</label><input value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} type="datetime-local" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">URL</label><input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Location</label><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
                <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setShowAdd(false)} disabled={saving}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={save} disabled={saving || !form.title || !form.organization || !form.deadline}>{saving ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
