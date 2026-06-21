"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { DreamJourney } from "@beautifio/types";

interface Article {
  id: string;
  slug: string;
  title: string;
  cover_image?: string;
  category?: string;
  author?: string;
}

const SOURCE_LABEL: Record<string, string> = {
  cerita: "Cerita",
  mentor: "Mentor",
  redaksi: "Redaksi",
}

export function ArticlePick({ journey }: { journey?: DreamJourney | null }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { supabase } = await import("@/lib/supabase/client");
        if (!supabase) return;

        if (journey) {
          try {
            const { data: matched } = await supabase
              .rpc("get_pending_journey_article_ids", { p_journey_id: journey.id });

            if (matched && matched.length > 0) {
              const { data: personal } = await supabase
                .from("articles")
                .select("id, slug, title, cover_image, category, author")
                .in("id", matched.slice(0, 10))
                .eq("is_published", true);
              if (personal && personal.length > 0) {
                setArticles(personal);
                return;
              }
            }
          } catch (e) {
            console.error("ArticlePick: RPC failed", e);
          }
        }

        const { data } = await supabase
          .from("articles")
          .select("id, slug, title, cover_image, category, author")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(10);
        if (data) setArticles(data);
      } catch (e) {
        console.error("ArticlePick: fetch failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [journey]);

  if (loading) {
    return (
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-3">Kembangkan Wawasanmu</h2>
        <div className="space-y-3">
          {[1,2,3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-24 h-24 rounded-xl bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-bold text-gray-900 mb-3">Kembangkan Wawasanmu</h2>
      <div className="divide-y divide-gray-100">
        {articles.map((a) => {
          const initials = a.author?.charAt(0) || "?"
          const source = a.category || "cerita"
          return (
            <Link
              key={a.id}
              href={`/inspirasi/${a.slug}`}
              className="flex gap-3 py-3 hover:bg-gray-50 transition-colors -mx-3 px-3 rounded-lg"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                {a.cover_image ? (
                  <img
                    src={a.cover_image}
                    alt={a.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div>
                  <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">
                    {SOURCE_LABEL[source] || source}
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mt-0.5">
                    {a.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-purple-100 flex items-center justify-center text-[7px] font-bold text-purple-700 shrink-0">
                    {initials}
                  </div>
                  <span className="text-[11px] text-gray-500 truncate">{a.author}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  );
}
