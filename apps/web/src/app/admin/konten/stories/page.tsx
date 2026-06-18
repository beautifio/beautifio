"use client";

import { useState, useEffect } from "react";
import { BookOpen, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Badge } from "@beautifio/ui";

export default function StoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/konten/stories");
      if (res.ok) { const { data } = await res.json(); setStories(data || []); }
    } catch (e) { console.error("Failed to load stories", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStories(); }, []);

  async function togglePublish(id: string, current: boolean) {
    try {
      await fetch("/api/admin/konten/stories", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, is_published: !current }) });
      await fetchStories();
    } catch (e) { console.error("Toggle failed", e); }
  }

  async function remove(id: string) {
    if (!confirm("Hapus story ini?")) return;
    try {
      await fetch("/api/admin/konten/stories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      await fetchStories();
    } catch (e) { console.error("Delete failed", e); }
  }

  const filtered = filter ? stories.filter((s) => (filter === "published" ? s.is_published : !s.is_published)) : stories;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Stories</h1>

      <div className="flex gap-2">
        <button onClick={() => setFilter("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${!filter ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200"}`}>Semua ({stories.length})</button>
        <button onClick={() => setFilter("published")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${filter === "published" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200"}`}>Terbit ({stories.filter((s) => s.is_published).length})</button>
        <button onClick={() => setFilter("draft")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${filter === "draft" ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200"}`}>Draft ({stories.filter((s) => !s.is_published).length})</button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Tidak ada story</p>}
          {filtered.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    {s.cover_image && <img src={s.cover_image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{s.title}</span>
                      {s.is_published ? <Badge variant="accent" className="text-[10px]">Published</Badge> : <Badge variant="secondary" className="text-[10px]">Draft</Badge>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                      <span>{s.story_categories?.name || s.category_id}</span>
                      <span>{s.reading_time} min</span>
                      <span>{s.like_count} ❤️</span>
                      <span>{s.slug && `/${s.slug}`}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{s.author_name || s.author?.full_name || "—"} • {new Date(s.created_at).toLocaleString("id-ID")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => togglePublish(s.id, s.is_published)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${s.is_published ? "hover:bg-yellow-50" : "hover:bg-green-50"}`} title={s.is_published ? "Unpublish" : "Publish"}>
                    {s.is_published ? <EyeOff className="w-3.5 h-3.5 text-yellow-500" /> : <Eye className="w-3.5 h-3.5 text-green-500" />}
                  </button>
                  <button onClick={() => remove(s.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer" title="Delete">
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
