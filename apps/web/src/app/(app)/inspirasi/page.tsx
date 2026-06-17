"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookHeart, Clock, Heart, MessageSquare, Flag,
  Sparkles, BookOpen, PenLine, Quote,
  Bookmark, Share2, MapPin,
} from "lucide-react";
import { Badge } from "@beautifio/ui";
import { SOURCE_TABS } from "@/lib/inspirasi-data";
import type { SourceType, InspirasiItem } from "@/lib/inspirasi-data";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { getPendingJourneyArticleIds } from "@/lib/article-queries";

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

const SOURCE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  cerita: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Cerita" },
  mentor: { bg: "bg-purple-100", text: "text-purple-700", label: "Mentor" },
  redaksi: { bg: "bg-blue-100", text: "text-blue-700", label: "Redaksi" },
};

function InspirasiCard({ item, isSuggested, userId }: { item: InspirasiItem; isSuggested?: boolean; userId?: string | null }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item.like_count);
  const [saveCount, setSaveCount] = useState(item.save_count);

  const source = item.source || "cerita";
  const badge = SOURCE_BADGE[source] || SOURCE_BADGE.cerita;

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved((prev) => {
      setSaveCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  const handleShare = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const url = `${window.location.origin}/inspirasi/${item.slug}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: item.title, text: item.content, url });
        } catch {
          // user cancelled share
        }
      } else {
        await navigator.clipboard.writeText(url);
      }
    },
    [item],
  );

  const handleReport = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Laporan telah dikirim. Terima kasih atas partisipasi Anda.");
  }, []);

  const handleCardClick = useCallback(() => {
    router.push(`/inspirasi/${item.slug}`);
  }, [router, item.slug]);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      {item.cover_image ? (
        <div className="aspect-[16/9] relative overflow-hidden">
          <img
            src={item.cover_image}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <Badge className={`absolute top-2 left-2 ${badge.bg} ${badge.text} text-xs font-semibold`}>
            {badge.label}
          </Badge>
        </div>
      ) : (
        <div className="aspect-[16/9] relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <BookOpen className="w-12 h-12 text-purple-300" />
          <Badge className={`absolute top-2 left-2 ${badge.bg} ${badge.text} text-xs font-semibold`}>
            {badge.label}
          </Badge>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{item.reading_time} menit baca</span>
          <span className="text-gray-300">|</span>
          <span>{item.category}</span>
        </div>
        {isSuggested && (
          <div className="flex items-center gap-1 text-[11px] font-medium mb-2" style={{ color: "#D94040" }}>
            <MapPin className="w-3 h-3" />
            <span>Disarankan di journey-mu</span>
          </div>
        )}

        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
          {item.title}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.content}
        </p>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-xs font-semibold text-purple-700">
            {item.initials || item.author.charAt(0)}
          </div>
          <span className="text-sm text-gray-700">{item.author}</span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
              <span>{likeCount}</span>
            </button>
            <button className="flex items-center gap-1 text-sm text-gray-500">
              <MessageSquare className="w-4 h-4" />
              <span>{item.comment_count}</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-purple-600 transition-colors"
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? "fill-purple-600 text-purple-600" : ""}`}
              />
              <span>{saveCount}</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="text-gray-400 hover:text-blue-500 transition-colors"
              title="Bagikan"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleReport}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Laporkan"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
