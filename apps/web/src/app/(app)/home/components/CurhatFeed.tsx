"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, MessageCircle } from "lucide-react";

interface CurhatPost {
  id: string;
  content: string;
  support_count: number;
  comment_count: number;
}

export function CurhatFeed() {
  const [posts, setPosts] = useState<CurhatPost[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const { supabase } = await import("@/lib/supabase/client");
        if (!supabase) return;
        const { data } = await supabase
          .from("curhat_posts")
          .select("id, content, support_count, comment_count")
          .eq("status", "visible")
          .order("created_at", { ascending: false })
          .limit(2);
        if (data) setPosts(data);
      } catch {}
    })();
  }, []);

  if (posts.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Curhat Terbaru</h2>
        <Link
          href="/curhat"
          className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          Lihat Semua <ArrowRight size={12} />
        </Link>
      </div>
      <div className="space-y-2">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/curhat/${p.id}`}
            className="block p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-amber-50/50 hover:border-amber-100 transition-all"
          >
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed mb-2">
              &ldquo;{p.content}&rdquo;
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Heart size={12} /> {p.support_count ?? 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} /> {p.comment_count ?? 0}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
