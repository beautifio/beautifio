"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, BookHeart, Clock, Heart, Bookmark, Share2, Flag,
  MessageSquare, Sparkles, BookOpen, X, MapPin,
  Users, Feather, Monitor, TrendingUp, Clapperboard, AlertTriangle,
} from "lucide-react";
import { Badge } from "@beautifio/ui";
import { CATEGORY_LABELS, AUTHOR_TYPE_BADGE, ARCH_LABELS } from "@/lib/inspirasi-data";
import type { InspirasiItem } from "@/lib/inspirasi-data";
import { supabase } from "@/lib/supabase/client";
import {
  upsertArticleRead,
  updateArticleReadProgress,
  hasCompletedReadForActivity,
  getArticleIdsInUserJourney,
} from "@/lib/article-queries";
import { useAuth } from "@/hooks/use-auth";

const CATEGORY_ICONS: Record<string, typeof Sparkles> = {
  "lifetaintment": Clapperboard,
  "mind-body": Heart,
  "glow-glowup": Sparkles,
  "levelup-career": TrendingUp,
  "relationship": Users,
  "creative-space": Feather,
  "tech-gaming": Monitor,
};

const DISCLAIMER_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  yellow: { bg: "bg-yellow-50", text: "text-yellow-800", border: "border-yellow-200", label: "Perhatian" },
  red: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200", label: "Peringatan" },
};

const SOURCE_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  cerita: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Cerita" },
  mentor: { bg: "bg-primary/10", text: "text-primary", label: "Mentor" },
  redaksi: { bg: "bg-secondary/10", text: "text-secondary", label: "Redaksi" },
};

export default function InspirasiDetailClient({
  initialItem,
  slug,
}: {
  initialItem?: InspirasiItem | null;
  slug: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const fromJourney = searchParams.get("from") === "journey";
  const activityId = searchParams.get("activity_id");
  const journeyId = searchParams.get("journey_id");

  const [item, setItem] = useState<InspirasiItem | null>(initialItem || null);
  const [loading, setLoading] = useState(!initialItem);

  useEffect(() => {
    if (initialItem) {
      setItem(initialItem);
      setLoading(false);
      return;
    }
    (async () => {
      if (supabase) {
        const { data } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (data) {
          setItem({
            id: data.id,
            slug: data.slug,
            type: data.type,
            source: data.source || "cerita",
            title: data.title,
            content: data.excerpt || "",
            full_content: data.content,
            author: data.author,
            initials: data.initials,
            cover_image: data.cover_image,
            category: data.category,
            category_id: data.category_id,
            category_label: data.category_id ? CATEGORY_LABELS[data.category_id] || data.category : data.category,
            reading_time: data.read_time_minutes,
            like_count: data.like_count,
            comment_count: data.comment_count,
            save_count: data.save_count,
            related_slugs: data.related_slugs || [],
            author_type: data.author_type,
            architecture: data.architecture,
            author_credentials: data.author_credentials,
            author_anon_name: data.author_anon_name,
            series_id: data.series_id,
            disclaimer_type: data.disclaimer_type,
            disclaimer_custom: data.disclaimer_custom,
          });
          setLoading(false);
          return;
        }
      }
      const { getStoredItems } = await import("@/lib/inspirasi-data");
      const local = getStoredItems().find((d: InspirasiItem) => d.slug === slug);
      if (local) setItem(local);
      setLoading(false);
    })();
  }, [slug, initialItem]);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saveCount, setSaveCount] = useState(0);

  useEffect(() => {
    if (item) {
      setLikeCount(item.like_count);
      setSaveCount(item.save_count);
    }
  }, [item]);

  const [readId, setReadId] = useState<string | null>(null);
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [articleAlreadyRead, setArticleAlreadyRead] = useState(false);
  const [initDone, setInitDone] = useState(false);
  const [articleInJourney, setArticleInJourney] = useState(false);

  const scrollPctRef = useRef(0);
  const timeSpentRef = useRef(0);
  const completedRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const readIdRef = useRef<string | null>(null);

  const estimatedMinutes = item?.reading_time ?? 5;

  const triggerCompletion = useCallback(async (readIdVal: string) => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsCompleted(true);

    try {
      await updateArticleReadProgress(readIdVal, {
        is_completed: true,
        completed_at: new Date().toISOString(),
        scroll_percentage: scrollPctRef.current,
        time_spent_seconds: timeSpentRef.current,
      });
    } catch (e) {
      // console.warn("Failed to update reading progress:", e);
    }

    if (activityId) {
      try {
        const res = await fetch("/api/journey/complete-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity_id: activityId }),
        });
        if (res.ok) {
          setToastMessage("✓ Aktivitas journey-mu sudah otomatis tercatat!");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        }
      } catch {
        // silent
      }
    }
  }, [activityId]);

  useEffect(() => {
    if (!fromJourney || !user || !item || !activityId || initDone) return;

    let cancelled = false;

    (async () => {
      try {
        const alreadyRead = await hasCompletedReadForActivity(user.id, activityId, item.id);
        if (cancelled) return;

        if (alreadyRead) {
          setArticleAlreadyRead(true);
          setToastMessage("Kamu sudah pernah baca ini. Aktivitas langsung tercatat ✓");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);

          try {
            await fetch("/api/journey/complete-reading", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ activity_id: activityId }),
            });
          } catch {
            // silent
          }

          setInitDone(true);
          return;
        }

        const now = new Date().toISOString();
        const newReadId = await upsertArticleRead({
          user_id: user.id,
          article_id: item.id,
          activity_id: activityId,
          journey_id: journeyId || undefined,
          started_at: now,
        });
        if (cancelled || !newReadId) return;

        setReadId(newReadId);
        readIdRef.current = newReadId;
        setInitDone(true);

        timeIntervalRef.current = setInterval(() => {
          setTimeSpent((prev) => {
            const next = prev + 1;
            timeSpentRef.current = next;
            return next;
          });
        }, 1000);
      } catch (e) {
        // console.warn("Journey tracking error:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fromJourney, user, item, activityId, journeyId, initDone]);

  useEffect(() => {
    if (!fromJourney || !readId || isCompleted) return;

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;
      scrollPctRef.current = pct;
      setScrollPercentage(pct);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(async () => {
        await updateArticleReadProgress(readIdRef.current!, {
          scroll_percentage: scrollPctRef.current,
          time_spent_seconds: timeSpentRef.current,
        });
      }, 10000);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [fromJourney, readId, isCompleted]);

  useEffect(() => {
    if (!readId || completedRef.current) return;

    const timeThreshold = estimatedMinutes * 60 * 0.7;

    if (scrollPercentage >= 80 || timeSpent >= timeThreshold) {
      triggerCompletion(readId);
    }
  }, [scrollPercentage, timeSpent, readId, triggerCompletion, estimatedMinutes]);

  useEffect(() => {
    if (item) {
      setLikeCount(item.like_count);
      setSaveCount(item.save_count);
      setIsLiked(false);
      setIsSaved(false);
    }
  }, [item]);

  useEffect(() => {
    if (!user || !item) return;
    (async () => {
      try {
        const ids = await getArticleIdsInUserJourney(user.id);
        if (ids.includes(item.id)) {
          setArticleInJourney(true);
        }
      } catch {
        // silent
      }
    })();
  }, [user, item]);

  useEffect(() => {
    return () => {
      if (timeIntervalRef.current) clearInterval(timeIntervalRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const [relatedItems, setRelatedItems] = useState<InspirasiItem[]>([]);

  useEffect(() => {
    if (!item || !item.related_slugs.length) return;
    (async () => {
      if (supabase) {
        const { data } = await supabase
          .from("articles")
          .select("*")
          .in("slug", item.related_slugs)
          .limit(4);
        if (data?.length) {
          setRelatedItems(data.map((a: any) => ({
            id: a.id, slug: a.slug, type: a.type, title: a.title,
            content: a.excerpt || "", full_content: a.content,
            author: a.author, initials: a.initials, cover_image: a.cover_image,
            category: a.category, reading_time: a.read_time_minutes,
            like_count: a.like_count, comment_count: a.comment_count,
            save_count: a.save_count, related_slugs: a.related_slugs || [],
          })));
          return;
        }
      }
      const { getStoredItems } = await import("@/lib/inspirasi-data");
      const stored = getStoredItems();
      const local = stored.filter((d: InspirasiItem) => item.related_slugs.includes(d.slug));
      if (local.length) setRelatedItems(local);
    })();
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
    if (item?.id && supabase) {
      supabase.from('article_reports').insert({
        article_id: item.id, reason: 'user_report',
      }).then(() => {}, () => {});
    }
    alert("Laporan telah diterima. Terima kasih.");
  }, [item]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
        <div className="w-8 h-8 border-4 border-secondary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 pb-20">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <BookHeart className="w-10 h-10 text-primary/40" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Inspirasi Tidak Ditemukan
        </h2>
        <p className="text-text-secondary text-center mb-6">
          Halaman yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <Link
          href="/inspirasi"
          className="px-6 py-2.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/80 transition-colors"
        >
          Kembali ke Inspirasi
        </Link>
      </div>
    );
  }

  const authorType = item.author_type || (item.source as any) || "cerita_pembaca";
  const source = item.source || "cerita";
  const badge = SOURCE_BADGE[source] || SOURCE_BADGE.cerita;
  const authorBadge = AUTHOR_TYPE_BADGE[authorType] || AUTHOR_TYPE_BADGE.cerita_pembaca;
  const CategoryIcon = item.category_id ? CATEGORY_ICONS[item.category_id] : null;
  const disclaimerStyle = item.disclaimer_type ? DISCLAIMER_STYLES[item.disclaimer_type] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: item.title,
    description: item.content,
    author: {
      "@type": authorType === "mentor" ? "Person" : "Organization",
      name: item.author,
    },
    datePublished: item.createdAt || undefined,
    image: item.cover_image || undefined,
  };

  return (
    <div className="min-h-screen bg-bg pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => {
              if (fromJourney && journeyId) {
                router.push(`/journey/${journeyId}`);
              } else {
                router.push("/inspirasi");
              }
            }}
            className="p-1.5 -ml-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-muted transition-colors"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-sm font-medium text-text-primary truncate">
            {item.title}
          </h1>
        </div>
      </div>

      {/* Journey Progress Bar */}
      {fromJourney && (
        <div className="sticky top-14 z-10">
          <div className="h-[3px] w-full bg-border">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${scrollPercentage}%`, backgroundColor: "#084463" }}
            />
          </div>
        </div>
      )}

      {/* Journey Banner */}
      {fromJourney && showBanner && (
        <div className="max-w-2xl mx-auto px-4 mt-3">
          <div
            className="flex items-start gap-2 px-4 py-3 rounded-lg text-sm bg-muted border border-border"
          >
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="flex-1">
              Dari journey-mu · Baca sampai selesai untuk menyelesaikan aktivitas hari ini
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Hero Image with Architecture Badge */}
        {item.cover_image ? (
          <div className="aspect-[16/9] relative overflow-hidden">
            <img
              src={item.cover_image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            {item.architecture && (
              <span className="absolute top-3 left-3 text-xs font-bold bg-black/60 text-white px-2 py-1 rounded">
                {ARCH_LABELS[item.architecture]}
              </span>
            )}
          </div>
        ) : (
          <div className="aspect-[16/9] relative bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <BookOpen className="w-20 h-20 text-primary/30" />
            {item.architecture && (
              <span className="absolute top-3 left-3 text-xs font-bold bg-black/60 text-white px-2 py-1 rounded">
                {ARCH_LABELS[item.architecture]}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="px-4 py-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className={`${badge.bg} ${badge.text} text-xs font-semibold`}>
              {badge.label}
            </Badge>
            {item.category_id && CategoryIcon ? (
              <Badge className="bg-gray-100 text-gray-700 text-xs flex items-center gap-1">
                <CategoryIcon className="w-3 h-3" />
                {item.category_label || CATEGORY_LABELS[item.category_id] || item.category}
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-700 text-xs">
                {item.category}
              </Badge>
            )}
            {item.architecture && (
              <Badge className="bg-blue-50 text-blue-700 text-xs">
                {ARCH_LABELS[item.architecture]}
              </Badge>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
            {item.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-semibold text-white">
              {item.initials || item.author.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{item.author}</p>
              {authorType === "mentor" && item.author_credentials?.gelar && (
                <p className="text-xs text-gray-500">{item.author_credentials.gelar}</p>
              )}
              {authorType === "mentor" && item.author_credentials?.institusi && (
                <p className="text-xs text-gray-400">{item.author_credentials.institusi}</p>
              )}
              {authorType === "redaksi" && (
                <p className="text-xs text-gray-500">Tim Beautifio</p>
              )}
              {authorType === "cerita_pembaca" && item.author_anon_name && (
                <p className="text-xs text-gray-500">dikenal sebagai {item.author_anon_name}</p>
              )}
              {authorType === "cerita_pembaca" && !item.author_anon_name && (
                <p className="text-xs text-gray-500">Cerita Pembaca</p>
              )}
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

          {/* Disclaimer */}
          {disclaimerStyle && (
            <div className={`mb-6 p-4 rounded-lg border ${disclaimerStyle.bg} ${disclaimerStyle.border}`}>
              <div className="flex items-start gap-2">
                <AlertTriangle className={`w-5 h-5 mt-0.5 shrink-0 ${disclaimerStyle.text}`} />
                <div>
                  <p className={`text-sm font-semibold ${disclaimerStyle.text}`}>
                    {disclaimerStyle.label}
                  </p>
                  {item.disclaimer_custom && (
                    <p className={`text-sm mt-1 ${disclaimerStyle.text} opacity-80`}>
                      {item.disclaimer_custom}
                    </p>
                  )}
                  {!item.disclaimer_custom && item.disclaimer_type === "yellow" && (
                    <p className={`text-sm mt-1 ${disclaimerStyle.text} opacity-80`}>
                      Artikel ini mengandung topik yang mungkin sensitif bagi sebagian pembaca.
                    </p>
                  )}
                  {!item.disclaimer_custom && item.disclaimer_type === "red" && (
                    <p className={`text-sm mt-1 ${disclaimerStyle.text} opacity-80`}>
                      Artikel ini mengandung konten yang mungkin mengganggu. Disarankan kebijaksanaan pembaca.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Full Content */}
          <div className="mb-8 article-content"
            dangerouslySetInnerHTML={{ __html: item.full_content || "" }}
          />

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
                className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-secondary transition-colors"
              >
                <Bookmark
                  className={`w-5 h-5 ${isSaved ? "fill-secondary text-secondary" : ""}`}
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
            </div>
          </div>

          {/* Article in Journey */}
          {articleInJourney && !fromJourney && (
            <div className="mb-6 p-4 rounded-xl bg-muted border border-border">
              <p className="text-sm font-medium text-primary">
                <MapPin className="w-4 h-4 inline mr-1.5" />
                Artikel ini ada di journey-mu juga
              </p>
              <p className="text-xs mt-1 text-text-secondary">
                Kembali ke <Link href="/journey" className="font-semibold underline">journey-mu</Link> untuk melihat aktivitas hari ini.
              </p>
            </div>
          )}

          {/* Related Items */}
          {relatedItems.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Inspirasi Terkait
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedItems.slice(0, 4).map((related) => {
                  const relSource = related.source || "cerita";
                  const relBadge = SOURCE_BADGE[relSource] || SOURCE_BADGE.cerita;
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
                          <Badge className={`absolute top-2 left-2 ${relBadge.bg} ${relBadge.text} text-xs font-semibold`}>
                            {relBadge.label}
                          </Badge>
                        </div>
                      ) : (
                        <div className="aspect-[16/9] bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-primary/30" />
                          <Badge className={`absolute top-2 left-2 ${relBadge.bg} ${relBadge.text} text-xs font-semibold`}>
                            {relBadge.label}
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

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-in slide-in-from-bottom-2 fade-in duration-300">
            {toastMessage}
          </div>
        </div>
      )}

      <style>{`
        .article-content h1 { font-size: 1.8em; font-weight: 700; margin: 24px 0 12px; color: #1e293b; }
        .article-content h2 { font-size: 1.4em; font-weight: 600; margin: 20px 0 10px; color: #1e293b; }
        .article-content h3 { font-size: 1.15em; font-weight: 600; margin: 16px 0 8px; color: #1e293b; }
        .article-content p { margin: 0 0 12px; line-height: 1.75; color: #475569; }
        .article-content ul { list-style: disc; padding-left: 24px; margin: 12px 0; }
        .article-content ol { list-style: decimal; padding-left: 24px; margin: 12px 0; }
        .article-content li { margin-bottom: 4px; line-height: 1.6; color: #475569; }
        .article-content blockquote {
          border-left: 4px solid #084463; padding: 12px 20px; margin: 16px 0;
          color: #64748b; font-style: italic; background: #f8fafc;
          border-radius: 0 12px 12px 0;
        }
        .article-content table { border-collapse: collapse; width: 100%; margin: 16px 0; }
        .article-content th, .article-content td {
          border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; color: #475569;
        }
        .article-content th { background: #f8fafc; font-weight: 600; color: #1e293b; }
        .article-content hr { border: none; border-top: 2px solid #e2e8f0; margin: 28px 0; }
        .article-content img { max-width: 100%; border-radius: 12px; margin: 16px 0; }
        .article-content iframe { width: 100%; aspect-ratio: 16/9; border-radius: 12px; margin: 16px 0; }
        .article-content a { color: #2563eb; text-decoration: underline; }
        .article-content strong { color: #1e293b; }
      `}</style>

    </div>
  );
}
