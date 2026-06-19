"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, BookOpen, PenLine, Quote, BookHeart } from "lucide-react";
import { SOURCE_TABS } from "@/lib/inspirasi-data";
import type { SourceType, InspirasiItem } from "@/lib/inspirasi-data";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getPendingJourneyArticleIds } from "@/lib/article-queries";
import InspirasiCard from "@/components/inspirasi/InspirasiCard";

const TAB_ICONS: Record<string, typeof Sparkles> = {
  Sparkles, BookOpen, BookHeart, Quote,
};

function SourceBar({
  active,
  onChange,
}: {
  active: SourceType;
  onChange: (t: SourceType) => void;
}) {
  return (
    <div className="flex overflow-x-auto gap-2 px-4 py-3">
      {SOURCE_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.icon]!;
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}



function EmptyState({
  icon: Icon,
  message,
}: {
  icon: typeof Sparkles;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Icon className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-gray-500 text-center">{message}</p>
    </div>
  );
}

async function fetchArticles(): Promise<InspirasiItem[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (!data) return [];

  return data.map((a) => ({
    id: a.id,
    slug: a.slug,
    type: a.type,
    source: a.source || "cerita",
    title: a.title,
    content: a.excerpt || "",
    full_content: a.content,
    author: a.author,
    initials: a.initials,
    cover_image: a.cover_image,
    category: a.category,
    reading_time: a.read_time_minutes,
    like_count: a.like_count,
    comment_count: a.comment_count,
    save_count: a.save_count,
    related_slugs: a.related_slugs || [],
  }));
}

export default function InspirasiPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SourceType>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [suggestedIds, setSuggestedIds] = useState<Set<string>>(new Set());
  const [dbItems, setDbItems] = useState<InspirasiItem[]>([]);

  useEffect(() => {
    fetchArticles().then(setDbItems);
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const ids = await getPendingJourneyArticleIds(user.id);
        setSuggestedIds(new Set(ids));
      } catch {
        // silent
      }
    })();
  }, [user]);

  const allItems = useMemo(() => dbItems, [dbItems]);

  const categories = useMemo(() => {
    const items = activeTab === "all" ? allItems : allItems.filter((item) => (item.source || "cerita") === activeTab);
    const cats = new Set(items.map((item) => item.category));
    return Array.from(cats).sort();
  }, [activeTab, allItems]);

  const filteredItems = useMemo(() => {
    let items = activeTab === "all"
      ? allItems
      : allItems.filter((item) => (item.source || "cerita") === activeTab);
    if (categoryFilter) {
      items = items.filter((item) => item.category === categoryFilter);
    }
    return items;
  }, [activeTab, categoryFilter, allItems]);

  const activeTabInfo = SOURCE_TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between px-4 pt-4 pb-1">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Inspirasi
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Temukan cerita dan bagikan pengalamanmu
              </p>
            </div>
            <Link
              href="/inspirasi/post"
              className="text-xs text-[#084463] font-medium hover:underline shrink-0"
            >
              Bagikan ceritamu &rarr;
            </Link>
          </div>
          <SourceBar active={activeTab} onChange={(t) => { setActiveTab(t); setCategoryFilter(""); }} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-3">
        <div className="flex overflow-x-auto gap-2 pb-1">
          <button
            onClick={() => setCategoryFilter("")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              !categoryFilter
                ? "bg-gray-800 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-4">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={TAB_ICONS[activeTabInfo.icon]!}
            message={activeTab === "redaksi" ? "Belum ada tulisan dari Redaksi" : `Tidak ada ${activeTabInfo.label.toLowerCase()} yang ditemukan`}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredItems.map((item) => (
              <InspirasiCard key={item.id} item={item} isSuggested={suggestedIds.has(item.id)} userId={user?.id} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/curhat/post"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#084463] text-white shadow-lg hover:bg-[#084463]/90 active:scale-95 transition-all flex items-center justify-center"
      >
        <PenLine size={22} />
      </Link>

    </div>
  );
}
