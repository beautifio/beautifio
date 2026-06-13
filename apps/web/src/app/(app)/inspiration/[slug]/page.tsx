"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@beautifio/ui";
import {
  getInspirationBySlug, getAllInspiration, DREAM_MAP,
} from "@/lib/inspiration-data";

export default function InspirationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const item = getInspirationBySlug(slug);
  const allItems = getAllInspiration();

  const related = useMemo(() => {
    if (!item) return [];
    return allItems
      .filter((i) => i.id !== item.id && (
        i.dreamSlugs.some((s) => item.dreamSlugs.includes(s)) ||
        i.tags.some((t) => item.tags.includes(t))
      ))
      .slice(0, 3);
  }, [item]);

  if (!item) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center px-5">
          <BookOpen size={32} className="mx-auto text-text-secondary/30 mb-3" />
          <p className="text-sm font-semibold text-text-primary">Inspirasi tidak ditemukan</p>
          <Link href="/inspiration" className="text-xs text-primary font-medium hover:underline mt-2 inline-block">
            Kembali ke Inspirasi
          </Link>
        </div>
      </div>
    );
  }

  const dreamInfo = item.dreamSlugs.map((s) => DREAM_MAP[s]).filter(Boolean);

  return (
    <div className="min-h-screen bg-bg pb-24">
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${item.coverGradient} px-5 pt-6 pb-8 text-white`}>
        <button
          onClick={() => router.push("/inspiration")}
          className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all mb-4 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="default" className="bg-white/20 text-white border-0 text-[10px]">
            {item.type === "story" ? "📖 Cerita" : "📝 Artikel"}
          </Badge>
          <span className="text-[10px] text-white/70 flex items-center gap-1">
            <Clock size={10} /> {item.readingTime} menit
          </span>
        </div>

        <h1 className="text-lg font-bold leading-snug">{item.title}</h1>
        <p className="text-sm text-white/80 mt-2 leading-relaxed">{item.excerpt}</p>

        {dreamInfo.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {dreamInfo.map((d, i) => (
              <span key={i} className="text-xs text-white/70">{d.emoji} {d.title}</span>
            ))}
          </div>
        )}
      </div>

      {/* Author & Meta */}
      <div className="bg-surface border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-sm font-semibold text-accent">
            {item.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{item.author}</p>
            <p className="text-[11px] text-text-secondary">{item.publishedAt}</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-border">
          {item.tags.map((tag, i) => (
            <Badge key={i} variant="accent" className="text-[10px]">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-5 py-5">
        <div className="text-text-primary leading-relaxed space-y-3">
          {item.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              const text = paragraph.replace(/\*\*/g, "");
              return (
                <h3 key={i} className="text-sm font-bold text-text-primary mt-5 mb-2">{text}</h3>
              );
            }
            if (paragraph.startsWith("- ")) {
              const items = paragraph.split("\n").map((line) => line.replace("- ", ""));
              return (
                <ul key={i} className="list-disc list-inside text-xs text-text-secondary space-y-1 my-2">
                  {items.map((li, j) => (
                    <li key={j}>{li.replace(/\*\*/g, "")}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-xs text-text-secondary my-2 leading-relaxed">
                {paragraph.split("\n").map((line, j) => (
                  <span key={j}>
                    {line.includes("**") ? (
                      line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={k} className="font-bold text-text-primary">{part.slice(2, -2)}</strong>
                          : part
                      )
                    ) : line}
                    {j < paragraph.split("\n").length - 1 && <br />}
                  </span>
                ))}
              </p>
            );
          })}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="px-5 py-6 border-t border-border">
          <h3 className="text-sm font-bold text-text-primary mb-3">Inspirasi Terkait</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <div
                key={r.id}
                className="bg-surface rounded-xl border border-border overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/inspiration/${r.slug}`)}
              >
                <div className={`aspect-[16/6] bg-gradient-to-r ${r.coverGradient} flex items-center px-4`}>
                  <span className="text-lg">{r.type === "story" ? "📖" : "📝"}</span>
                  <span className="text-white text-xs font-medium ml-2">{r.title}</span>
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-text-secondary">{r.readingTime} menit baca</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
