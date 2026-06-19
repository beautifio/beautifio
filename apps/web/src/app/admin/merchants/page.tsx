"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Gift, Save, X, RefreshCw } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import { VOUCHER_TYPE_LABELS, VOUCHER_TYPE_EMOJIS } from "@beautifio/utils";
import type { FamiliaMerchant, VoucherType } from "@beautifio/types";

const VT_ENTRIES = Object.entries(VOUCHER_TYPE_LABELS) as [VoucherType, string][];

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<FamiliaMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<FamiliaMerchant>>({});
  const [saving, setSaving] = useState(false);

  const fetchMerchants = async () => {
    try {
      const res = await fetch("/api/familia/merchants");
      if (res.ok) {
        const { data } = await res.json();
        setMerchants(data || []);
      }
    } catch (e) {
      console.error("Failed to load merchants", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMerchants(); }, []);

  function startEdit(m: FamiliaMerchant) {
    setEditId(m.id);
    setForm({ ...m });
  }

  function startNew() {
    setEditId("new");
    setForm({ name: "", description: "", category: "makanan", voucher_types: [], is_active: true, merchant_code: "", daily_pin: "", monthly_quota: 50, slug: "" });
  }

  async function save() {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editId === "new") {
        await fetch("/api/familia/merchants", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      } else if (editId) {
        await fetch(`/api/familia/merchants/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      }
      await fetchMerchants();
      setEditId(null);
      setForm({});
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Hapus merchant ini?")) return;
    try {
      await fetch(`/api/familia/merchants/${id}`, { method: "DELETE" });
      await fetchMerchants();
    } catch (e) {
      console.error("Delete failed", e);
    }
  }

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Merchants</h1>
        <Button variant="accent" size="sm" onClick={startNew} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah Merchant</Button>
      </div>

      <div className="space-y-3">
        {merchants.map((m) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center"><Gift className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{m.name}</span>
                    <Badge variant="accent" className="text-[10px]">{m.category}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {(m.voucher_types || []).map((vt) => (
                      <span key={vt} className="text-[10px] text-gray-400">{VOUCHER_TYPE_EMOJIS[vt]} {VOUCHER_TYPE_LABELS[vt]}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(m)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer"><Pencil className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => remove(m.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
              <span>Kode: <span className="font-mono">{m.merchant_code}</span></span>
              <span>PIN: <span className="font-mono">{m.daily_pin}</span></span>
              <span>Kuota: {m.monthly_quota}/bln</span>
            </div>
          </div>
        ))}
      </div>

      {editId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setEditId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editId === "new" ? "Tambah Merchant" : "Edit Merchant"}</h3>
              <button onClick={() => setEditId(null)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Nama</label>
                <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Deskripsi</label>
                <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Kategori</label>
                <select value={form.category || "makanan"} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  {["makanan", "minuman", "belanja", "Beauty", "Fashion", "Food", "Education", "Wellness"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Merchant Code</label>
                <input value={form.merchant_code || ""} onChange={(e) => setForm({ ...form, merchant_code: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Daily PIN</label>
                <input value={form.daily_pin || ""} onChange={(e) => setForm({ ...form, daily_pin: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tipe Voucher</label>
                <div className="flex flex-wrap gap-1.5">
                  {VT_ENTRIES.map(([key, label]) => {
                    const selected = (form.voucher_types || []).includes(key);
                    return (
                      <button key={key} onClick={() => { const cur = form.voucher_types || []; const next = selected ? cur.filter((v) => v !== key) : [...cur, key]; setForm({ ...form, voucher_types: next }); }}
                        className={`text-[10px] px-2 py-1 rounded-full border cursor-pointer ${selected ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-white border-gray-200 text-gray-500"}`}>
                        {VOUCHER_TYPE_EMOJIS[key]} {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Monthly Quota</label>
                <input type="number" value={form.monthly_quota ?? 50} onChange={(e) => setForm({ ...form, monthly_quota: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setEditId(null)} disabled={saving}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={save} disabled={saving || !form.name}><Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
