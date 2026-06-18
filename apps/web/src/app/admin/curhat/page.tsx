"use client";

import { useState, useEffect } from "react";
import { MessageCircle, MessageSquare, RefreshCw, Eye, EyeOff, Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@beautifio/ui";

const STATUS_LABELS: Record<string, string> = { visible: "Visible", flagged: "Flagged", hidden: "Hidden", removed: "Removed" };
const STATUS_COLORS: Record<string, string> = {
  visible: "bg-green-100 text-green-700",
  flagged: "bg-red-100 text-red-700",
  hidden: "bg-yellow-100 text-yellow-700",
  removed: "bg-gray-100 text-gray-600",
};
const STATUS_ICONS: Record<string, React.ElementType> = {
  visible: CheckCircle,
  flagged: AlertTriangle,
  hidden: EyeOff,
  removed: Trash2,
};

export default function CurhatModerationPage() {
  const [tab, setTab] = useState<"posts" | "comments">("posts");
  const [posts, setPosts] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, sRes] = await Promise.all([
        fetch("/api/admin/curhat/posts"),
        fetch("/api/admin/curhat/comments"),
        fetch("/api/admin/curhat/stats"),
      ]);
      if (pRes.ok) { const { data } = await pRes.json(); setPosts(data || []); }
      if (cRes.ok) { const { data } = await cRes.json(); setComments(data || []); }
      if (sRes.ok) { const { data } = await sRes.json(); setStats(data); }
    } catch (e) { console.error("Failed to load", e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  async function updateStatus(type: "posts" | "comments", id: string, status: string) {
    try {
      await fetch(`/api/admin/curhat/${type}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await fetchAll();
    } catch (e) { console.error("Update failed", e); }
  }

  const filteredPosts = statusFilter ? posts.filter((p) => p.status === statusFilter) : posts;
  const filteredComments = statusFilter ? comments.filter((c) => c.status === statusFilter) : comments;

  const statusCounts = stats && tab === "posts" ? stats.posts_by_status : stats?.comments_by_status;

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Curhat Moderation</h1>

      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {["visible", "flagged", "hidden", "removed"].map((s) => {
            const Icon = STATUS_ICONS[s];
            const count = tab === "posts" ? stats.posts_by_status[s] : stats.comments_by_status[s];
            return (
              <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${statusFilter === s ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300" : "bg-white border-gray-200 hover:border-amber-200"}`}>
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${s === "flagged" ? "text-red-500" : s === "hidden" ? "text-yellow-500" : s === "removed" ? "text-gray-400" : "text-green-500"}`} />
                  <span className="text-[10px] font-medium text-gray-500">{STATUS_LABELS[s]}</span>
                </div>
                <p className="text-lg font-bold text-gray-900 mt-1">{count}</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-gray-200">
        <button onClick={() => { setTab("posts"); setStatusFilter(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${tab === "posts" ? "border-amber-500 text-amber-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <MessageCircle className="w-4 h-4" /> Posts ({stats?.total_posts || 0})
        </button>
        <button onClick={() => { setTab("comments"); setStatusFilter(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer ${tab === "comments" ? "border-amber-500 text-amber-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
          <MessageSquare className="w-4 h-4" /> Comments ({stats?.total_comments || 0})
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : tab === "posts" ? (
        <div className="space-y-2">
          {filteredPosts.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Tidak ada post</p>}
          {filteredPosts.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[p.status] || p.status}</span>
                    {p.category && <Badge variant="accent" className="text-[10px]">{p.category}</Badge>}
                    {p.flag_reason && <span className="text-[10px] text-red-500">{p.flag_reason}</span>}
                  </div>
                  <p className="text-sm text-gray-900 line-clamp-2">{p.content}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span className="font-medium">{p.users?.full_name || p.users?.email || "Anonim"}</span>
                    <span>{new Date(p.created_at).toLocaleString("id-ID")}</span>
                    {p.flagged_at && <span className="text-red-400">Flagged {new Date(p.flagged_at).toLocaleString("id-ID")}</span>}
                    {p.support_count > 0 && <span>{p.support_count} dukungan</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {p.status !== "visible" && (
                    <button onClick={() => updateStatus("posts", p.id, "visible")}
                      className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center cursor-pointer" title="Approve">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    </button>
                  )}
                  {p.status !== "hidden" && (
                    <button onClick={() => updateStatus("posts", p.id, "hidden")}
                      className="w-7 h-7 rounded-lg hover:bg-yellow-50 flex items-center justify-center cursor-pointer" title="Hide">
                      <EyeOff className="w-3.5 h-3.5 text-yellow-500" />
                    </button>
                  )}
                  {p.status !== "removed" && (
                    <button onClick={() => {
                      if (!confirm("Hapus post ini dari curhat? Aksi ini akan menyembunyikan post dari publik.")) return;
                      updateStatus("posts", p.id, "removed");
                    }}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer" title="Remove">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredComments.length === 0 && <p className="text-sm text-gray-500 text-center py-8">Tidak ada komentar</p>}
          {filteredComments.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status] || "bg-gray-100 text-gray-600"}`}>{STATUS_LABELS[c.status] || c.status}</span>
                  </div>
                  <p className="text-xs text-gray-400 italic mb-1 line-clamp-1">Post: "{c.curhat_posts?.content}"</p>
                  <p className="text-sm text-gray-900">{c.content}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                    <span className="font-medium">{c.users?.full_name || c.users?.email || "Anonim"}</span>
                    <span>{new Date(c.created_at).toLocaleString("id-ID")}</span>
                    {c.flagged_at && <span className="text-red-400">Flagged {new Date(c.flagged_at).toLocaleString("id-ID")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {c.status !== "visible" && (
                    <button onClick={() => updateStatus("comments", c.id, "visible")}
                      className="w-7 h-7 rounded-lg hover:bg-green-50 flex items-center justify-center cursor-pointer" title="Approve">
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    </button>
                  )}
                  {c.status !== "hidden" && (
                    <button onClick={() => updateStatus("comments", c.id, "hidden")}
                      className="w-7 h-7 rounded-lg hover:bg-yellow-50 flex items-center justify-center cursor-pointer" title="Hide">
                      <EyeOff className="w-3.5 h-3.5 text-yellow-500" />
                    </button>
                  )}
                  {c.status !== "removed" && (
                    <button onClick={() => {
                      if (!confirm("Hapus komentar ini? Aksi ini akan menyembunyikan komentar dari publik.")) return;
                      updateStatus("comments", c.id, "removed");
                    }}
                      className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center cursor-pointer" title="Remove">
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
