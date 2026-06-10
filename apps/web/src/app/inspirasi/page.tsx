"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookHeart, Clock, Heart, MessageSquare, Flag, Shield,
  Users, Sparkles, BookOpen, PenLine, Quote,
  Bookmark, Share2, Plus,
} from "lucide-react";
import { BottomNavigation, Badge } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { CONTENT_TABS, ANON_CATEGORIES, getAllItems } from "@/lib/inspirasi-data";
import type { ContentType, InspirasiItem } from "@/lib/inspirasi-data";

function ContentTypeBar({
  active,
  onChange,
}: {
  active: ContentType;
  onChange: (t: ContentType) => void;
}) {
  return (
    <div className="flex overflow-x-auto gap-2 px-4 py-3">
      {CONTENT_TABS.map((tab) => {
        const Icon = tab.icon;
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

function InspirasiCard({ item }: { item: InspirasiItem }) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item.like_count);
  const [saveCount, setSaveCount] = useState(item.save_count);

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

  const tab = CONTENT_TABS.find((t) => t.key === item.type)!;
  const TypeIcon = tab.icon;

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
          <Badge className="absolute top-2 left-2 bg-purple-600 text-white text-xs">
            {tab.label}
          </Badge>
        </div>
      ) : (
        <div className="aspect-[16/9] relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
          <TypeIcon className="w-12 h-12 text-purple-300" />
          <Badge className="absolute top-2 left-2 bg-purple-600 text-white text-xs">
            {tab.label}
          </Badge>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <Clock className="w-3.5 h-3.5" />
          <span>{item.reading_time} menit baca</span>
          <span className="text-gray-300">|</span>
          <span>{item.category}</span>
          {item.moderationStatus === "pending" && (
            <span className="text-amber-600 font-medium">(pending)</span>
          )}
          {item.moderationStatus === "rejected" && (
            <span className="text-red-600 font-medium">(ditolak)</span>
          )}
        </div>

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

export default function InspirasiPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ContentType>("all");
  const [categoryFilter, setCategoryFilter] = useState("");

  const categories = useMemo(() => {
    const cats = new Set(getAllItems().map((item) => item.category));
    return Array.from(cats).sort();
  }, []);

  const filteredItems = useMemo(() => {
    const allItems = getAllItems();
    let items =
      activeTab === "all"
        ? allItems
        : allItems.filter((item) => item.type === activeTab);
    if (categoryFilter) {
      items = items.filter((item) => item.category === categoryFilter);
    }
    return items;
  }, [activeTab, categoryFilter]);

  const activeTabInfo = CONTENT_TABS.find((t) => t.key === activeTab)!;

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
              Kirim curhatanmu secara anonim &rarr;
            </Link>
          </div>
          <ContentTypeBar active={activeTab} onChange={setActiveTab} />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-3">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Semua Kategori</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-4">
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={activeTabInfo.icon}
            message={`Tidak ada ${activeTabInfo.label.toLowerCase()} yang ditemukan`}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredItems.map((item) => (
              <InspirasiCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <Link
        href="/inspirasi/post"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-[#084463] text-white shadow-lg hover:bg-[#084463]/90 active:scale-95 transition-all flex items-center justify-center"
      >
        <PenLine size={22} />
      </Link>

      <BottomNavigation items={NAV_TABS} activeTab="inspirasi" onTabChange={(id) => { router.push(navRoute(id)); }} />
    </div>
  );
}
