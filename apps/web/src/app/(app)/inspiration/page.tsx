"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, BookOpen, User, Sparkles, Clock, ArrowRight } from "lucide-react";
import { Badge, Card, Tabs, TabsList, TabsTrigger, TabsContent } from "@beautifio/ui";
import {
  getAllInspiration, getInspirationGrouped, getInspirationForDream,
  searchInspiration, DREAM_MAP,
} from "@/lib/inspiration-data";
import type { InspirationItem } from "@/lib/inspiration-data";

const DREAM_SLUGS = Object.keys(DREAM_MAP);

function InspirationCard({ item }: { item: InspirationItem }) {
  const dreamInfo = item.dreamSlugs.length > 0
    ? item.dreamSlugs.map((s) => DREAM_MAP[s]).filter(Boolean)
    : null;

  return (
    <Link href={`/inspiration/${item.slug}`} className="block group">
      <Card className="overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
        <div className={`bg-gradient-to-r ${item.coverGradient} px-5 pt-5 pb-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none bg-white/20 text-white border-white/20">
              {item.type === "story" ? "📖 Cerita" : "📝 Artikel"}
            </Badge>
            <span className="text-[10px] text-white/70">{item.readingTime} menit</span>
          </div>
          <h3 className="text-sm font-bold text-white group-hover:underline line-clamp-2">{item.title}</h3>
          <p className="text-[11px] text-white/70 mt-1 line-clamp-2 leading-relaxed">{item.excerpt}</p>
        </div>
        <div className="px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-text-secondary">
            <User size={10} />
            <span>{item.author}</span>
          </div>
          {dreamInfo && dreamInfo.length > 0 && (
            <div className="flex items-center gap-1">
              {dreamInfo.slice(0, 2).map((d, i) => (
                <span key={i} className="text-[10px]">{d?.emoji} {d?.title}</span>
              ))}
            </div>
          )}
          <ArrowRight size={14} className="text-text-secondary group-hover:text-primary transition-colors" />
        </div>
      </Card>
    </Link>
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
    if (selectedDream) {
      items = getInspirationForDream(selectedDream);
    }
    if (searchQuery) {
      items = searchInspiration(searchQuery);
    }
    return items;
  }, [selectedDream, searchQuery]);

  const filteredStories = useMemo(() => {
    if (!searchQuery) return stories;
    return searchInspiration(searchQuery).filter((i) => i.type === "story");
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    return searchInspiration(searchQuery).filter((i) => i.type === "article");
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-text-primary">Inspirasi</h1>
          <p className="text-sm text-text-secondary mt-1">
            Belajar dan dapatkan perspektif baru untuk mimpimu.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari inspirasi..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-surface border border-border text-sm text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Dream Filter */}
        {activeTab === "for-you" && !searchQuery && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
            <button
              onClick={() => setSelectedDream(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                !selectedDream
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-text-secondary border-border hover:border-primary/30"
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
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface text-text-secondary border-border hover:border-primary/30"
                  }`}
                >
                  {dream.emoji} {dream.title}
                </button>
              );
            })}
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="for-you" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="for-you">Untukmu</TabsTrigger>
            <TabsTrigger value="stories">Cerita</TabsTrigger>
            <TabsTrigger value="articles">Artikel</TabsTrigger>
          </TabsList>

          <TabsContent value="for-you" className="space-y-3">
            {forYou.length > 0 ? (
              forYou.map((item) => <InspirationCard key={item.id} item={item} />)
            ) : (
              <div className="text-center py-12">
                <Sparkles size={28} className="mx-auto text-text-secondary/30 mb-3" />
                <p className="text-sm font-semibold text-text-primary">Belum ada inspirasi</p>
                <p className="text-xs text-text-secondary mt-1">Coba pilih impian lain atau ubah kata kunci</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stories" className="space-y-3">
            {filteredStories.length > 0 ? (
              filteredStories.map((item) => <InspirationCard key={item.id} item={item} />)
            ) : (
              <div className="text-center py-12">
                <BookOpen size={28} className="mx-auto text-text-secondary/30 mb-3" />
                <p className="text-sm font-semibold text-text-primary">Belum ada cerita</p>
                <p className="text-xs text-text-secondary mt-1">Coba cari dengan kata kunci lain</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="articles" className="space-y-3">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((item) => <InspirationCard key={item.id} item={item} />)
            ) : (
              <div className="text-center py-12">
                <BookOpen size={28} className="mx-auto text-text-secondary/30 mb-3" />
                <p className="text-sm font-semibold text-text-primary">Belum ada artikel</p>
                <p className="text-xs text-text-secondary mt-1">Coba cari dengan kata kunci lain</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
