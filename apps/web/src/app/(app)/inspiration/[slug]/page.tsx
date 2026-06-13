"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, BookOpen } from "lucide-react";
import { Badge, Card } from "@beautifio/ui";
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
      .filter((i) => i.id !== item.id && (i.dreamSlugs.some((s) => item.dreamSlugs.includes(s)) || i.tags.some((t) => item.tags.includes(t))))
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
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto">
        {/* Header */}
        <div className={`bg-gradient-to-r ${item.coverGradient} px-5 pt-6 pb-8 text-white`}>
          <button
            onClick={() => router.push("/inspiration")}
            className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all mb-4 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none bg-white/20 text-white border-white/20">
              {item.type === "story" ? "📖 Cerita" : "📝 Artikel"}
            </Badge>
            <span className="text-[10px] text-white/70 flex items-center gap-1">
              <Clock size={10} /> {item.readingTime} menit
            </span>
          </div>

          <h1 className="text-lg font-bold leading-snug">{item.title}</h1>
          <p className="text-sm text-white/80 mt-2 leading-relaxed">{item.excerpt}</p>

          <div className="flex items-center gap-3 mt-3 text-xs text-white/70">
            <span className="flex items-center gap-1"><User size={12} />{item.author}</span>
            <span>{item.publishedAt}</span>
          </div>

          {dreamInfo.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {dreamInfo.map((d, i) => (
                <span key={i} className="text-xs text-white/80">{d.emoji} {d.title}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="px-5 pt-4 pb-2 flex flex-wrap gap-1.5">
          {item.tags.map((tag, i) => (
            <Badge key={i} variant="accent" className="text-[10px]">{tag}</Badge>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 py-4">
          <div className="prose prose-sm max-w-none text-text-primary leading-relaxed">
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
          <div className="px-5 py-6 border-t border-border mt-4">
            <h3 className="text-sm font-bold text-text-primary mb-3">Inspirasi Terkait</h3>
            <div className="space-y-2">
              {related.map((r) => (
                <Link key={r.id} href={`/inspiration/${r.slug}`} className="block group">
                  <Card className="p-4 hover:border-primary/30 transition-all">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">{r.type === "story" ? "📖" : "📝"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-text-primary group-hover:underline">{r.title}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">{r.readingTime} menit</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
