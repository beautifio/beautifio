"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Eye, EyeOff, FileText, Save, X, Send, Archive, Upload, CalendarClock, Clock, RotateCcw, Trash, User, GraduationCap, MessageSquare, Layers, AlertTriangle, Search, Sparkles, TrendingUp, Target, Users as UsersIcon, Lightbulb, Loader2, Star } from "lucide-react";
import { Button, Badge } from "@beautifio/ui";
import { RichTextEditor } from "@/features/editor/RichTextEditor"
import { KeywordInsightPanel } from "@/components/admin/KeywordInsightPanel";

const CATEGORIES = [
  { id: "mind-body", label: "Mind & Body", icon: "heart" },
  { id: "beauty-skincare", label: "Beauty & Skincare", icon: "sparkles" },
  { id: "wellness", label: "Wellness", icon: "activity" },
  { id: "style-shopping", label: "Style & Shopping", icon: "shopping-bag" },
  { id: "entertainment", label: "Entertainment", icon: "clapperboard" },
  { id: "lifetainment", label: "Lifetainment", icon: "utensils" },
  { id: "relationship", label: "Relationship", icon: "users" },
  { id: "levelup-career", label: "Level Up & Career", icon: "trending-up" },
  { id: "creative-space", label: "Creative Space", icon: "feather" },
  { id: "tech-gaming", label: "Tech & Gaming", icon: "monitor" },
  { id: "opinion", label: "Opini & Aksi", icon: "newspaper" },
  { id: "news", label: "Update & Berita", icon: "megaphone" },
  { id: "sports", label: "Olahraga", icon: "trophy" },
  { id: "tokoh", label: "Tokoh", icon: "star" },
];

const AUTHOR_TYPES = [
  { id: "redaksi", label: "Redaksi (Kak Nara)", icon: User },
  { id: "mentor", label: "Mentor / Ahli", icon: GraduationCap },
  { id: "cerita_pembaca", label: "Cerita Pembaca", icon: MessageSquare },
];

const ARCHITECTURES = [
  { id: "pilar", label: "Pilar", desc: "Long-form, 4.000–5.000 kata" },
  { id: "kluster", label: "Kluster", desc: "Sub-topik, 1.000–2.000 kata" },
  { id: "trending", label: "Trending", desc: "Real-time, 500–1.000 kata" },
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
  const [totalPosts, setTotalPosts] = useState(0);
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
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
  const [genArch, setGenArch] = useState("trending");
  const [genLoading, setGenLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [tagSuggestions, setTagSuggestions] = useState<string[]>([]);
  const [tagList, setTagList] = useState<string[]>([]);

  const fetchPosts = async (p = page) => {
    try {
      let url = `/api/admin/konten/posts?page=${p}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) { const { data, total } = await res.json(); setPosts(data || []); setTotalPosts(total || 0); }
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

  const fetchTags = async () => {
    try {
      const { supabase } = await import("@/lib/supabase/client")
      if (!supabase) return
      const { data } =     await supabase.from("app_settings").select("value").eq("key", "content_tags").single()
      if (data?.value) setTagSuggestions(JSON.parse(data.value))
    } catch { /* ignore */ }
  };

  const addTagsToForm = (tags: string[]) => { setTagList(tags); setForm((prev: any) => ({ ...prev, tags })); };

  useEffect(() => { fetchPosts(); fetchSeries(); fetchInsight(); fetchTags(); }, []);

  // Search → re-fetch with debounce (server-side)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      setPage(1);
      // fetchPosts(1) called by goToPage pattern — direct call
      const url = search
        ? `/api/admin/konten/posts?page=1&limit=10&search=${encodeURIComponent(search)}`
        : `/api/admin/konten/posts?page=1&limit=10`;
      fetch(url).then(res => res.json()).then(({ data, total }) => {
        setPosts(data || []);
        setTotalPosts(total || 0);
        setLoading(false);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
    setTagList(p.tags || []);
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
      author_anon_name: "",       series_id: "",
    });
    setTagList([]);
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

  async function toggleFeatured(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/konten/posts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_featured: !current }) });
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
        body: JSON.stringify({ action: "generate_full", topic: title, category: "mind-body", style: "standard", architecture: "trending" }),
      })
      if (!res.ok) throw new Error("AI service unavailable")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      let article: any = { title, content: "" }
      try { article = JSON.parse(data.result) } catch { article = { title, content: data.result } }
      openEditorWithContent(article.title, article.content, article)
    } catch (e: any) { alert("Gagal generate: " + (e.message || "coba lagi")) } finally { setGenLoading(false); setShowGenerate(false) }
  }

  const handleGenerate = async () => {
    if (!genKeyword.trim()) return
    setGenLoading(true)
    try {
      const res = await fetch("/api/admin/konten/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate_full", topic: genKeyword, category: genCategory, style: genStyle, architecture: genArch }),
      })
      if (!res.ok) throw new Error("AI service unavailable")
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      let article: any = { title: genKeyword, content: "" }
      try { article = JSON.parse(data.result) } catch { article = { title: genKeyword, content: data.result } }
      openEditorWithContent(article.title, article.content, article)
    } catch (e: any) { alert("Gagal generate: " + (e.message || "coba lagi")) } finally { setGenLoading(false); setShowGenerate(false) }
  }

  const openEditorWithContent = (title: string, content: string, meta?: any) => {
    setEditId(null)
    setForm({
      title: title, content: content, excerpt: meta?.excerpt || "", category_id: meta?.category || genCategory || "mind-body",
      cover_image: "", author_name: meta?.byline || "", read_time_minutes: meta?.read_time_minutes || 5,
      slug: meta?.slug || "", meta_title: meta?.meta_title || "", meta_description: meta?.meta_description || "", og_image: "",
      scheduled_at: "", author_type: "redaksi", architecture: genArch || meta?.architecture || "",
      disclaimer_type: meta?.tag_sensitivitas?.includes("merah") ? "red" : meta?.tag_sensitivitas?.includes("kuning") ? "yellow" : "none",
      disclaimer_custom: meta?.disclaimer || "",
      author_credentials: { gelar: "", institusi: "", linkedin: "", foto_url: "" },
      author_anon_name: "", series_id: "",
    })
    setTagList(meta?.tag_topik || meta?.tags || []);
    // Store tag dimensions for save
    setForm((prev: any) => ({
      ...prev,
      tags: meta?.tag_topik || meta?.tags || [],
      tag_format: meta?.tag_format || "panduan",
      tag_audiens: meta?.tag_audiens || "mahasiswa",
      tag_penulis: meta?.tag_penulis || "dari-redaksi",
      tag_sensitivitas: meta?.tag_sensitivitas || "aman",
    }))
    setShowAdd(true)
    setTimeout(() => {
      const editor = document.querySelector(".ProseMirror") as any
      if (editor) editor.focus()
    }, 500)
  }

  // --- Filtered posts ---
  const filteredPosts = useMemo(() => {
    let list = posts;
    if (filterCat) list = list.filter(p => p.category_id === filterCat);
    if (filterStatus) list = list.filter(p => postStatus(p) === filterStatus);
    return list;
  }, [posts, filterCat, filterStatus]);

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

  const MONTHLY_TARGET = 10;
  const totalPages = Math.max(1, Math.ceil(totalPosts / 10));

  const goToPage = (p: number) => {
    const pg = Math.max(1, Math.min(p, totalPages));
    setPage(pg);
    setLoading(true);
    let url = `/api/admin/konten/posts?page=${pg}&limit=10`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    fetch(url).then(res => res.json()).then(({ data, total }) => {
      setPosts(data || []);
      setTotalPosts(total || 0);
      setLoading(false);
    });
  };

  const CatIcon = ({ id }: { id: string }) => {
    const icons: Record<string, string> = { heart: "\u2764", sparkles: "\u2728", "trending-up": "\uD83D\uDCC8", users: "\uD83D\uDC65", feather: "\u270F\uFE0F", monitor: "\uD83D\uDDA5\uFE0F", clapperboard: "\uD83C\uDFAC", utensils: "\uD83C\uDF7D\uFE0F", activity: "\uD83C\uDFC3", "shopping-bag": "\uD83D\uDECD\uFE0F", newspaper: "\uD83D\uDCF0", megaphone: "\uD83D\uDCE3", trophy: "\uD83C\uDFC6", star: "\u2B50" };
    return <span>{icons[id] || "\u2764"}</span>;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Inspirasi Posts</h1>
        <div className="flex items-center gap-2">
          {showTrash && <Button variant="ghost" size="sm" onClick={() => setShowTrash(false)} className="cursor-pointer rounded-xl">Kembali</Button>}
          <Button variant="ghost" size="sm" onClick={() => { setShowTrash(!showTrash); if (!showTrash) fetchTrash(); }} className="cursor-pointer rounded-xl"><Trash className="w-4 h-4" /> Sampah</Button>
          {!showTrash && <Button variant="ghost" size="sm" onClick={startNew} className="cursor-pointer rounded-xl"><Plus className="w-4 h-4" /> Tambah Post</Button>}
          {!showTrash && <Button variant="ghost" size="sm" onClick={() => setShowGenerate(true)} className="cursor-pointer rounded-xl"><Sparkles className="w-4 h-4" /> Generate</Button>}
        </div>
      </div>

      {/* Stats Bar */}
      {!showTrash && (
        <div className="grid grid-cols-4 gap-3">
          {[{ label: "Total", value: statsResume.total, color: "#084463" }, { label: "Published", value: statsResume.published, color: "#22C55E" }, { label: "Draft", value: statsResume.draft, color: "#647488" }, { label: "Terjadwal", value: statsResume.scheduled, color: "#FFC64F" }].map(s => (
            <div key={s.label} className="bg-surface rounded-xl border border-border p-3 text-center">
              <p className="text-2xl font-bold font-display" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-text-secondary mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Category Table */}
      {!showTrash && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-2 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary">Kategori</th>
                <th className="text-center px-1 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary w-10">Total</th>
                <th className="text-center px-1 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary w-10">Target</th>
                <th className="text-left px-2 py-2 text-[10px] font-semibold tracking-wider uppercase text-text-secondary w-32">Pencapaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CATEGORIES.map(c => {
                const count = statsResume.byCat[c.id] || 0
                const pct = Math.round((count / MONTHLY_TARGET) * 100)
                const done = pct >= 100
                return (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{c.icon ? ({ heart: "❤️", sparkles: "✨", "trending-up": "📈", users: "👥", feather: "✏️", monitor: "🖥️", clapperboard: "🎬", utensils: "🍽️", activity: "🏃", "shopping-bag": "🛍️", newspaper: "📰", megaphone: "📣", trophy: "🏆", star: "⭐" }[c.icon] || "❤️") : "❤️"}</span>
                        <span className="text-[11px] font-medium text-text-primary">{c.label}</span>
                      </div>
                    </td>
                    <td className="text-center px-1 py-1.5 text-[11px] font-bold text-text-primary">{count}</td>
                    <td className="text-center px-1 py-1.5 text-[11px] text-text-secondary">{MONTHLY_TARGET}</td>
                    <td className="px-2 py-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: done ? "#22C55E" : pct >= 50 ? "#FFC64F" : "#6BB9D4" }} />
                        </div>
                        <span className={`text-[10px] font-semibold ${done ? "text-success" : "text-text-secondary"}`}>{pct}%</span>
                      </div>
                      <p className="text-[9px] text-text-secondary/50 mt-0.5">{done ? "✅ Tercapai!" : pct >= 80 ? "🔥 Dikit lagi!" : pct >= 50 ? "📈 Setengah jalan" : "💪 Ayo mulai!"}</p>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

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

      {/* Insight Panel */}
      <KeywordInsightPanel localInsight={insight} />

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
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[st] || "bg-gray-100 text-gray-700"}`}>{STATUS_LABELS[st] || st}</span>
                        {p.is_featured && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700 flex items-center gap-0.5"><Star className="w-2.5 h-2.5 fill-amber-400" /> Featured</span>}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${authorBadge.color}`}>{authorBadge.label}</span>
                      <Badge variant="accent" className="text-[10px]">{p.category_label || p.category}</Badge>
                      {p.architecture && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-cyan-100 text-cyan-700">{ARCH_LABELS[p.architecture] || p.architecture}</span>}
                      {p.tags?.slice(0, 3).map((t: string) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-gray-100 text-gray-500">#{t}</span>
                      ))}
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
                    <button onClick={() => toggleFeatured(p.id, p.is_featured)} className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer ${p.is_featured ? "bg-amber-50 hover:bg-amber-100" : "hover:bg-gray-50"}`} title={p.is_featured ? "Hapus Featured" : "Featured"}>
                      <Star className={`w-3.5 h-3.5 ${p.is_featured ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                    </button>
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
    <div className="max-w-content mx-auto px-6 pb-24 space-y-4">
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
                <label className="text-xs font-medium text-gray-600 block mb-1">Tags</label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tagList.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                      #{tag}
                      <button onClick={() => setTagList(prev => prev.filter(t => t !== tag))} className="cursor-pointer"><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="relative">
                  <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-")
                      if (!tagList.includes(t)) setTagList(prev => [...prev, t])
                      setTagInput("")
                    }
                    if (e.key === "Backspace" && !tagInput && tagList.length > 0) setTagList(prev => prev.slice(0, -1))
                  }} placeholder="Tambah tag..." className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none" />
                  {tagInput && tagSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-full rounded-xl border shadow-lg bg-white z-50 max-h-40 overflow-y-auto" style={{ borderColor: "#E2E8F0" }}>
                      {tagSuggestions.filter(s => s.includes(tagInput.toLowerCase())).slice(0, 8).map(s => (
                        <button key={s} onClick={() => { if (!tagList.includes(s)) setTagList(prev => [...prev, s]); setTagInput("") }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 cursor-pointer" style={{ color: "#1E2938" }}>#{s}</button>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* Pagination */}
      {!showTrash && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2">
          <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="w-8 h-8 rounded-lg border border-border text-xs font-medium disabled:opacity-30 hover:bg-muted transition-colors cursor-pointer">‹</button>
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
            let pg: number
            if (totalPages <= 10) pg = i + 1
            else if (page <= 6) pg = i + 1
            else if (page >= totalPages - 4) pg = totalPages - 9 + i
            else pg = page - 5 + i
            return <button key={pg} onClick={() => goToPage(pg)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors cursor-pointer ${pg === page ? "bg-primary text-white" : "border border-border hover:bg-muted"}`}>{pg}</button>
          })}
          <button onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="w-8 h-8 rounded-lg border border-border text-xs font-medium disabled:opacity-30 hover:bg-muted transition-colors cursor-pointer">›</button>
          <span className="text-[10px] text-text-secondary/50 ml-2">Hal {page} dari {totalPages}</span>
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
                <label className="text-xs font-medium text-gray-600 block mb-1">Arsitektur</label>
                <div className="grid grid-cols-3 gap-2">
                  {ARCHITECTURES.map(a => (
                    <button key={a.id} onClick={() => setGenArch(a.id)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer text-center ${genArch === a.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      <span className="font-medium text-xs">{a.label}</span>
                      <p className="text-[9px] text-gray-400 mt-0.5">{a.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
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
