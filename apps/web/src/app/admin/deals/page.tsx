"use client";

import { useState, useEffect } from "react";
import { Trash2, Star, Plus, Save, X, Pencil, Info, ImageIcon } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import { UploadWithPreview } from "@/features/media/UploadWithPreview";
import type { FamiliaAffiliateDeal, PartnerInfo } from "@beautifio/types";

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

const emptyPartner = (): PartnerInfo => ({ name: "", url: "", description: "", image_url: "" });
const emptyForm = () => ({ title: "", description: "", category: "", is_featured: false, hot_deal_order: "", hot_deal_expires: "", partners: [emptyPartner()] });

export default function DealsPage() {
  const [deals, setDeals] = useState<FamiliaAffiliateDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploadKeys, setUploadKeys] = useState<Record<number, number>>({});

  const fetchDeals = async () => {
    try {
      const res = await fetch("/api/familia/deals");
      if (res.ok) { const { data } = await res.json(); setDeals(data || []); }
    } catch (e) { console.error("Failed to load deals", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDeals(); }, []);

  async function remove(id: string) {
    if (!confirm("Hapus deal ini?")) return;
    await fetch(`/api/familia/deals/${id}`, { method: "DELETE" });
    fetchDeals();
  }

  function openNew() { setEditId(null); setForm(emptyForm()); setUploadKeys({}); setShowForm(true); }

  function openEdit(deal: FamiliaAffiliateDeal) {
    setEditId(deal.id);
    const existingPartners = deal.partners?.length ? deal.partners : [{ name: deal.partner_name, url: deal.partner_url, description: deal.description, image_url: deal.image_url }];
    setForm({
      title: deal.title,
      description: deal.description || "",
      category: deal.category,
      is_featured: deal.is_featured,
      hot_deal_order: deal.hot_deal_order != null ? String(deal.hot_deal_order) : "",
      hot_deal_expires: deal.hot_deal_expires || "",
      partners: existingPartners,
    });
    setUploadKeys({});
    setShowForm(true);
  }

  function addPartner() { setForm(f => ({ ...f, partners: [...f.partners, emptyPartner()] })); }
  function removePartner(idx: number) { setForm(f => ({ ...f, partners: f.partners.filter((_, i) => i !== idx) })); }
  function updatePartner(idx: number, field: string, value: string) {
    setForm(f => ({ ...f, partners: f.partners.map((p, i) => i === idx ? { ...p, [field]: value } : p) }));
  }

  async function saveDeal() {
    if (!form.title || !form.partners?.[0]?.url) return;
    setSaving(true);
    try {
      const body: any = {
        title: form.title,
        description: form.description,
        category: form.category,
        is_featured: form.is_featured,
        hot_deal_order: form.hot_deal_order ? parseInt(form.hot_deal_order) : null,
        hot_deal_expires: form.hot_deal_expires || null,
        partners: form.partners.filter(p => p.url),
      };
      // Backward compat: set partner_name/partner_url/image_url from first partner
      if (body.partners.length > 0) {
        body.partner_name = body.partners[0].name;
        body.partner_url = body.partners[0].url;
        body.image_url = body.partners[0].image_url;
      }
      if (!editId) {
        body.slug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        body.platform = "website";
      }
      const res = await fetch(editId ? `/api/familia/deals/${editId}` : "/api/familia/deals", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) { const json = await res.json(); alert(json.error || "Gagal menyimpan"); setSaving(false); return; }
      setShowForm(false);
      fetchDeals();
    } catch (e) { alert("Gagal menyimpan"); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Deals</h1>
        <Button variant="accent" size="sm" onClick={openNew} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah Deal</Button>
      </div>

      <div className="space-y-2">
        {deals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {(deal.partners?.[0]?.image_url || deal.image_url) ? (
                <img src={deal.partners?.[0]?.image_url || deal.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={20} /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{deal.title}</span>
                {deal.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                {deal.hot_deal_order != null && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600">🔥 #{deal.hot_deal_order}</span>}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="accent" className="text-[10px]">{deal.category}</Badge>
                <span className="text-xs text-gray-500">{(deal.partners || []).length} partner</span>
              </div>
              <p className="text-xs text-gray-400 mt-1 truncate">{deal.description}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => openEdit(deal)} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer"><Pencil className="w-4 h-4 text-gray-400" /></button>
              <button onClick={() => remove(deal.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"><Trash2 className="w-4 h-4 text-red-400" /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-start justify-center z-50 px-4 pt-6 overflow-y-auto pb-24">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editId ? "Edit Deal" : "Tambah Deal"}</h3>
              <button onClick={() => setShowForm(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <div className="space-y-4">
              {/* Article fields */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Title <InfoTip text="Judul artikel/deal yang tampil di halaman Belanja" /></label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Deskripsi Artikel</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Kategori</label>
                <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Olahraga, Fashion, dll" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>

              {/* Partners */}
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Partner Marketplace <InfoTip text="Minimal 1 partner. Gambar partner pertama akan tampil di card Belanja." /></label>

                {form.partners.map((p, i) => (
                  <div key={i} className="p-3 mb-3 rounded-lg border" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold" style={{ color: "#084463" }}>Partner {i + 1}</span>
                      {form.partners.length > 1 && (
                        <button onClick={() => removePartner(i)} className="text-[10px] text-red-400 cursor-pointer">Hapus</button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <UploadWithPreview
                        key={`pimg-${i}-${uploadKeys[i] || 0}`}
                        label={`Partner-${i}`}
                        currentUrl={p.image_url || undefined}
                        aspectRatio={4 / 3}
                        hint="4:3"
                        maxSizeMb={3}
                        onUploadSuccess={(url) => updatePartner(i, "image_url", url)}
                      />
                      <div className="text-[10px] text-center" style={{ color: "#647488" }}>atau</div>
                      <input value={p.image_url || ""} onChange={e => updatePartner(i, "image_url", e.target.value)} placeholder="URL gambar (kalau tidak upload)"
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded" />
                    </div>

                    <div className="space-y-2 mt-2">
                      <input value={p.name} onChange={e => updatePartner(i, "name", e.target.value)} placeholder="Nama Partner (Tokopedia, Shopee...)"
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded" />
                      <input value={p.url} onChange={e => updatePartner(i, "url", e.target.value)} placeholder="URL Link marketplace"
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded" />
                      <input value={p.description || ""} onChange={e => updatePartner(i, "description", e.target.value)} placeholder="Deskripsi produk / penawaran khusus"
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded" />
                    </div>
                  </div>
                ))}

                <button onClick={addPartner} className="w-full py-2 text-xs border border-dashed rounded-lg cursor-pointer"
                  style={{ borderColor: "#6BB9D4", color: "#6BB9D4" }}>
                  + Tambah Partner
                </button>
              </div>

              <label className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} /> Featured</label>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Hot Deal Order <InfoTip text="Urutan tampil di carousel. Kosongkan = tidak tampil." /></label>
                <input type="number" value={form.hot_deal_order} onChange={e => setForm(f => ({ ...f, hot_deal_order: e.target.value }))} placeholder="1, 2, 3..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Hot Deal Expires <InfoTip text="Tanggal berakhir countdown. Kosongkan = tampil selamanya." /></label>
                <input type="datetime-local" value={form.hot_deal_expires} onChange={e => setForm(f => ({ ...f, hot_deal_expires: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setShowForm(false)} disabled={saving}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={saveDeal} disabled={saving || !form.title || !form.partners?.[0]?.url}>
                <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
