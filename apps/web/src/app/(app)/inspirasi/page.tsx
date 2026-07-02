"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, BookOpen, PenLine, Quote, BookHeart, Heart, TrendingUp, Users, Feather, Monitor, Clapperboard } from "lucide-react";
import { SOURCE_TABS, CATEGORY_LABELS } from "@/lib/inspirasi-data";
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
    <div className="flex overflow-x-auto gap-2 px-4 py-3 border-b border-border">
      {SOURCE_TABS.map((tab) => {
        const Icon = TAB_ICONS[tab.icon]!;
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap transition-all relative cursor-pointer ${
              isActive ? "text-primary" : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full"
                style={{ background: '#FFC64F' }}
              />
            )}
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
    category_id: a.category_id,
    category_label: a.category_id ? CATEGORY_LABELS[a.category_id] || a.category : a.category,
    reading_time: a.read_time_minutes,
    like_count: a.like_count,
    comment_count: a.comment_count,
    save_count: a.save_count,
    related_slugs: a.related_slugs || [],
    author_type: a.author_type,
    architecture: a.architecture,
    author_credentials: a.author_credentials,
    author_anon_name: a.author_anon_name,
    series_id: a.series_id,
    disclaimer_type: a.disclaimer_type,
    disclaimer_custom: a.disclaimer_custom,
    meta_title: a.meta_title,
    meta_description: a.meta_description,
    og_image: a.og_image,
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

  const CATEGORY_ICONS: Record<string, typeof Heart> = {
    "lifetaintment": Clapperboard,
    "mind-body": Heart,
    "glow-glowup": Sparkles,
    "levelup-career": TrendingUp,
    "relationship": Users,
    "creative-space": Feather,
    "tech-gaming": Monitor,
  };

  const categories = useMemo(() => {
    const items = activeTab === "all" ? allItems : allItems.filter((item) => (item.source || "cerita") === activeTab);
    const seen = new Set<string>();
    const result: { id: string; label: string }[] = [];
    items.forEach((item) => {
      const id = item.category_id || item.category;
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push({ id, label: item.category_label || item.category });
      }
    });
    return result;
  }, [activeTab, allItems]);

  const filteredItems = useMemo(() => {
    let items = activeTab === "all"
      ? allItems
      : allItems.filter((item) => (item.source || "cerita") === activeTab);
    if (categoryFilter) {
      items = items.filter((item) => (item.category_id || item.category) === categoryFilter);
    }
    return items;
  }, [activeTab, categoryFilter, allItems]);

  const activeTabInfo = SOURCE_TABS.find((t) => t.key === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b border-gray-200">
         <div className="max-w-content mx-auto">
           <div className="flex items-center justify-between px-4 pt-4 pb-1">
              <h1 className="text-xl font-bold text-gray-900">Inspirasi</h1>
          </div>
          <SourceBar active={activeTab} onChange={(t) => { setActiveTab(t); setCategoryFilter(""); }} />
        </div>
      </div>

      <div className="max-w-content mx-auto px-5 py-3">
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
          {categories.map((cat) => {
            const CatIcon = CATEGORY_ICONS[cat.id];
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === cat.id
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {CatIcon && <CatIcon className="w-3 h-3" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-content mx-auto px-5 pb-4">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={TAB_ICONS[activeTabInfo.icon]!}
            message={activeTab === "redaksi" ? "Belum ada tulisan dari Redaksi" : `Tidak ada ${activeTabInfo.label.toLowerCase()} yang ditemukan`}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {filteredItems.map((item) => (
              <InspirasiCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
