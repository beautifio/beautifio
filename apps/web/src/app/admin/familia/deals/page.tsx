"use client";

import { useState, useEffect } from "react";
import { Trash2, ShoppingBag, Star, RefreshCw, Plus, Save, X } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import type { FamiliaAffiliateDeal } from "@beautifio/types";

export default function DealsPage() {
  const [deals, setDeals] = useState<FamiliaAffiliateDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", partner_name: "", partner_url: "", platform: "website", category: "", image_url: "", is_featured: false });
  const [saving, setSaving] = useState(false);

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/familia/deals");
      if (res.ok) {
        const { data } = await res.json();
        setDeals(data || []);
      }
    } catch (e) {
      console.error("Failed to load deals", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeals(); }, []);

  async function remove(id: string) {
    if (!confirm("Hapus deal ini?")) return;
    try {
      await fetch(`/api/familia/deals/${id}`, { method: "DELETE" });
      await fetchDeals();
    } catch (e) {
      console.error("Delete failed", e);
    }
  }

  async function createDeal() {
    if (!form.title || !form.partner_url) return;
    setSaving(true);
    try {
      await fetch("/api/familia/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") }) });
      setShowAdd(false);
      setForm({ title: "", description: "", partner_name: "", partner_url: "", platform: "website", category: "", image_url: "", is_featured: false });
      await fetchDeals();
    } catch (e) {
      console.error("Create failed", e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Deals</h1>
        <Button variant="accent" size="sm" onClick={() => setShowAdd(true)} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah Deal</Button>
      </div>

      <div className="space-y-2">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {deal.image_url && <img src={deal.image_url} alt="" className="w-full h-full object-cover" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{deal.title}</span>
                {deal.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="accent" className="text-[10px]">{deal.platform}</Badge>
                <span className="text-xs text-gray-500">{deal.partner_name}</span>
                <span className="text-xs text-gray-400">{deal.category}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">{deal.description}</p>
            </div>
            <button onClick={() => remove(deal.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center flex-shrink-0 cursor-pointer"><Trash2 className="w-4 h-4 text-red-400" /></button>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Tambah Deal</h3>
              <button onClick={() => setShowAdd(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Partner Name</label><input value={form.partner_name} onChange={(e) => setForm({ ...form, partner_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Partner URL</label><input value={form.partner_url} onChange={(e) => setForm({ ...form, partner_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Platform</label>
                <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  <option value="tokopedia">Tokopedia</option><option value="shopee">Shopee</option><option value="tiktok">TikTok</option><option value="website">Website</option>
                </select>
              </div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Category</label><input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Image URL</label><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured</label>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setShowAdd(false)} disabled={saving}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={createDeal} disabled={saving || !form.title || !form.partner_url}><Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
