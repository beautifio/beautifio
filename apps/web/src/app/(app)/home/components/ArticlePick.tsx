"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { DreamJourney } from "@beautifio/types";

interface Article {
  id: string;
  slug: string;
  title: string;
  cover_image?: string;
  category?: string;
  author?: string;
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

        let query = supabase
          .from("articles")
          .select("id, slug, title, cover_image, category, author")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(3);

        if (journey) {
          try {
            const { data: matched } = await supabase
              .rpc("get_pending_journey_article_ids", { p_journey_id: journey.id });

            if (matched && matched.length > 0) {
              const { data: personal } = await supabase
                .from("articles")
                .select("id, slug, title, cover_image, category, author")
                .in("id", matched.slice(0, 3))
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

        const { data } = await query;
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-900">Kembangkan Wawasanmu</h2>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] rounded-xl bg-gray-100 mb-1.5" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">Kembangkan Wawasanmu</h2>
        <Link
          href="/inspirasi"
          className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-1"
        >
          Baca Selengkapnya <ArrowRight size={12} />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {articles.map((a) => (
          <Link
            key={a.id}
            href={`/inspirasi/${a.slug}`}
            className="group block"
          >
            <div className="aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden mb-1.5 relative">
              {a.cover_image ? (
                <Image
                  src={a.cover_image}
                  alt={a.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 33vw, 200px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-2xl">
                  📖
                </div>
              )}
            </div>
            <h3 className="text-xs font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors">
              {a.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
