"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Search, Sparkles, Flame, Users, ArrowRight } from "lucide-react";
import { BottomNavigation, Badge, Button } from "@beautifio/ui";
import { ROADMAP_TEMPLATES, ROADMAP_CATEGORIES, ROADMAP_V3_SEED, INTEREST_TO_ROADMAP, INSPIRATION_TO_ROADMAP } from "@beautifio/utils";
import type { RoadmapTemplate } from "@beautifio/types";
import { RoadmapCard } from "@/features/roadmap/components/RoadmapCard";
import { NAV_TABS, navRoute } from "@/lib/navigation";

const ALL_DREAMS = [
  { slug: "football-player", label: "Pemain Sepak Bola", emoji: "⚽", color: "from-green-600 to-emerald-500", users: 2341, completionRate: 68, activeLearners: 312 },
  { slug: "doctor", label: "Dokter", emoji: "🩺", color: "from-blue-600 to-cyan-500", users: 1820, completionRate: 72, activeLearners: 245 },
  { slug: "programmer", label: "Programmer", emoji: "💻", color: "from-primary to-secondary", users: 3102, completionRate: 65, activeLearners: 543 },
  { slug: "content-creator", label: "Content Creator", emoji: "🎨", color: "from-pink-500 to-orange-400", users: 2800, completionRate: 70, activeLearners: 420 },
  { slug: "entrepreneur", label: "Entrepreneur", emoji: "💼", color: "from-amber-600 to-yellow-500", users: 1580, completionRate: 58, activeLearners: 210 },
  { slug: "musician", label: "Musisi", emoji: "🎵", color: "from-purple-600 to-pink-500", users: 1200, completionRate: 75, activeLearners: 180 },
  { slug: "runner", label: "Pelari", emoji: "🏃", color: "from-orange-500 to-red-500", users: 950, completionRate: 80, activeLearners: 140 },
  { slug: "digital-marketer", label: "Digital Marketer", emoji: "📱", color: "from-indigo-600 to-purple-500", users: 1400, completionRate: 62, activeLearners: 190 },
  { slug: "athlete", label: "Atlet", emoji: "🏅", color: "from-orange-600 to-red-500", users: 780, completionRate: 85, activeLearners: 95 },
  { slug: "beauty-creator", label: "Beauty Creator", emoji: "💄", color: "from-rose-500 to-pink-400", users: 1100, completionRate: 73, activeLearners: 160 },
  { slug: "golfer", label: "Pegolf", emoji: "⛳", color: "from-teal-600 to-green-500", users: 520, completionRate: 78, activeLearners: 65 },
];

function getDiscoveryAnswers(): { inspiration?: string; aspiration?: string; interests?: string[]; goals?: string } {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("beautifio_discovery_answers") : null;
    if (!stored) return {};
    const answers = JSON.parse(stored);
    const result: Record<string, any> = {};
    for (const a of answers) {
      if (a.questionId === "interests") result.interests = a.answers;
      else result[a.questionId] = a.answers[0];
    }
    return result as any;
  } catch { return {}; }
}

function getPersonalizedSlugs(): string[] {
  const answers = getDiscoveryAnswers();
  const slugs = new Set<string>();

  if (answers.interests) {
    for (const interest of answers.interests) {
      const mapped = INTEREST_TO_ROADMAP[interest] || [];
      mapped.forEach((s) => slugs.add(s));
    }
  }
  if (answers.inspiration) {
    const mapped = INSPIRATION_TO_ROADMAP[answers.inspiration] || [];
    mapped.forEach((s) => slugs.add(s));
  }

  const allSlugs = ROADMAP_TEMPLATES.map((t) => t.slug);
  const result = Array.from(slugs).filter((s) => allSlugs.includes(s));
  return result.slice(0, 3);
}

function getPersonalizedReason(slug: string): string {
  const interestReasons: Record<string, string> = {
    programmer: "kamu suka teknologi",
    "digital-marketer": "kamu tertarik marketing digital",
    "content-creator": "kamu senang berkarya dan kreatif",
    "beauty-creator": "kamu tertarik dengan kecantikan",
    musician: "kamu mencintai musik",
    runner: "kamu suka olahraga dan kebugaran",
    "football-player": "kamu suka olahraga tim",
    golfer: "kamu tertarik dengan golf",
    entrepreneur: "kamu memiliki jiwa bisnis",
    doctor: "kamu ingin membantu orang lain",
    athlete: "kamu memiliki semangat kompetisi",
  };
  return interestReasons[slug] || "cocok dengan minatmu";
}

export default function RoadmapListPage() {
  const [activeTab, setActiveTab] = useState("roadmap");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const discoveryAnswers = getDiscoveryAnswers();
  const hasDiscovery = discoveryAnswers.inspiration || discoveryAnswers.interests?.length;
  const personalizedSlugs = getPersonalizedSlugs();
  const trendingDreams = ALL_DREAMS.sort((a, b) => b.users - a.users).slice(0, 5);

  const filtered = useMemo(() => {
    let list = ROADMAP_TEMPLATES.map((t) => ({
      ...t,
      id: t.slug,
      total_milestones: 4,
      created_at: "2026-06-01T00:00:00Z",
    })) as RoadmapTemplate[];

    if (selectedCategory) {
      list = list.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((t) => {
        const v3 = ROADMAP_V3_SEED[t.slug];
        const dreamTitle = v3?.dream?.title?.toLowerCase() || "";
        const desc = (v3?.dream?.description || t.description).toLowerCase();
        return t.title.toLowerCase().includes(q) || dreamTitle.includes(q) || desc.includes(q);
      });
    }
    return list;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">

        {/* Section 1: Hero */}
        <div className="mb-6">
          <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10 rounded-2xl p-6 border border-primary/10">
            <h1 className="text-2xl font-bold text-text-primary">Mau Menjadi Siapa di Masa Depan?</h1>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
              Pilih impianmu.
              <br />
              Beautifio akan membantumu melangkah setahap demi setahap.
            </p>

            <div className="relative mt-4">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari impianmu..."
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Personalized Recommendations */}
        {hasDiscovery && personalizedSlugs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-accent" />
              <h2 className="text-sm font-bold text-text-primary">⭐ Direkomendasikan Untukmu</h2>
            </div>
            <div className="space-y-3">
              {personalizedSlugs.map((slug) => {
                const tmpl = ROADMAP_TEMPLATES.find((t) => t.slug === slug);
                const v3 = ROADMAP_V3_SEED[slug];
                if (!tmpl) return null;
                return (
                  <Link key={slug} href={`/roadmap/${slug}`} className="block">
                    <div className={`bg-gradient-to-r ${tmpl.color} rounded-xl p-4 hover:shadow-lg transition-shadow`}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{v3?.emoji || "📋"}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white">{v3?.dream?.title || tmpl.title}</h3>
                          <p className="text-[11px] text-white/70 mt-0.5">
                            Cocok untukmu karena {getPersonalizedReason(slug)}.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {tmpl.duration && (
                              <Badge variant="default" className="text-[9px] px-1.5 py-0 leading-none bg-white/20 text-white border-white/20">
                                {tmpl.duration}
                              </Badge>
                            )}
                            <span className="text-[9px] text-white/60 flex items-center gap-1">
                              <ArrowRight size={10} />
                              Mulai
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 3: Trending Dreams */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-orange-500" />
            <h2 className="text-sm font-bold text-text-primary">🔥 Impian Populer Minggu Ini</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {trendingDreams.map((dream) => (
              <Link key={dream.slug} href={`/roadmap/${dream.slug}`} className="block">
                <div className="p-3 rounded-xl bg-surface border border-border hover:border-primary/30 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{dream.emoji}</span>
                    <span className="text-xs font-semibold text-text-primary truncate">{dream.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[9px] text-text-secondary">
                    <span>{dream.users.toLocaleString()} orang</span>
                    <span>{dream.completionRate}%</span>
                  </div>
                  <div className="w-full h-1 bg-border rounded-full overflow-hidden mt-1.5">
                    <div className={`h-full rounded-full bg-gradient-to-r ${dream.color}`} style={{ width: `${dream.completionRate}%` }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section 4: I Don't Know Yet */}
        {!hasDiscovery && (
          <div className="mb-6">
            <div className="bg-gradient-to-r from-accent/5 to-primary/5 rounded-2xl p-5 border border-accent/20 text-center">
              <span className="text-3xl">🤔</span>
              <h3 className="text-base font-bold text-text-primary mt-2">Saya Belum Tahu Mau Jadi Apa</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto leading-relaxed">
                Tidak apa-apa. Banyak orang sukses juga memulai dari kebingungan.
              </p>
              <button
                onClick={() => router.push("/discover")}
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors cursor-pointer"
              >
                <Sparkles size={16} />
                Temukan Potensiku
              </button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-4">
          <h2 className="text-sm font-bold text-text-primary mb-3">Jelajahi Berdasarkan Kategori</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                !selectedCategory
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-text-primary"
              }`}
            >
              Semua
            </button>
            {ROADMAP_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                  selectedCategory === cat.slug
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-text-primary"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Roadmap Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filtered.length > 0 ? (
            filtered.map((template, i) => (
              <div key={template.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                <RoadmapCard template={template} />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <MapPin size={28} className="text-text-secondary/40" />
              </div>
              <p className="text-sm font-semibold text-text-primary">Tidak ada roadmap ditemukan</p>
              <p className="text-xs text-text-secondary mt-1">
                {searchQuery ? "Coba gunakan kata kunci lain" : "Coba pilih kategori lain"}
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}
