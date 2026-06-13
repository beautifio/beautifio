"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center px-5">
          <BookOpen size={32} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-semibold text-gray-700">Inspirasi tidak ditemukan</p>
          <Link href="/inspiration" className="text-xs text-purple-600 font-medium hover:underline mt-2 inline-block">
            Kembali ke Inspirasi
          </Link>
        </div>
      </div>
    );
  }

  const dreamInfo = item.dreamSlugs.map((s) => DREAM_MAP[s]).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className={`relative bg-gradient-to-br ${item.coverGradient} px-5 pt-6 pb-8 text-white`}>
        <button
          onClick={() => router.push("/inspiration")}
          className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all mb-4 cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-medium">
            {item.type === "story" ? "📖 Cerita" : "📝 Artikel"}
          </span>
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
      <div className="bg-white border-b border-gray-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-purple-200 flex items-center justify-center text-sm font-semibold text-purple-700">
            {item.author.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.author}</p>
            <p className="text-[11px] text-gray-500">{item.publishedAt}</p>
          </div>
        </div>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-gray-200 bg-white">
          {item.tags.map((tag, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="bg-white px-5 py-5">
        <div className="text-gray-900 leading-relaxed space-y-3">
          {item.content.split("\n\n").map((paragraph, i) => {
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              const text = paragraph.replace(/\*\*/g, "");
              return (
                <h3 key={i} className="text-sm font-bold text-gray-900 mt-5 mb-2">{text}</h3>
              );
            }
            if (paragraph.startsWith("- ")) {
              const items = paragraph.split("\n").map((line) => line.replace("- ", ""));
              return (
                <ul key={i} className="list-disc list-inside text-sm text-gray-700 space-y-1 my-2">
                  {items.map((li, j) => (
                    <li key={j}>{li.replace(/\*\*/g, "")}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={i} className="text-sm text-gray-700 my-2 leading-relaxed">
                {paragraph.split("\n").map((line, j) => (
                  <span key={j}>
                    {line.includes("**") ? (
                      line.split(/(\*\*.*?\*\*)/).map((part, k) =>
                        part.startsWith("**") && part.endsWith("**")
                          ? <strong key={k} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
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
        <div className="px-5 py-6">
          <h3 className="text-sm font-bold text-gray-900 mb-3">Inspirasi Terkait</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/inspiration/${r.slug}`)}
              >
                <div className={`aspect-[16/6] bg-gradient-to-r ${r.coverGradient} flex items-center px-4`}>
                  <span className="text-lg">{r.type === "story" ? "📖" : "📝"}</span>
                  <span className="text-white text-xs font-medium ml-2">{r.title}</span>
                </div>
                <div className="p-3">
                  <p className="text-[10px] text-gray-500">{r.readingTime} menit baca</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
