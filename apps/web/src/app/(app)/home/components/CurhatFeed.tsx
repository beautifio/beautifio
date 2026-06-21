"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

interface CurhatPost {
  id: string;
  content: string;
  support_count: number;
}

export function CurhatFeed() {
  const [posts, setPosts] = useState<CurhatPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { supabase } = await import("@/lib/supabase/client");
        if (!supabase) return;
        const { data } = await supabase
          .from("curhat_posts")
          .select("id, content, support_count")
          .eq("status", "visible")
          .order("created_at", { ascending: false })
          .limit(2);
        if (data) setPosts(data);
      } catch (e) {
        console.error("CurhatFeed: fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Curhat Terbaru</h2>
        </div>
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse h-16 rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-3">Curhat Terbaru</h2>
      <div className="space-y-2">
        {posts.map((p) => (
          <div
            key={p.id}
            className="block p-3 rounded-xl bg-gray-50 border border-gray-100"
          >
            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed mb-2">
              &ldquo;{p.content}&rdquo;
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Heart size={12} /> {p.support_count ?? 0}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
