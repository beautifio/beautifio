"use client";

import { useState, use, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookHeart, Clock, Heart, Bookmark, Share2, Flag,
  Shield, MessageSquare, Users, Sparkles, BookOpen, PenLine, Quote,
} from "lucide-react";
import { Badge } from "@beautifio/ui";
import { CONTENT_TABS, getAllItems } from "@/lib/inspirasi-data";
import type { ContentType, InspirasiItem } from "@/lib/inspirasi-data";
import { SafeSpaceModal, NeedHelpButton } from "@/features/safe-space/SafeSpaceModal";

function renderContent(text: string) {
  const paragraphs = text.split("\n\n");
  return paragraphs.map((para, i) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={i} className="mb-4 text-gray-700 leading-relaxed">
        {parts.map((part, j) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={j} className="font-semibold text-gray-900">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        })}
      </p>
    );
  });
}

export default function InspirasiDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const item = getAllItems().find((d) => d.slug === slug);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(item?.like_count ?? 0);
  const [saveCount, setSaveCount] = useState(item?.save_count ?? 0);
  const [showSafeSpace, setShowSafeSpace] = useState(false);

  useEffect(() => {
    if (item) {
      setLikeCount(item.like_count);
      setSaveCount(item.save_count);
      setIsLiked(false);
      setIsSaved(false);
    }
  }, [item]);

  const handleLike = useCallback(() => {
    setIsLiked((prev) => {
      setLikeCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  const handleSave = useCallback(() => {
    setIsSaved((prev) => {
      setSaveCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  }, []);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/inspirasi/${slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item?.title, text: item?.content, url });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, [slug, item]);

  const handleReport = useCallback(() => {
    alert("Laporan telah dikirim. Terima kasih atas partisipasi Anda.");
  }, []);

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pb-20">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <BookHeart className="w-10 h-10 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Inspirasi Tidak Ditemukan
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Halaman yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Link
          href="/inspirasi"
          className="px-6 py-2.5 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Kembali ke Inspirasi
        </Link>
      </div>
    );
  }

  const tab = CONTENT_TABS.find((t) => t.key === item.type)!;
  const TypeIcon = tab.icon;

  const relatedItems = getAllItems().filter((d) => item.related_slugs.includes(d.slug));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.push("/inspirasi")}
            className="p-1.5 -ml-1.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-gray-900 truncate">
            {item.title}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Hero Image */}
        {item.cover_image ? (
          <div className="aspect-[16/9] relative overflow-hidden">
            <img
              src={item.cover_image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ) : (
          <div className="aspect-[16/9] relative bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <TypeIcon className="w-20 h-20 text-purple-300" />
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-purple-600 text-white text-xs flex items-center gap-1">
              <TypeIcon className="w-3 h-3" />
              {tab.label}
            </Badge>
            <Badge className="bg-gray-100 text-gray-700 text-xs">
              {item.category}
            </Badge>
            {item.moderationStatus === "pending" && (
              <Badge className="bg-amber-100 text-amber-800 text-xs">
                Menunggu Moderasi
              </Badge>
            )}
            {item.moderationStatus === "rejected" && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                Ditolak
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {item.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-sm font-semibold text-white">
              {item.initials || item.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.author}</p>
              {(item.type === "mentor" && item.mentor_title) ? (
                <p className="text-xs text-gray-500">{item.mentor_title}</p>
              ) : (item.type === "community" && item.community_name) ? (
                <p className="text-xs text-gray-500">{item.community_name}</p>
              ) : null}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {item.reading_time} menit baca
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {likeCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {item.comment_count}
            </span>
            <span className="flex items-center gap-1">
              <Bookmark className="w-4 h-4" />
              {saveCount}
            </span>
          </div>

          {/* Full Content */}
          <div className="mb-8">
            {renderContent(item.full_content)}
          </div>

          {/* Need Help Button */}
          <div className="mb-4">
            <NeedHelpButton
              onClick={() => setShowSafeSpace(true)}
              storyCategory={item.category}
            />
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between py-4 border-t border-b border-gray-100 mb-8">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                />
                <span>{likeCount}</span>
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 transition-colors"
              >
                <Bookmark
                  className={`w-5 h-5 ${isSaved ? "fill-purple-600 text-purple-600" : ""}`}
                />
                <span>{saveCount}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Bagikan</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReport}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                title="Laporkan"
              >
                <Flag className="w-4 h-4" />
                <span className="hidden sm:inline">Laporkan</span>
              </button>
              <button
                onClick={() => setShowSafeSpace(true)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-500 transition-colors"
                title="Safe Space"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Safe Space</span>
              </button>
            </div>
          </div>

          {/* Related Items */}
          {relatedItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Inspirasi Terkait
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedItems.slice(0, 4).map((related) => {
                  const relatedTab = CONTENT_TABS.find((t) => t.key === related.type)!;
                  const RelatedIcon = relatedTab.icon;
                  return (
                    <Link
                      key={related.id}
                      href={`/inspirasi/${related.slug}`}
                      className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {related.cover_image ? (
                        <div className="aspect-[16/9] relative overflow-hidden">
                          <img
                            src={related.cover_image}
                            alt={related.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <Badge className="absolute top-2 left-2 bg-purple-600 text-white text-xs">
                            {relatedTab.label}
                          </Badge>
                        </div>
                      ) : (
                        <div className="aspect-[16/9] bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                          <RelatedIcon className="w-8 h-8 text-purple-300" />
                          <Badge className="absolute top-2 left-2 bg-purple-600 text-white text-xs">
                            {relatedTab.label}
                          </Badge>
                        </div>
                      )}
                      <div className="p-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                          <Clock className="w-3 h-3" />
                          <span>{related.reading_time} menit</span>
                        </div>
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {related.title}
                        </h3>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <SafeSpaceModal
        open={showSafeSpace}
        onClose={() => setShowSafeSpace(false)}
        storyCategory={item.category}
      />

    </div>
  );
}
