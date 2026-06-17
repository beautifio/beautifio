"use client";

import { useState, useEffect } from "react";
import { Shield, BookOpen, CheckCircle2, Clock, Plus, ArrowLeft } from "lucide-react";
import { Badge } from "@beautifio/ui";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

interface ContentRequest {
  id: string;
  topic: string;
  keywords: string[];
  action_type: string;
  status: string;
  request_count: number;
  journey_template_slug: string | null;
  activity_title: string | null;
  published_article_id: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "bg-red-50", text: "text-red-700", label: "Pending" },
  in_progress: { bg: "bg-amber-50", text: "text-amber-700", label: "Dikerjakan" },
  published: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Terbit" },
  rejected: { bg: "bg-gray-100", text: "text-gray-500", label: "Ditolak" },
};

export default function ContentRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ContentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("content_requests")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) setRequests(data as ContentRequest[]);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === "all"
    ? requests
    : requests.filter((r) => r.status === filter);

  const counts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    in_progress: requests.filter((r) => r.status === "in_progress").length,
    published: requests.filter((r) => r.status === "published").length,
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    if (!supabase) return;
    await supabase.from("content_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-1.5 -ml-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-gray-900">Dashboard Redaksi</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">📋 Request Konten</h2>
            <p className="text-xs text-gray-500 mt-1">
              Permintaan artikel dari Journey Engine — berdasarkan aktivitas user
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="w-3.5 h-3.5" />
            <span>Redaksi</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: "Semua", count: counts.all, color: "bg-gray-800" },
            { label: "Pending", count: counts.pending, color: "bg-red-500" },
            { label: "Dikerjakan", count: counts.in_progress, color: "bg-amber-500" },
            { label: "Terbit", count: counts.published, color: "bg-emerald-500" },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => setFilter(s.label.toLowerCase())}
              className={`p-3 rounded-xl border ${
                filter === s.label.toLowerCase()
                  ? "border-gray-800 bg-white"
                  : "border-gray-200 bg-white hover:border-gray-300"
              } text-left transition-colors`}
            >
              <div className={`w-2 h-2 rounded-full ${s.color} mb-2`} />
              <p className="text-xl font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm">Memuat...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            Tidak ada request konten
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((req) => {
              const st = STATUS_STYLES[req.status] || STATUS_STYLES.pending;
              return (
                <div key={req.id} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`${st.bg} ${st.text} text-xs`}>{st.label}</Badge>
                        {req.request_count > 1 && (
                          <span className="text-xs text-gray-400">
                            ×{req.request_count} diminta
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">{req.topic}</h3>
                      {req.activity_title && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Dari aktivitas: {req.activity_title}
                        </p>
                      )}
                      {req.keywords && req.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {req.keywords.map((kw) => (
                            <span key={kw} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(req.created_at).toLocaleDateString("id-ID")}
                        {req.journey_template_slug && ` · ${req.journey_template_slug}`}
                      </p>
                    </div>

                    {req.status === "pending" && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStatusUpdate(req.id, "in_progress")}
                          className="px-3 py-1.5 bg-[#084463] text-white rounded-lg text-xs font-medium hover:bg-[#084463]/90 transition-colors"
                        >
                          Ambil
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(req.id, "rejected")}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                        >
                          Tolak
                        </button>
                      </div>
                    )}
                    {req.status === "in_progress" && (
                      <button
                        onClick={() => handleStatusUpdate(req.id, "published")}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1 shrink-0"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Terbitkan
                      </button>
                    )}
                    {req.status === "published" && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Selesai
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
