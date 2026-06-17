"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PenLine, Shield, Clock, MessageSquare,
} from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { PostingMode, ModerationStatus } from "@/lib/inspirasi-data";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface CurhatItem {
  id: string;
  title: string;
  content: string;
  category: string;
  nickname: string;
  support_count: number;
  created_at: string;
  response_mode: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "baru saja";
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} jam lalu`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} hari lalu`;
  return new Date(dateStr).toLocaleDateString("id-ID");
}

function CurhatCard({ item, userId }: { item: CurhatItem; userId?: string | null }) {
  const router = useRouter();
  const [supportType, setSupportType] = useState<string | null>(null);
  const [supportCount, setSupportCount] = useState(item.support_count || 0);
  const [supressing, setSuppressing] = useState(false);

  const initials = (item.nickname || "Anonymous").slice(0, 2).toUpperCase();
  const displayName = item.nickname || "Anonymous";

  const handleSupport = async (e: React.MouseEvent, type: string) => {
    e.stopPropagation();
    if (!userId || supportType || supressing || !supabase) return;
    setSuppressing(true);
    try {
      await supabase
        .from("curhat_support")
        .insert({ curhat_id: item.id, user_id: userId, support_type: type });
      await supabase.rpc("increment_support_count", { p_curhat_id: item.id });
      setSupportType(type);
      setSupportCount((c) => c + 1);
    } catch {
      // already supported
    } finally {
      setSuppressing(false);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/curhat/${item.id}`)}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-purple-100 text-purple-700 text-xs">
            {item.category}
          </Badge>
          <span className="text-xs text-gray-400">{timeAgo(item.created_at)}</span>
          {item.response_mode === "polling" && (
            <Badge className="bg-blue-100 text-blue-700 text-xs">📊 Polling</Badge>
          )}
        </div>

        {item.title && (
          <h3 className="font-semibold text-gray-900 mb-1.5">{item.title}</h3>
        )}

        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {item.content}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-xs font-semibold text-purple-700">
            {initials}
          </div>
          <span className="text-sm text-gray-500">{displayName}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            {[
              { type: "hug", label: "🤗", text: "Peluk" },
              { type: "relate", label: "🙋", text: "Aku juga" },
              { type: "strength", label: "💪", text: "Semangat" },
            ].map((s) => (
              <button
                key={s.type}
                onClick={(e) => handleSupport(e, s.type)}
                disabled={!userId || !!supportType}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  supportType === s.type
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-500 hover:bg-gray-100"
                } disabled:opacity-50`}
              >
                <span>{s.label}</span>
                <span>{s.text}</span>
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-1">{supportCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
        <MessageSquare className="w-8 h-8 text-purple-400" />
      </div>
      <p className="text-gray-500 text-center">
        Belum ada curhat. Jadilah yang pertama!
      </p>
    </div>
  );
}

export default function CurhatPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<CurhatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("curhat_posts")
        .select("id, title, nickname, content, category, support_count, created_at, response_mode")
        .eq("status", "visible")
        .order("created_at", { ascending: false })
        .limit(50);
      if (data) setItems(data as CurhatItem[]);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">Curhat</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Bagikan cerita dan dukung sesama
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((item) => (
            <CurhatCard key={item.id} item={item} userId={user?.id} />
          ))
        )}
      </div>

      <Link
        href="/curhat/post"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#084463] text-white shadow-lg hover:bg-[#084463]/90 active:scale-95 transition-all flex items-center justify-center"
      >
        <PenLine size={22} />
      </Link>
    </div>
  );
}
