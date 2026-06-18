"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, EyeOff, X } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ content: "", author: "", category: "umum" });
  const [saving, setSaving] = useState(false);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/quotes?all=true");
      if (res.ok) { const { data } = await res.json(); setQuotes(data || []); }
    } catch (e) { console.error("Failed to load quotes", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuotes(); }, []);

  async function createQuote() {
    if (!form.content) return;
    setSaving(true);
    try {
      await fetch("/api/admin/quotes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setShowAdd(false);
      setForm({ content: "", author: "", category: "umum" });
      await fetchQuotes();
    } catch (e) { console.error("Create quote failed", e); } finally { setSaving(false); }
  }

  async function toggleActive(id: string, current: boolean) {
    try { await fetch("/api/admin/quotes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_active: !current }) }); await fetchQuotes(); } catch (e) { console.error("Toggle failed", e); }
  }

  async function deleteQuote(id: string) {
    if (!confirm("Hapus quote ini?")) return;
    try { await fetch(`/api/admin/quotes?id=${id}`, { method: "DELETE" }); await fetchQuotes(); } catch (e) { console.error("Delete failed", e); }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Quotes</h1>
        <Button variant="accent" size="sm" onClick={() => setShowAdd(true)} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah Quote</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {quotes.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Belum ada quotes</p>}
          {quotes.map((q) => (
            <div key={q.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 italic">"{q.content}"</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span className="font-medium">{q.author || "Anonim"}</span>
                  <span className="text-gray-300">•</span>
                  <Badge variant="accent" className="text-[10px]">{q.category}</Badge>
                  {!q.is_active && <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(q.id, q.is_active)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${q.is_active ? "hover:bg-yellow-50 text-yellow-500" : "hover:bg-green-50 text-green-500"}`}>
                  {q.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => deleteQuote(q.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Tambah Quote</h3>
              <button onClick={() => setShowAdd(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Konten</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-400 resize-none" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Penulis</label><input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              <div><label className="text-xs font-medium text-gray-600 block mb-1">Kategori</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  {["umum", "motivasi", "cinta", "kehidupan", "karir", "persahabatan", "spiritual"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setShowAdd(false)} disabled={saving}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={createQuote} disabled={saving || !form.content}>{saving ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
