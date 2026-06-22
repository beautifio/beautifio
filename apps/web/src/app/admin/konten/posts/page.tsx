"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Eye, EyeOff, FileText, Save, X, Send, Archive, Upload } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import { RichTextEditor } from "@/features/editor/RichTextEditor";

const STATUS_LABELS: Record<string, string> = { draft: "Draft", published: "Published", archived: "Archived" };
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-yellow-100 text-yellow-700",
};

const CATEGORIES = [
  "Karir", "Pendidikan", "Bisnis", "Kesehatan Mental",
  "Percintaan", "Self Reflection", "Personal Growth",
  "Public Speaking", "Personal Branding", "Finance",
  "Writing", "Teknologi", "Gaming", "Alam & Petualangan",
  "Menulis & Literasi",
];

function postStatus(p: any): string {
  if (p.status) return p.status;
  if (p.is_published === true) return "published";
  return "draft";
}

export default function InspirasiPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ title: "", content: "", excerpt: "", category: "Karir", cover_image: "", author_name: "", read_time_minutes: 5, slug: "", meta_title: "", meta_description: "", og_image: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/konten/posts");
      if (res.ok) { const { data } = await res.json(); setPosts(data || []); }
    } catch (e) { console.error("Failed to load posts", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  function startEdit(p: any) {
    setEditId(p.id);
    setForm({
      title: p.title,
      content: p.content,
      excerpt: p.excerpt || "",
      category: CATEGORIES.includes(p.category) ? p.category : "Karir",
      cover_image: p.cover_image || "",
      author_name: p.author || p.author_name || "",
      read_time_minutes: p.read_time_minutes || 5,
      slug: p.slug || "",
      meta_title: p.meta_title || "",
      meta_description: p.meta_description || "",
      og_image: p.og_image || "",
    });
    setShowAdd(true);
  }

  function startNew() {
    setEditId(null);
    setForm({ title: "", content: "", excerpt: "", category: "Karir", cover_image: "", author_name: "", read_time_minutes: 5, slug: "", meta_title: "", meta_description: "", og_image: "" });
    setShowAdd(true);
  }

  async function save() {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const body = { ...form, status: editId ? undefined : "draft" };
      let res;
      if (editId) {
        res = await fetch(`/api/admin/konten/posts/${editId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      } else {
        res = await fetch("/api/admin/konten/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      setShowAdd(false);
      setEditId(null);
      await fetchPosts();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/konten/posts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      await fetchPosts();
    } catch (e: any) { alert(e.message); }
  }

  async function remove(id: string) {
    if (!confirm("Hapus post ini?")) return;
    try { await fetch(`/api/admin/konten/posts/${id}`, { method: "DELETE" }); await fetchPosts(); } catch (e) { console.error("Delete failed", e); }
  }

  async function handleCoverUpload(file: File) {
    setUploadingCover(true);
    try {
      const { supabase } = await import("@/lib/supabase/client");
      if (!supabase) throw new Error("No client");
      const ext = file.name.split(".").pop();
      const filename = `cover-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("landing-assets").upload(`artikel/${filename}`, file, { upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("landing-assets").getPublicUrl(`artikel/${filename}`);
      setForm((prev: any) => ({ ...prev, cover_image: urlData.publicUrl }));
    } catch (err: any) {
      alert(`Upload cover gagal: ${err.message || ""}`);
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Inspirasi Posts</h1>
        <Button variant="accent" size="sm" onClick={startNew} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah Post</Button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {posts.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Belum ada post</p>}
          {posts.map((p) => {
            const st = postStatus(p);
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[st] || "bg-gray-100 text-gray-700"}`}>{STATUS_LABELS[st] || st}</span>
                      <Badge variant="accent" className="text-[10px]">{p.category}</Badge>
                      {p.source === "redaksi" && <span className="text-[10px] text-blue-500 font-medium">Redaksi</span>}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.excerpt || p.content?.slice(0, 100)}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                      <span>{p.author || p.author_name || "—"}</span>
                      <span>{new Date(p.created_at).toLocaleString("id-ID")}</span>
                      {p.published_at && <span>Terbit {new Date(p.published_at).toLocaleString("id-ID")}</span>}
                      {p.read_time_minutes && <span>{p.read_time_minutes} menit</span>}
                      {p.slug && <span className="font-mono">/{p.slug}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(p)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer" title="Edit"><FileText className="w-3.5 h-3.5 text-gray-400" /></button>
                    {st === "draft" && <button onClick={() => updateStatus(p.id, "published")} className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center cursor-pointer" title="Publish"><Send className="w-3.5 h-3.5 text-green-500" /></button>}
                    {st === "published" && <button onClick={() => updateStatus(p.id, "archived")} className="w-7 h-7 rounded-lg hover:bg-yellow-50 flex items-center justify-center cursor-pointer" title="Archive"><Archive className="w-3.5 h-3.5 text-yellow-500" /></button>}
                    {st === "archived" && <button onClick={() => updateStatus(p.id, "draft")} className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center cursor-pointer" title="Unarchive"><EyeOff className="w-3.5 h-3.5 text-gray-500" /></button>}
                    <button onClick={() => remove(p.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editId ? "Edit Post" : "Tambah Post"}</h3>
              <button onClick={() => setShowAdd(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Auto-generated" /></div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Content</label>
                <RichTextEditor
                  content={form.content}
                  onChange={(html) => setForm((prev: any) => ({ ...prev, content: html }))}
                  placeholder="Tulis konten artikel di sini..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Excerpt</label><input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Author Name</label>
                  <input value={form.author_name} onChange={(e) => setForm((prev: any) => ({ ...prev, author_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Read Time (menit)</label>
                  <input type="number" min={1} max={60} value={form.read_time_minutes} onChange={(e) => setForm((prev: any) => ({ ...prev, read_time_minutes: parseInt(e.target.value) || 5 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Cover Image</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">{uploadingCover ? "Uploading..." : form.cover_image ? "Ganti" : "Upload"}</span>
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ""; }} />
                  </label>
                  {form.cover_image && (
                    <button onClick={() => setForm((prev: any) => ({ ...prev, cover_image: "" }))}
                      className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Hapus</button>
                  )}
                </div>
                {form.cover_image && (
                  <div className="mt-2 aspect-[16/9] rounded-lg overflow-hidden bg-gray-100">
                    <img src={form.cover_image} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <details className="group">
                <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700">SEO Settings</summary>
                <div className="space-y-3 mt-3">
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Meta Title</label><input value={form.meta_title || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, meta_title: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">Meta Description</label><textarea value={form.meta_description || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, meta_description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm resize-none" /></div>
                  <div><label className="text-xs font-medium text-gray-600 block mb-1">OG Image URL</label><input value={form.og_image || ""} onChange={(e) => setForm((prev: any) => ({ ...prev, og_image: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                </div>
              </details>
            </div>
            <div className="flex gap-2 mt-5">
              <Button variant="ghost" size="sm" className="flex-1 cursor-pointer" onClick={() => setShowAdd(false)} disabled={saving}>Batal</Button>
              <Button variant="accent" size="sm" className="flex-1 cursor-pointer" onClick={save} disabled={saving || !form.title || !form.content}><Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
