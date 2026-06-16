"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getAllDreamTemplates, getJmEcosystemByTemplateSlug } from "@beautifio/utils";

const CATEGORY_LABELS: Record<string, string> = {
  sports: "Sports",
  creative: "Creative",
  business: "Business",
  health: "Health",
  tech: "Tech",
};

const FILTER_OPTIONS = ["Semua", ...Object.values(CATEGORY_LABELS)] as const;
type FilterKey = (typeof FILTER_OPTIONS)[number];

function categoryMatches(category: string, filter: FilterKey): boolean {
  if (filter === "Semua") return true;
  return CATEGORY_LABELS[category] === filter;
}

export default function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ mimpi?: string }>;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [templates] = useState(getAllDreamTemplates());
  const [activeFilter, setActiveFilter] = useState<FilterKey>("Semua");

  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  if (user) return null;

  const filtered = templates.filter((t) => categoryMatches(t.category, activeFilter));

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-8 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Pilih Mimpimu
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Temukan perjalanan yang paling cocok untukmu
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:underline shrink-0"
          >
            Masuk
          </Link>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeFilter === f
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted text-text-secondary hover:text-text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((t) => {
            const ecosystem = getJmEcosystemByTemplateSlug(t.slug);
            return (
              <Link
                key={t.slug}
                href={`/mimpi/${t.slug}`}
                className="bg-surface rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-sm transition-all block"
              >
                <span className="text-3xl block mb-2">{t.emoji}</span>
                <h3 className="text-sm font-bold text-text-primary leading-tight">{t.title}</h3>
                <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-text-secondary capitalize">
                    {t.category}
                  </span>
                  <span className="text-[10px] text-text-secondary">{t.duration}</span>
                </div>
                {ecosystem && (
                  <p className="text-[10px] text-accent mt-2 leading-tight">
                    <Compass size={10} className="inline mr-0.5 -mt-0.5" />
                    {ecosystem.pivotPoint}
                  </p>
                )}
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-text-secondary py-12">
            Tidak ada mimpi di kategori ini
          </p>
        )}
      </div>
    </div>
  );
}
