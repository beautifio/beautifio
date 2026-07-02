"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Eye, EyeOff, FileText, Save, X, Send, Archive, Upload, CalendarClock, Clock, RotateCcw, Trash, User, GraduationCap, MessageSquare, Layers, AlertTriangle, Search, Sparkles, TrendingUp, Target, Users as UsersIcon, Lightbulb, Loader2 } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import { RichTextEditor } from "@/features/editor/RichTextEditor";

const CATEGORIES = [
  { id: "mind-body", label: "Mind & Body", icon: "heart" },
  { id: "glow-glowup", label: "Glow & Glow Up", icon: "sparkles" },
  { id: "levelup-career", label: "Level Up & Career", icon: "trending-up" },
  { id: "relationship", label: "Relationship", icon: "users" },
  { id: "creative-space", label: "Creative Space", icon: "feather" },
  { id: "tech-gaming", label: "Tech & Gaming", icon: "monitor" },
  { id: "lifetaintment", label: "Lifetaintment", icon: "clapperboard" },
];

const AUTHOR_TYPES = [
  { id: "redaksi", label: "Redaksi (Kak Nara)", icon: User },
  { id: "mentor", label: "Mentor / Ahli", icon: GraduationCap },
  { id: "cerita_pembaca", label: "Cerita Pembaca", icon: MessageSquare },
];

const ARCHITECTURES = [
  { id: "pilar", label: "Pilar", desc: "Evergreen, 2.500–4.000 kata" },
  { id: "kluster", label: "Kluster", desc: "Sub-topik, 1.500–2.500 kata" },
  { id: "trending", label: "Trending", desc: "Real-time, 800–1.200 kata" },
];

const DISCLAIMER_TYPES = [
  { id: "none", label: "None", color: "bg-gray-100 text-gray-600" },
  { id: "yellow", label: "Kuning", color: "bg-yellow-100 text-yellow-700" },
  { id: "red", label: "Merah", color: "bg-red-100 text-red-700" },
];

const STATUS_LABELS: Record<string, string> = {
  draft: "Draft", published: "Published", archived: "Archived", scheduled: "Terjadwal",
};
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700", published: "bg-green-100 text-green-700",
  archived: "bg-yellow-100 text-yellow-700", scheduled: "bg-blue-100 text-blue-700",
};

const REVIEW_LABELS: Record<string, string> = {
  draft: "Draft", peer_review: "Peer Review", mentor_approved: "Mentor OK", ready: "Siap",
};
const REVIEW_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-500", peer_review: "bg-orange-100 text-orange-700",
  mentor_approved: "bg-purple-100 text-purple-700", ready: "bg-green-100 text-green-700",
};

function postStatus(p: any): string {
  if (p.deleted_at) return "deleted";
  if (p.scheduled_at && !p.is_published) return "scheduled";
  if (p.is_published === true) return "published";
  return "draft";
}

function toLocalDatetime(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.getFullYear() + "-" +
    String(d.getMonth() + 1).padStart(2, "0") + "-" +
    String(d.getDate()).padStart(2, "0") + "T" +
    String(d.getHours()).padStart(2, "0") + ":" +
    String(d.getMinutes()).padStart(2, "0");
}

const AUTHOR_TYPE_BADGE: Record<string, { label: string; color: string }> = {
  redaksi: { label: "Redaksi", color: "bg-blue-100 text-blue-700" },
  mentor: { label: "Mentor", color: "bg-purple-100 text-purple-700" },
  cerita_pembaca: { label: "Cerita", color: "bg-orange-100 text-orange-700" },
};

const ARCH_LABELS: Record<string, string> = { pilar: "Pilar", kluster: "Kluster", trending: "Trending" };

export default function InspirasiPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    title: "", content: "", excerpt: "", category_id: "mind-body",
    cover_image: "", author_name: "", read_time_minutes: 5,
    slug: "", meta_title: "", meta_description: "", og_image: "",
    scheduled_at: "", author_type: "redaksi", architecture: "",
    disclaimer_type: "none", disclaimer_custom: "",
    author_credentials: { gelar: "", institusi: "", linkedin: "", foto_url: "" },
    author_anon_name: "", series_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [scheduleInputs, setScheduleInputs] = useState<Record<string, string>>({});
  const [insight, setInsight] = useState<any>(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genKeyword, setGenKeyword] = useState("");
  const [genCategory, setGenCategory] = useState("mind-body");
  const [genStyle, setGenStyle] = useState("standard");
  const [genLoading, setGenLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/admin/konten/posts");
      if (res.ok) { const { data } = await res.json(); setPosts(data || []); }
    } catch (e) { console.error("Failed to load posts", e); } finally { setLoading(false); }
  };

  const fetchTrash = async () => {
    try {
      const res = await fetch("/api/admin/konten/posts?trash=1");
      if (res.ok) { const { data } = await res.json(); setTrashPosts(data || []); }
    } catch (e) { console.error("Failed to load trash", e); }
  };

  const fetchSeries = async () => {
    try {
      const res = await fetch("/api/admin/konten/series");
      if (res.ok) { const { data } = await res.json(); setSeriesList(data || []); }
    } catch (e) { console.error("Failed to load series", e); }
  };

  const fetchInsight = async () => {
    try {
      const res = await fetch("/api/admin/konten/insight");
      if (res.ok) { setInsight(await res.json()); }
    } catch { /* non-critical */ } finally { setInsightLoading(false) }
  };

  useEffect(() => { fetchPosts(); fetchSeries(); fetchInsight(); }, []);

  const [trashPosts, setTrashPosts] = useState<any[]>([]);

  function startEdit(p: any) {
    setEditId(p.id);
    setForm({
      title: p.title, content: p.content, excerpt: p.excerpt || "",
      category_id: p.category_id || "mind-body",
      cover_image: p.cover_image || "",
      author_name: p.author || p.author_name || "",
      read_time_minutes: p.read_time_minutes || 5,
      slug: p.slug || "",
      meta_title: p.meta_title || "", meta_description: p.meta_description || "",
      og_image: p.og_image || "", scheduled_at: p.scheduled_at || "",
      author_type: p.author_type || "redaksi",
      architecture: p.architecture || "",
      disclaimer_type: p.disclaimer_type || "none",
      disclaimer_custom: p.disclaimer_custom || "",
      author_credentials: p.author_credentials || { gelar: "", institusi: "", linkedin: "", foto_url: "" },
      author_anon_name: p.author_anon_name || "",
      series_id: p.series_id || "",
    });
    setShowAdd(true);
  }

  function startNew() {
    setEditId(null);
    setForm({
      title: "", content: "", excerpt: "", category_id: "mind-body",
      cover_image: "", author_name: "", read_time_minutes: 5,
      slug: "", meta_title: "", meta_description: "", og_image: "",
      scheduled_at: "", author_type: "redaksi", architecture: "",
      disclaimer_type: "none", disclaimer_custom: "",
      author_credentials: { gelar: "", institusi: "", linkedin: "", foto_url: "" },
      author_anon_name: "", series_id: "",
    });
    setShowAdd(true);
  }

  async function save() {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const body: any = { ...form };
      if (!editId) body.status = "draft";
      if (body.scheduled_at) {
        body.status = "";
        body.scheduled_at = new Date(body.scheduled_at).toISOString();
      } else {
        delete body.scheduled_at;
      }
      if (!body.series_id) delete body.series_id;
      if (!body.author_anon_name) delete body.author_anon_name;
      if (body.author_type !== "mentor") delete body.author_credentials;
      if (body.disclaimer_type === "none") { body.disclaimer_custom = null; }

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
      setShowTrash(false);
      await fetchPosts();
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/konten/posts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || `HTTP ${res.status}`); }
      await fetchPosts();
    } catch (e: any) { alert(e.message); }
  }

  async function schedulePost(id: string, scheduledAt: string) {
    if (!scheduledAt) return;
    try {
      const res = await fetch(`/api/admin/konten/posts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scheduled_at: new Date(scheduledAt).toISOString(), is_published: false }) });
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || `HTTP ${res.status}`); }
      await fetchPosts();
    } catch (e: any) { alert(e.message); }
  }

  async function remove(id: string) {
    if (!confirm("Hapus post ini? Masih bisa dipulihkan dalam 30 hari.")) return;
    try {
      const res = await fetch(`/api/admin/konten/posts/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error("Gagal menghapus");
      await fetchPosts();
    } catch (e: any) { alert(e.message); }
  }

  async function restorePost(id: string) {
    try {
      const res = await fetch(`/api/admin/konten/posts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleted_at: null }) });
      if (!res.ok) throw new Error("Gagal memulihkan");
      await fetchPosts();
    } catch (e: any) { alert(e.message); }
  }

  async function deletePermanent(id: string) {
    if (!confirm("Hapus permanen? Post tidak bisa dipulihkan lagi.")) return;
    try {
      const res = await fetch(`/api/admin/konten/posts/${id}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ permanent: true }) });
      if (!res.ok) throw new Error("Gagal menghapus permanen");
      await fetchPosts();
    } catch (e: any) { alert(e.message); }
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
    } catch (err: any) { alert(`Upload cover gagal: ${err.message || ""}`); } finally { setUploadingCover(false); }
  }

  const authorType = form.author_type;

  const generateFromInsight = async (title: string) => {
    setGenLoading(true)
    try {
      const res = await fetch("/api/admin/konten/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_full", topic: title, category: "mind-body", style: "standard" }),
      })
      if (!res.ok) throw new Error("AI service unavailable")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      let article = { title, content: "" }
      try { article = JSON.parse(data.result) } catch { article = { title, content: data.result } }
      openEditorWithContent(article.title, article.content)
    } catch (e: any) { alert("Gagal generate: " + (e.message || "coba lagi")) } finally { setGenLoading(false); setShowGenerate(false) }
  }

  const handleGenerate = async () => {
    if (!genKeyword.trim()) return
    setGenLoading(true)
    try {
      const res = await fetch("/api/admin/konten/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_full", topic: genKeyword, category: genCategory, style: genStyle }),
      })
      if (!res.ok) throw new Error("AI service unavailable")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      let article = { title: genKeyword, content: "" }
      try { article = JSON.parse(data.result) } catch { article = { title: genKeyword, content: data.result } }
      openEditorWithContent(article.title, article.content)
    } catch (e: any) { alert("Gagal generate: " + (e.message || "coba lagi")) } finally { setGenLoading(false); setShowGenerate(false) }
  }

  const openEditorWithContent = (title: string, content: string) => {
    setEditId(null)
    setForm({
      title: title, content: content, excerpt: "", category_id: genCategory || "mind-body",
      cover_image: "", author_name: "", read_time_minutes: 5,
      slug: "", meta_title: "", meta_description: "", og_image: "",
      scheduled_at: "", author_type: "redaksi", architecture: "",
      disclaimer_type: "none", disclaimer_custom: "",
      author_credentials: { gelar: "", institusi: "", linkedin: "", foto_url: "" },
      author_anon_name: "", series_id: "",
    })
    setShowAdd(true)
    setTimeout(() => {
      const editor = document.querySelector(".ProseMirror") as any
      if (editor) editor.focus()
    }, 500)
  }

  // --- Filtered posts ---
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q) || p.slug?.toLowerCase().includes(q));
    }
    if (filterCat) list = list.filter(p => p.category_id === filterCat);
    if (filterStatus) list = list.filter(p => postStatus(p) === filterStatus);
    return list;
  }, [posts, search, filterCat, filterStatus]);

  // --- Resume stats ---
  const statsResume = useMemo(() => {
    const byCat: Record<string, number> = {};
    let total = 0, published = 0, draft = 0, scheduled = 0;
    posts.forEach(p => {
      const cat = p.category_id || "other";
      byCat[cat] = (byCat[cat] || 0) + 1;
      total++;
      const st = postStatus(p);
      if (st === "published") published++;
      if (st === "draft") draft++;
      if (st === "scheduled") scheduled++;
    });
    return { byCat, total, published, draft, scheduled };
  }, [posts]);

  const CatIcon = ({ id }: { id: string }) => {
    const icons: Record<string, string> = { heart: "\u2764", sparkles: "\u2728", "trending-up": "\uD83D\uDCC8", users: "\uD83D\uDC65", feather: "\u270F\uFE0F", monitor: "\uD83D\uDDA5\uFE0F", clapperboard: "\uD83C\uDFAC" };
    return <span>{icons[id] || "\u2764"}</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Inspirasi Posts</h1>
        <div className="flex items-center gap-2">
          {showTrash && <Button variant="ghost" size="sm" onClick={() => setShowTrash(false)} className="cursor-pointer">Kembali</Button>}
          <Button variant={showTrash ? "accent" : "ghost"} size="sm" onClick={() => { setShowTrash(!showTrash); if (!showTrash) fetchTrash(); }} className="cursor-pointer"><Trash className="w-4 h-4" /> Sampah</Button>
          {!showTrash && <Button variant="accent" size="sm" onClick={startNew} className="cursor-pointer"><Plus className="w-4 h-4" /> Tambah Post</Button>}
          {!showTrash && <Button size="sm" onClick={() => setShowGenerate(true)} className="cursor-pointer" style={{ background: "#FFC64F", color: "#1E2938" }}><Sparkles className="w-4 h-4" /> Generate</Button>}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : showTrash ? (
        trashPosts.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">Sampah kosong</p>
        ) : (
          <div className="space-y-2">
            {trashPosts.map((p) => {
              const daysLeft = p.deleted_at ? 30 - Math.floor((Date.now() - new Date(p.deleted_at).getTime()) / 86400000) : 30;
              return (
                <div key={p.id} className="bg-white rounded-xl border border-red-200 p-4 opacity-75">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-700">Dihapus</span>
                        <Badge variant="accent" className="text-[10px]">{p.category_label || p.category}</Badge>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                      <p className="text-xs text-red-500 mt-1">{daysLeft} hari sebelum dihapus permanen</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => restorePost(p.id)} className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center cursor-pointer" title="Pulihkan"><RotateCcw className="w-3.5 h-3.5 text-green-500" /></button>
                      <button onClick={() => deletePermanent(p.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer" title="Hapus Permanen"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
      <>
      {/* Resume Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        <div className="p-3 rounded-xl border bg-white border-gray-200 text-center" title="Total">
          <p className="text-[10px] text-gray-400">Total</p>
          <p className="text-lg font-bold text-gray-900">{statsResume.total}</p>
        </div>
        <div className="p-3 rounded-xl border bg-white border-gray-200 text-center" title="Published">
          <p className="text-[10px] text-gray-400">Published</p>
          <p className="text-lg font-bold text-green-600">{statsResume.published}</p>
        </div>
        <div className="p-3 rounded-xl border bg-white border-gray-200 text-center" title="Draft">
          <p className="text-[10px] text-gray-400">Draft</p>
          <p className="text-lg font-bold text-gray-500">{statsResume.draft}</p>
        </div>
        <div className="p-3 rounded-xl border bg-white border-gray-200 text-center" title="Scheduled">
          <p className="text-[10px] text-gray-400">Terjadwal</p>
          <p className="text-lg font-bold text-blue-500">{statsResume.scheduled}</p>
        </div>
        {CATEGORIES.map(c => (
          <div key={c.id} className="p-3 rounded-xl border bg-white border-gray-200 text-center" title={c.label}>
            <p className="text-[10px] text-gray-400 truncate">{c.label}</p>
            <p className="text-lg font-bold text-gray-900">{statsResume.byCat[c.id] || 0}</p>
          </div>
        ))}
      </div>

      {/* Insight Panel */}
      {!insightLoading && insight && (insight.curhat || insight.journey || insight.circle || insight.aiArticle) && (
        <div className="p-5 rounded-2xl border-2 bg-gradient-to-r" style={{ borderColor: "rgba(255,198,79,0.3)", background: "linear-gradient(135deg, rgba(255,198,79,0.04), rgba(8,68,99,0.02))" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: "#FFC64F" }} />
            <h3 className="text-sm font-bold" style={{ color: "#1E2938" }}>🔥 Insight Hari Ini</h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {insight.curhat && (
              <div className="p-3 rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp size={13} style={{ color: "#EF4444" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#647488" }}>Curhat sedang ramai</span>
                </div>
                <p className="text-xs font-bold" style={{ color: "#1E2938" }}>{insight.curhat.title}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#647488" }}>{insight.curhat.users} pengguna</p>
              </div>
            )}
            {insight.journey && (
              <div className="p-3 rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Target size={13} style={{ color: "#FFC64F" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#647488" }}>Journey sering gagal</span>
                </div>
                <p className="text-xs font-bold" style={{ color: "#1E2938" }}>{insight.journey.title}</p>
              </div>
            )}
            {insight.circle && (
              <div className="p-3 rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <UsersIcon size={13} style={{ color: "#6BB9D4" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#647488" }}>Circle paling aktif</span>
                </div>
                <p className="text-xs font-bold" style={{ color: "#1E2938" }}>{insight.circle.name}</p>
                <p className="text-[10px] mt-0.5" style={{ color: "#647488" }}>{insight.circle.members} member baru</p>
              </div>
            )}
            {insight.aiArticle && (
              <div className="p-3 rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Lightbulb size={13} style={{ color: "#22C55E" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "#647488" }}>Artikel AI</span>
                </div>
                <p className="text-xs font-bold" style={{ color: "#1E2938" }}>{insight.aiArticle}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px]" style={{ color: "#FFC64F" }}>{"★".repeat(5)}</div>
              </div>
            )}
          </div>
          <button onClick={() => generateFromInsight(insight.aiArticle || insight.curhat?.title || "")} className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-opacity hover:opacity-90" style={{ background: "#084463", color: "#FFFFFF" }}>
            <Sparkles size={13} style={{ color: "#FFC64F" }} /> Generate Artikel
          </button>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari judul, excerpt, slug..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none focus:border-gray-300" />
        </div>
        <select value={filterCat || ""} onChange={e => setFilterCat(e.target.value || null)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none">
          <option value="">Semua Kategori</option>
          {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select value={filterStatus || ""} onChange={e => setFilterStatus(e.target.value || null)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white outline-none">
          <option value="">Semua Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Terjadwal</option>
        </select>
        {(search || filterCat || filterStatus) && (
          <button onClick={() => { setSearch(""); setFilterCat(null); setFilterStatus(null) }} className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">Reset</button>
        )}
      </div>
        <div className="space-y-2">
          {filteredPosts.length === 0 && <p className="text-sm text-gray-500 text-center py-8">{search || filterCat || filterStatus ? "Tidak ada hasil" : "Belum ada post"}</p>}
          {filteredPosts.map((p) => {
            const st = postStatus(p);
            const authorBadge = AUTHOR_TYPE_BADGE[p.author_type || "redaksi"];
            return (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[st] || "bg-gray-100 text-gray-700"}`}>{STATUS_LABELS[st] || st}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${authorBadge.color}`}>{authorBadge.label}</span>
                      <Badge variant="accent" className="text-[10px]">{p.category_label || p.category}</Badge>
                      {p.architecture && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-cyan-100 text-cyan-700">{ARCH_LABELS[p.architecture] || p.architecture}</span>}
                      {p.review_status && p.review_status !== "ready" && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${REVIEW_COLORS[p.review_status] || ""}`}>
                          {REVIEW_LABELS[p.review_status] || p.review_status}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.excerpt || p.content?.slice(0, 100)}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                      <span>{p.author || p.author_name || "\u2014"}</span>
                      <span>{new Date(p.created_at).toLocaleString("id-ID")}</span>
                      {p.scheduled_at && !p.is_published && <span className="text-blue-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(p.scheduled_at).toLocaleString("id-ID")}</span>}
                      {p.read_time_minutes && <span>{p.read_time_minutes} menit</span>}
                      {p.slug && <span className="font-mono">/{p.slug}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(p)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer" title="Edit"><FileText className="w-3.5 h-3.5 text-gray-400" /></button>
                    {st === "draft" && (
                      <>
                        <button onClick={() => updateStatus(p.id, "published")} className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center cursor-pointer" title="Publish"><Send className="w-3.5 h-3.5 text-green-500" /></button>
                        <div className="relative">
                          <button onClick={() => { const el = document.getElementById(`schedule-${p.id}`); if (el) el.classList.toggle("hidden"); }} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center cursor-pointer" title="Jadwalkan"><CalendarClock className="w-3.5 h-3.5 text-blue-500" /></button>
                          <div id={`schedule-${p.id}`} className="hidden absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 flex items-center gap-2">
                            <input type="datetime-local" className="px-2 py-1.5 rounded-lg border border-gray-200 text-xs w-44" value={scheduleInputs[p.id] || ""} onChange={(e) => setScheduleInputs((prev: any) => ({ ...prev, [p.id]: e.target.value }))} />
                            <button onClick={() => schedulePost(p.id, scheduleInputs[p.id] || "")} className="px-2.5 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 cursor-pointer">Atur</button>
      </div>

                        </div>
                      </>
                    )}
                    {st === "scheduled" && <button onClick={() => updateStatus(p.id, "draft")} className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center cursor-pointer" title="Batal Jadwal"><X className="w-3.5 h-3.5 text-gray-500" /></button>}
                    {st === "published" && <button onClick={() => updateStatus(p.id, "archived")} className="w-7 h-7 rounded-lg hover:bg-yellow-50 flex items-center justify-center cursor-pointer" title="Archive"><Archive className="w-3.5 h-3.5 text-yellow-500" /></button>}
                    {st === "archived" && <button onClick={() => updateStatus(p.id, "draft")} className="w-7 h-7 rounded-lg hover:bg-gray-50 flex items-center justify-center cursor-pointer" title="Unarchive"><EyeOff className="w-3.5 h-3.5 text-gray-500" /></button>}
                    <button onClick={() => remove(p.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer" title="Hapus"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">{editId ? "Edit Post" : "Tambah Post"}</h3>
              <button onClick={() => setShowAdd(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Slug</label><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Auto-generated" /></div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Kategori</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.id} onClick={() => setForm({ ...form, category_id: c.id })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                        form.category_id === c.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      <CatIcon id={c.icon} /> {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Tipe Penulis</label>
                <div className="grid grid-cols-3 gap-2">
                  {AUTHOR_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button key={t.id} onClick={() => setForm({ ...form, author_type: t.id })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                          form.author_type === t.id ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}>
                        <Icon className="w-4 h-4" /> {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {authorType === "mentor" && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-3">
                  <p className="text-xs font-semibold text-purple-700">Data Mentor</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-medium text-gray-500 block mb-1">Nama Lengkap</label><input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-purple-200 text-sm" /></div>
                    <div><label className="text-[10px] font-medium text-gray-500 block mb-1">Gelar / Sertifikasi</label><input value={form.author_credentials.gelar} onChange={(e) => setForm({ ...form, author_credentials: { ...form.author_credentials, gelar: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-purple-200 text-sm" placeholder="S.Psi., M.Psi., Psikolog" /></div>
                    <div><label className="text-[10px] font-medium text-gray-500 block mb-1">Institusi / Praktik</label><input value={form.author_credentials.institusi} onChange={(e) => setForm({ ...form, author_credentials: { ...form.author_credentials, institusi: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-purple-200 text-sm" /></div>
                    <div><label className="text-[10px] font-medium text-gray-500 block mb-1">LinkedIn / URL Profesional</label><input value={form.author_credentials.linkedin} onChange={(e) => setForm({ ...form, author_credentials: { ...form.author_credentials, linkedin: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-purple-200 text-sm" /></div>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-gray-500 block mb-1">Foto Profesional</label>
                    <div className="flex items-center gap-2">
                      <input value={form.author_credentials.foto_url} onChange={(e) => setForm({ ...form, author_credentials: { ...form.author_credentials, foto_url: e.target.value } })} className="flex-1 px-3 py-2 rounded-lg border border-purple-200 text-sm" placeholder="URL foto" />
                      {form.author_credentials.foto_url && <img src={form.author_credentials.foto_url} className="w-10 h-10 rounded-full object-cover" alt="" />}
                    </div>
                  </div>
                </div>
              )}

              {authorType === "cerita_pembaca" && (
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 space-y-3">
                  <p className="text-xs font-semibold text-orange-700">Identitas Penulis Cerita</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[10px] font-medium text-gray-500 block mb-1">Nama Anonim</label><input value={form.author_anon_name} onChange={(e) => setForm({ ...form, author_anon_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm" placeholder="Anonim, 20 tahun, Jakarta" /></div>
                    <div><label className="text-[10px] font-medium text-gray-500 block mb-1">Nama Asli (internal)</label><input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm" /></div>
                  </div>
                </div>
              )}

              {authorType === "redaksi" && (
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Author Name</label><input value={form.author_name} onChange={(e) => setForm((prev: any) => ({ ...prev, author_name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Arsitektur Konten</label>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => setForm({ ...form, architecture: "" })}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${!form.architecture ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}>
                    None
                  </button>
                  {ARCHITECTURES.map((a) => (
                    <button key={a.id} onClick={() => setForm({ ...form, architecture: a.id })}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${
                        form.architecture === a.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}>
                      <span className="font-medium">{a.label}</span>
                      <p className="text-[9px] text-gray-400 mt-0.5">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Series (opsional)</label>
                <select value={form.series_id} onChange={(e) => setForm({ ...form, series_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  <option value="">Tidak masuk series</option>
                  {seriesList.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Content</label>
                <RichTextEditor content={form.content} onChange={(html) => setForm((prev: any) => ({ ...prev, content: html }))} placeholder="Tulis konten artikel di sini..." />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Excerpt</label><input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
                <div><label className="text-xs font-medium text-gray-600 block mb-1">Read Time (menit)</label><input type="number" min={1} max={60} value={form.read_time_minutes} onChange={(e) => setForm((prev: any) => ({ ...prev, read_time_minutes: parseInt(e.target.value) || 5 }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" /></div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Jadwalkan Publikasi (opsional)</label>
                <input type="datetime-local" value={form.scheduled_at ? toLocalDatetime(form.scheduled_at) : ""} onChange={(e) => setForm((prev: any) => ({ ...prev, scheduled_at: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Cover Image</label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm cursor-pointer hover:bg-gray-50">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">{uploadingCover ? "Uploading..." : form.cover_image ? "Ganti" : "Upload"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); e.target.value = ""; }} />
                  </label>
                  {form.cover_image && <button onClick={() => setForm((prev: any) => ({ ...prev, cover_image: "" }))} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Hapus</button>}
                </div>
                {form.cover_image && <div className="mt-2 aspect-[16/9] rounded-lg overflow-hidden bg-gray-100"><img src={form.cover_image} alt="" className="w-full h-full object-cover" /></div>}
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-gray-700">Disclaimer</span>
                </div>
                <div className="flex gap-2">
                  {DISCLAIMER_TYPES.map((d) => (
                    <button key={d.id} onClick={() => setForm({ ...form, disclaimer_type: d.id })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        form.disclaimer_type === d.id ? d.color + " ring-2 ring-offset-1" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}>
                      {d.label}
                    </button>
                  ))}
                </div>
                {form.disclaimer_type !== "none" && (
                  <textarea value={form.disclaimer_custom} onChange={(e) => setForm({ ...form, disclaimer_custom: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs resize-none" rows={2}
                    placeholder={`Custom disclaimer (opsional). Default untuk ${form.disclaimer_type === "red" ? "MERAH" : "KUNING"} sudah otomatis.`} />
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

      {showGenerate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={() => setShowGenerate(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} style={{ color: "#FFC64F" }} />
                <h3 className="text-sm font-bold text-gray-900">Generate Artikel AI</h3>
              </div>
              <button onClick={() => setShowGenerate(false)} className="cursor-pointer"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <p className="text-xs text-gray-500 mb-4">AI akan menulis artikel sesuai standar konten Beautifio.</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Keyword / Topik</label>
                <input value={genKeyword} onChange={e => setGenKeyword(e.target.value)} placeholder="Contoh: overthinking pada remaja" className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none" autoFocus />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Kategori</label>
                <select value={genCategory} onChange={e => setGenCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Gaya Penulisan</label>
                <select value={genStyle} onChange={e => setGenStyle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm outline-none">
                  <option value="standard">📝 Standar — Artikel inspiratif</option>
                  <option value="cerpen">📖 Cerpen — Cerita pendek naratif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowGenerate(false)} disabled={genLoading} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 cursor-pointer hover:bg-gray-50">Batal</button>
              <button onClick={handleGenerate} disabled={genLoading || !genKeyword.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: "#084463" }}>
                {genLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {genLoading ? "Menulis..." : "Generate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
