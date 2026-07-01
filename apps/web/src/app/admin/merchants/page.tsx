"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Gift, Save, X, RefreshCw, Info, Share2 } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import { VOUCHER_TYPE_LABELS, VOUCHER_TYPE_EMOJIS, getVoucherDetailLabel } from "@beautifio/utils";
import { UploadWithPreview } from "@/features/media/UploadWithPreview";
import type { FamiliaMerchant, VoucherType } from "@beautifio/types";

function InfoTip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <span onClick={() => setShow(!show)} className="w-4 h-4 rounded-full flex items-center justify-center cursor-pointer text-[10px]" style={{ background: "#E2E8F0", color: "#647488" }}>?</span>
      {show && (
        <div className="absolute left-0 bottom-full mb-1 w-48 p-2 rounded-lg shadow-lg text-[10px] z-50" style={{ background: "#1E2938", color: "#FFFFFF" }} onClick={() => setShow(false)}>
          {text}
        </div>
      )}
    </span>
  );
}

const CATEGORIES = ["makanan", "minuman", "belanja", "Beauty", "Fashion", "Food", "Education", "Wellness"];
const CITIES = ["Semua Kota", "Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Malang", "Bali", "Medan", "Makassar"];

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
    } catch (e) { console.error("Failed to load merchants", e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMerchants(); }, []);

  function startEdit(m: FamiliaMerchant) { setEditId(m.id); setForm({ ...m }); }

  function startNew() {
    setEditId("new");
    setForm({ name: "", description: "", category: "makanan", voucher_types: [], is_active: true, merchant_code: "", daily_pin: "", monthly_quota: 50, max_per_user: 1, redeem_hours: 24, redeem_minutes: 0, code_prefix: "", city: "Semua Kota", slug: "" });
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
    } catch (e) { console.error("Save failed", e);
    } finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm("Hapus merchant ini?")) return;
    try { await fetch(`/api/familia/merchants/${id}`, { method: "DELETE" }); await fetchMerchants(); } catch (e) { console.error("Delete failed", e); }
  }

  const selectedTypes = form.voucher_types || [];

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
                    {m.city && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500">📍 {m.city}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
                  <p className="text-xs mt-1 font-medium" style={{ color: "#084463" }}>{getVoucherDetailLabel(m)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { const link = `${window.location.origin}/laporkan/${m.report_token}`; navigator.clipboard.writeText(link).then(() => alert("Link laporan disalin!\n\n" + link)); }} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center cursor-pointer" title="Share Laporan">
                  <Share2 className="w-3.5 h-3.5" style={{ color: "#6BB9D4" }} />
                </button>
                <button onClick={() => startEdit(m)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer"><Pencil className="w-4 h-4 text-gray-400" /></button>
                <button onClick={() => remove(m.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"><Trash2 className="w-4 h-4 text-red-400" /></button>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 flex-wrap">
              <span>Kode: <span className="font-mono">{m.merchant_code}</span></span>
              <span>PIN: <span className="font-mono">{m.daily_pin}</span></span>
              <span>Kuota: {m.monthly_quota}</span>
              <span>Max: {m.max_per_user ?? 1}x/user</span>
            </div>
          </div>
        ))}
      </div>

      {editId && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 px-4 pt-6 overflow-y-auto pb-24">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editId === "new" ? "Tambah Merchant" : "Edit Merchant"}</h3>
              <button onClick={() => setEditId(null)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Nama <InfoTip text="Nama merchant atau toko partner" /></label>
                <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Deskripsi</label>
                <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Kategori</label>
                <select value={form.category || "makanan"} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Logo <InfoTip text="Upload logo merchant. Rasio 1:1, min 100×100px. Kalau kosong, tampil ikon default." /></label>
                <UploadWithPreview
                  label={`Logo-${form.name || "merchant"}`}
                  currentUrl={form.logo_url || undefined}
                  aspectRatio={1}
                  hint="1:1"
                  minWidth={100}
                  minHeight={100}
                  maxSizeMb={1}
                  onUploadSuccess={(url) => setForm({ ...form, logo_url: url })}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Kota <InfoTip text="Kota lokasi merchant. Pilih 'Semua Kota' agar muncul di semua filter." /></label>
                <select value={form.city || "Semua Kota"} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
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

              {/* Voucher Types */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tipe Voucher <InfoTip text="Pilih jenis promo. Isi detail sesuai tipe yang dipilih." /></label>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    { key: "free_product", label: "🎁 Free Product" },
                    { key: "discount_pct", label: "💰 Diskon %" },
                    { key: "discount_nominal", label: "💵 Diskon Rp" },
                    { key: "bogo", label: "🛒 Beli X Gratis Y" },
                  ].map(({ key, label }) => {
                    const selected = selectedTypes.includes(key as any);
                    return (
                      <button key={key} onClick={() => {
                        let next: string[] = selected ? selectedTypes.filter(v => v !== key) : [...selectedTypes, key];
                        setForm({ ...form, voucher_types: next as any });
                      }}
                      className={`text-[10px] px-2 py-1 rounded-full border cursor-pointer ${selected ? "bg-amber-100 border-amber-300 text-amber-700" : "bg-white border-gray-200 text-gray-500"}`}>
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Dynamic voucher detail fields */}
                {selectedTypes.includes("free_product") && (
                  <div className="pl-3 border-l-2 border-amber-200 mb-2">
                    <label className="text-[10px] text-gray-500 block mb-1">Nama Produk Gratis <InfoTip text="Nama produk yang digratiskan, misal: Kopi Susu, Buku Notes" /></label>
                    <input value={form.free_product_name || ""} onChange={(e) => setForm({ ...form, free_product_name: e.target.value })} placeholder="mis. Kopi Susu" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                  </div>
                )}
                {(selectedTypes.includes("discount_pct") || selectedTypes.includes("discount_nominal")) && (
                  <div className="pl-3 border-l-2 border-amber-200 mb-2">
                    <label className="text-[10px] text-gray-500 block mb-1">Nilai Diskon <InfoTip text="Masukkan angka nilai diskon" /></label>
                    <input type="number" value={form.discount_value ?? ""} onChange={(e) => setForm({ ...form, discount_value: parseInt(e.target.value) || 0 })} placeholder={selectedTypes.includes("discount_pct") ? "mis. 20" : "mis. 5000"} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                  </div>
                )}
                {selectedTypes.includes("bogo") && (
                  <div className="pl-3 border-l-2 border-amber-200 mb-2">
                    <label className="text-[10px] text-gray-500 block mb-1">Promo Beli X Gratis Y <InfoTip text="Pola promo: Beli (X) Gratis (Y). Contoh: Beli 1 Gratis 1, atau Beli 3 Gratis 2" /></label>
                    <div className="flex items-center gap-2 text-xs">
                      <span style={{ color: "#647488" }}>Beli</span>
                      <input type="number" value={form.promo_buy ?? 1} min={1} onChange={(e) => setForm({ ...form, promo_buy: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center" />
                      <span style={{ color: "#647488" }}>Gratis</span>
                      <input type="number" value={form.promo_get ?? 1} min={1} onChange={(e) => setForm({ ...form, promo_get: parseInt(e.target.value) || 1 })} className="w-16 px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center" />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Kuota <InfoTip text="Jumlah total voucher yang tersedia" /></label>
                <input type="number" value={form.monthly_quota ?? 50} onChange={(e) => setForm({ ...form, monthly_quota: parseInt(e.target.value) || 0 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Max per User <InfoTip text="Maksimal berapa kali user yang sama bisa klaim voucher ini" /></label>
                  <input type="number" value={form.max_per_user ?? 1} min={1} onChange={(e) => setForm({ ...form, max_per_user: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Masa Pakai <InfoTip text="Setelah diklaim, user punya waktu berapa lama sebelum voucher hangus" /></label>
                  <div className="flex items-center gap-1">
                    <input type="number" value={form.redeem_hours ?? 24} min={0} onChange={(e) => setForm({ ...form, redeem_hours: parseInt(e.target.value) || 0 })} className="w-14 px-2 py-2 rounded-lg border border-gray-200 text-sm text-center" />
                    <span className="text-xs text-gray-500">jam</span>
                    <input type="number" value={form.redeem_minutes ?? 0} min={0} max={59} onChange={(e) => setForm({ ...form, redeem_minutes: parseInt(e.target.value) || 0 })} className="w-14 px-2 py-2 rounded-lg border border-gray-200 text-sm text-center" />
                    <span className="text-xs text-gray-500">mnt</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Klaim Mulai</label>
                  <input type="date" value={form.claim_start || ""} onChange={(e) => setForm({ ...form, claim_start: e.target.value || null })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Klaim Selesai</label>
                  <input type="date" value={form.claim_end || ""} onChange={(e) => setForm({ ...form, claim_end: e.target.value || null })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Prefix Kode</label>
                <input value={form.code_prefix || ""} onChange={(e) => setForm({ ...form, code_prefix: e.target.value })} placeholder="mis. WARM" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
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
