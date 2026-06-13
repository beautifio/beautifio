"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, Sparkles, BookOpen } from "lucide-react";
import {
  getAllInspiration, getInspirationGrouped, getInspirationForDream,
  searchInspiration, DREAM_MAP,
} from "@/lib/inspiration-data";
import type { InspirationItem } from "@/lib/inspiration-data";

const TABS = [
  { key: "for-you", label: "Untukmu", icon: Sparkles },
  { key: "stories", label: "Cerita", icon: BookOpen },
  { key: "articles", label: "Artikel", icon: BookOpen },
];

const DREAM_SLUGS = Object.keys(DREAM_MAP);

function InspirationCard({ item }: { item: InspirationItem }) {
  const router = useRouter();
  const dreamInfo = item.dreamSlugs.length > 0
    ? item.dreamSlugs.map((s) => DREAM_MAP[s]).filter(Boolean)
    : null;

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => router.push(`/inspiration/${item.slug}`)}
    >
      <div className={`aspect-[16/9] relative bg-gradient-to-br ${item.coverGradient} flex items-center justify-center`}>
        <span className="text-5xl">{item.type === "story" ? "📖" : "📝"}</span>
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-medium">
          {item.type === "story" ? "Cerita" : "Artikel"}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Clock size={12} />
          <span>{item.readingTime} menit baca</span>
          {dreamInfo && dreamInfo.length > 0 && (
            <>
              <span className="text-gray-300">|</span>
              {dreamInfo.slice(0, 1).map((d, i) => (
                <span key={i}>{d?.emoji} {d?.title}</span>
              ))}
            </>
          )}
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 leading-snug text-sm">
          {item.title}
        </h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
          {item.excerpt}
        </p>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-[10px] font-semibold text-purple-700">
            {item.author.charAt(0)}
          </div>
          <span className="text-xs text-gray-700">{item.author}</span>
        </div>
      </div>
    </div>
  );
}

export default function InspirationPage() {
  const [activeTab, setActiveTab] = useState("for-you");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDream, setSelectedDream] = useState<string | null>(null);

  const all = getAllInspiration();
  const { stories, articles } = getInspirationGrouped();

  const forYou = useMemo(() => {
    let items = all;
    if (selectedDream) items = getInspirationForDream(selectedDream);
    if (searchQuery) items = searchInspiration(searchQuery);
    return items;
  }, [selectedDream, searchQuery]);

  const filteredStories = useMemo(() => {
    if (!searchQuery) return stories;
    return searchInspiration(searchQuery).filter((i) => i.type === "story");
  }, [searchQuery, stories]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    return searchInspiration(searchQuery).filter((i) => i.type === "article");
  }, [searchQuery, articles]);

  const currentItems = activeTab === "for-you" ? forYou : activeTab === "stories" ? filteredStories : filteredArticles;
  const activeTabInfo = TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-content mx-auto">
          <div className="flex items-center justify-between px-5 pt-6 pb-1">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Inspirasi</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Belajar dan dapatkan perspektif baru untuk mimpimu
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto gap-2 px-5 py-3">
            {TABS.map((tab) => {
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="max-w-content mx-auto px-5 pt-4 pb-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari inspirasi..."
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-white border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {activeTab === "for-you" && !searchQuery && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedDream(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                !selectedDream
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
              }`}
            >
              Semua
            </button>
            {DREAM_SLUGS.map((slug) => {
              const dream = DREAM_MAP[slug];
              return (
                <button
                  key={slug}
                  onClick={() => setSelectedDream(slug === selectedDream ? null : slug)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                    selectedDream === slug
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                  }`}
                >
                  {dream.emoji} {dream.title}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Content Grid */}
      <div className="max-w-content mx-auto px-5 pb-4">
        {currentItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Sparkles size={32} className="text-gray-300 mb-3" />
            <p className="text-sm font-semibold text-gray-700">Belum ada inspirasi</p>
            <p className="text-xs text-gray-500 mt-1">Coba pilih impian lain atau ubah kata kunci</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentItems.map((item) => (
              <InspirationCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
