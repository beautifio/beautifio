"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Target, Flame, MapPin, Settings, LogOut, Heart,
  Sparkles, Clock, Zap, Shield, Gift,
  Ticket, Award, Users, BookOpen, ChevronRight,
  LogIn, TrendingUp, Brain, User, BookHeart,
  Eye, EyeOff, CheckCircle2, Star, Smile, Trophy,
  Compass, ArrowRight,
} from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardContent, Badge, Avatar,
  ProgressBar, BottomNavigation, Button, Skeleton,
} from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import {
  MOCK_JOURNALS, FAMILIA_ACHIEVEMENT_REWARDS,
  getVoucherSessions, VOUCHER_TYPE_EMOJIS, VOUCHER_TYPE_LABELS,
  getLifeProfile, getCapitalOverview, getAllGrowthWins,
  ROADMAP_V3_SEED, getStreak, getStoredReflections,
  LIFE_LEVELS, getLifeLevel,
} from "@beautifio/utils";
import { getActiveJourney, getJourneyProgress } from "@/lib/journey-queries";
import type { DreamJourney, JourneyProgress } from "@beautifio/types";
import { RESOURCES } from "@/lib/safe-space-data";
import type { Journal, FamiliaAchievementReward, GrowthWin } from "@beautifio/types";

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getJournals(): Journal[] {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("beautifio_journals") : null;
    const userJ = stored ? JSON.parse(stored) : [];
    return [...userJ, ...MOCK_JOURNALS].slice(0, 5);
  } catch { return MOCK_JOURNALS.slice(0, 5); }
}

function getAnonPosts() {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("beautifio_anon_posts") : null;
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

/* ─── HELPERS ─── */

function getDreamLabel(slug: string | null): string {
  if (!slug) return "";
  const dream = ROADMAP_V3_SEED[slug];
  return dream?.dream?.title || dream?.title || slug;
}

function getDreamEmoji(slug: string | null): string {
  if (!slug) return "🎯";
  return ROADMAP_V3_SEED[slug]?.emoji || "🎯";
}

function getDreamColor(slug: string | null): string {
  if (!slug) return "from-accent to-primary";
  return ROADMAP_V3_SEED[slug]?.color || "from-accent to-primary";
}

function generateEmotionalSummary(profile: ReturnType<typeof getLifeProfile>, streak: number, growthWins: GrowthWin[]): string {
  const totalCapital = Object.values(profile.lifeCapital).reduce((a, b) => a + b, 0);
  const avg = Math.round(totalCapital / 6);
  const summaries: string[] = [];

  if (streak > 0 && streak < 7) {
    summaries.push("Kamu sudah memulai — dan itu adalah langkah terberat. Setiap hari kecil adalah kemenangan besar.");
  } else if (streak >= 7 && streak < 30) {
    summaries.push(`Kamu sudah konsisten selama ${streak} hari. Kebiasaan kecil yang kamu bangun hari ini adalah fondasi impian besar.`);
  } else if (streak >= 30) {
    summaries.push(`Luar biasa — ${streak} hari konsisten! Kamu bukan lagi orang yang sama dengan ${streak} hari yang lalu.`);
  }

  if (growthWins.length > 0) {
    summaries.push(`Kamu sudah merayakan ${growthWins.length} growth win. Setiap pencapaian adalah bukti bahwa kamu bertumbuh.`);
  }

  if (avg >= 40) {
    summaries.push("Perkembangan dirimu sudah di atas rata-rata. Kamu berada di jalur yang tepat.");
  } else if (avg < 20) {
    summaries.push("Setiap perjalanan besar dimulai dari langkah pertama. Kamu sedang membangun fondasi yang kuat.");
  }

  if (profile.currentDreamSlug) {
    summaries.push(`Kamu sedang mengejar mimpi menjadi ${getDreamLabel(profile.currentDreamSlug)}. Teruslah melangkah.`);
  }

  if (summaries.length === 0) {
    summaries.push("Hari ini adalah awal dari perjalananmu. Setiap langkah kecil membawamu lebih dekat ke mimpimu.");
  }

  return summaries[Math.floor(Math.random() * summaries.length)];
}

/* ─── COMPONENTS ─── */

function ProfileHero() {
  const router = useRouter();
  const profile = getLifeProfile();
  const capitalOverview = getCapitalOverview();
  const dreamSlug = profile.currentDreamSlug;
  const dreamLabel = getDreamLabel(dreamSlug);
  const dreamEmoji = getDreamEmoji(dreamSlug);
  const streak = dreamSlug ? getStreak(dreamSlug) : 0;
  const progress = capitalOverview.average;
  const lifeLevel = getLifeLevel(capitalOverview.total);
  const discoveryAnswers = typeof window !== "undefined" ? localStorage.getItem("beautifio_discovery_answers") : null;
  const discoveryDone = discoveryAnswers ? true : false;
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";
  const initials = user?.user_metadata?.full_name
    ? getInitials(user.user_metadata.full_name)
    : user?.email?.[0]?.toUpperCase() || "U";

  const activeRoadmapCount = useMemo(() => {
    let count = 0;
    for (const slug of Object.keys(ROADMAP_V3_SEED)) {
      if (getStreak(slug) > 0) count++;
    }
    return count;
  }, []);

  return (
    <div className="bg-gradient-to-b from-bg to-surface">
      <div className="max-w-content mx-auto">
        <div className="relative pt-8 pb-6 px-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar initials={initials} size="xl" />
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${lifeLevel.level === "seed" ? "from-green-400 to-emerald-500" : "from-accent to-primary"} flex items-center justify-center text-[10px] text-white font-bold shadow-md`}>
                <Smile className="w-3.5 h-3.5" />
              </div>
            </div>

            <h1 className="text-xl font-bold text-text-primary mt-4">{displayName}</h1>
            <p className="text-xs text-text-secondary mt-0.5">{lifeLevel.emoji} {lifeLevel.label}</p>

            {dreamLabel && (
              <div className="mt-4 w-full max-w-sm">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20">
                  <p className="text-[10px] font-medium text-accent/70 uppercase tracking-wider mb-1">
                    🎯 Mimpi Saat Ini
                  </p>
                  <p className="text-sm font-bold text-text-primary">
                    {dreamEmoji} {dreamLabel}
                  </p>
                  {activeRoadmapCount > 0 && (
                    <p className="text-[10px] text-text-secondary mt-1">
                      🔥 Sedang Dijalani: {activeRoadmapCount} Roadmap Aktif
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-5 w-full max-w-sm">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-1.5">
                  <TrendingUp size={20} className="text-primary" />
                </div>
                <span className="text-lg font-bold text-text-primary">{progress}%</span>
                <span className="text-[9px] text-text-secondary">Progress</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-1.5">
                  <Flame size={20} className="text-orange-500" />
                </div>
                <span className="text-lg font-bold text-text-primary">{streak}</span>
                <span className="text-[9px] text-text-secondary">Streak</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-1.5">
                  <Star size={20} className="text-purple-500" />
                </div>
                <span className="text-lg font-bold text-text-primary">{capitalOverview.total}</span>
                <span className="text-[9px] text-text-secondary">Life Capital</span>
              </div>
            </div>

            {!discoveryDone && (
              <button
                onClick={() => router.push("/discover")}
                className="mt-4 w-full max-w-sm p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3 hover:bg-accent/15 transition-colors text-left cursor-pointer"
              >
                <Sparkles size={18} className="text-accent" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-text-primary">Temukan Mimpimu</p>
                  <p className="text-[10px] text-text-secondary">Ikuti Discovery untuk menemukan potensi dirimu</p>
                </div>
                <ChevronRight size={16} className="text-text-secondary/30" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmotionalSummary() {
  const profile = getLifeProfile();
  const growthWins = getAllGrowthWins();
  const dreamSlug = profile.currentDreamSlug;
  const streak = dreamSlug ? getStreak(dreamSlug) : 0;
  const summary = generateEmotionalSummary(profile, streak, growthWins);

  return (
    <div className="px-6">
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-primary/70 uppercase tracking-wider mb-1">Catatan untukmu</p>
            <p className="text-sm text-text-primary leading-relaxed">{summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LifeJourney() {
  const router = useRouter();
  const profile = getLifeProfile();
  const growthWins = getAllGrowthWins();
  const journals = getJournals();

  const timelineItems: { date: Date; label: string; desc: string; icon: string; color: string }[] = [];

  for (const gw of growthWins.slice(0, 5)) {
    timelineItems.push({
      date: new Date(gw.unlockedAt),
      label: gw.title,
      desc: gw.description,
      icon: "🏆",
      color: "from-amber-400 to-orange-500",
    });
  }

  for (const j of journals.slice(0, 3)) {
    timelineItems.push({
      date: new Date(j.updated_at),
      label: j.title,
      desc: `${j.entry_count} entri jurnal`,
      icon: "📖",
      color: "from-blue-400 to-indigo-500",
    });
  }

  if (profile.currentDreamSlug) {
    timelineItems.push({
      date: new Date(profile.updatedAt),
      label: `Berfokus pada ${getDreamLabel(profile.currentDreamSlug)}`,
      desc: "Memulai perjalanan menuju mimpi",
      icon: "🎯",
      color: "from-accent to-primary",
    });
  }

  if (profile.onboardingCompleted) {
    timelineItems.push({
      date: new Date(profile.updatedAt),
      label: "Discovery Selesai",
      desc: "Mengenal potensi dan arah hidup",
      icon: "✨",
      color: "from-purple-400 to-pink-500",
    });
  }

  timelineItems.sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatRelative = (d: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Hari ini";
    if (diffDays === 1) return "Kemarin";
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    return `${Math.floor(diffDays / 30)} bulan lalu`;
  };

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <CardTitle>My Life Journey</CardTitle>
          </div>
          <button onClick={() => router.push("/roadmap")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {timelineItems.length > 0 ? (
          <div className="space-y-0 relative">
            <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-border" />
            {timelineItems.slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-start gap-3 pb-4 relative">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-sm flex-shrink-0 relative z-10 shadow-sm`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-xs font-bold text-text-primary">{item.label}</p>
                  <p className="text-[10px] text-text-secondary">{item.desc}</p>
                  <p className="text-[9px] text-text-secondary/60 mt-0.5">{formatRelative(item.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
              <MapPin size={24} className="text-primary/30" />
            </div>
            <p className="text-sm font-semibold text-text-primary mb-1">Belum ada aktivitas</p>
            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              Perjalanan besar dimulai dari catatan kecil pertama. Mulailah dengan menulis jurnal atau menyelesaikan Daily Win pertamamu.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MyJourneySection() {
  const router = useRouter();
  const { user } = useAuth();
  const [journey, setJourney] = useState<DreamJourney | null>(null);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const j = await getActiveJourney(user.id);
      setJourney(j);
      if (j) {
        const p = await getJourneyProgress(user.id, j.id);
        setProgress(p);
      }
    })();
  }, [user]);

  if (!journey) {
    return (
      <div className="px-6">
        <Card padding="lg" className="border-accent/20 bg-accent/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-accent" />
              <CardTitle>Mulai Perjalananmu</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-text-secondary mb-4">
              Pilih mimpi dan mulai perjalanan menuju masa depan yang kamu inginkan.
            </p>
            <Button variant="accent" size="sm" onClick={() => router.push("/journey")}>
              Mulai Sekarang <ArrowRight size={14} />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedToday = progress?.completed_activities_today || 0;
  const totalToday = progress?.total_activities_today || 6;

  return (
    <div className="px-6">
      <Card padding="lg" className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-primary" />
              <CardTitle>Perjalananku</CardTitle>
            </div>
            <button
              onClick={() => router.push(`/journey/${journey.id}`)}
              className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Buka
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{journey.emoji}</span>
            <div>
              <p className="text-sm font-bold text-text-primary">{journey.title}</p>
              {progress?.current_big_win && (
                <p className="text-xs text-text-secondary">🏆 {progress.current_big_win.title}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame size={14} className="text-accent" />
            <span className="text-xs text-text-secondary">
              {completedToday}/{totalToday} hari ini
            </span>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: totalToday }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${
                  i < completedToday ? "bg-primary" : "bg-border"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CurrentFocus() {
  const router = useRouter();
  const profile = getLifeProfile();
  const dreamSlug = profile.currentDreamSlug;
  const dreamLabel = getDreamLabel(dreamSlug);
  const dreamEmoji = getDreamEmoji(dreamSlug);

  const activeRoadmapCount = useMemo(() => {
    let count = 0;
    for (const slug of Object.keys(ROADMAP_V3_SEED)) {
      if (getStreak(slug) > 0) count++;
    }
    return count;
  }, []);

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target size={18} className="text-accent" />
          <CardTitle>Current Focus</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {dreamLabel ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/10 border border-accent/20">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-lg">
              {dreamEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-accent/70 uppercase tracking-wider">Mimpi Aktif</p>
              <p className="text-sm font-bold text-text-primary truncate">{dreamLabel}</p>
            </div>
          </div>
        ) : (
          <button onClick={() => router.push("/discover")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors text-left cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Sparkles size={18} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">Temukan Mimpimu</p>
              <p className="text-[10px] text-text-secondary">Ikuti Discovery untuk memulai</p>
            </div>
            <ChevronRight size={16} className="text-text-secondary/30" />
          </button>
        )}

        {activeRoadmapCount > 0 ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">Roadmap Aktif</p>
              <p className="text-sm font-bold text-text-primary">{activeRoadmapCount} Roadmap</p>
            </div>
            <button onClick={() => router.push("/roadmap")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
              Buka
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
            <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center">
              <MapPin size={18} className="text-text-secondary/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">Roadmap</p>
              <p className="text-xs text-text-secondary">Mulai roadmap untuk melacak progres menuju mimpimu</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Users size={18} className="text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">Circle</p>
            <p className="text-xs text-text-secondary">Kamu belum bergabung dengan circle. Temukan teman seperjalanan yang memiliki impian yang sama.</p>
          </div>
          <button onClick={() => router.push("/circle")} className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer flex-shrink-0">
            Cari
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Heart size={18} className="text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-text-secondary uppercase tracking-wider">Mentor</p>
            <p className="text-xs text-text-secondary">Kamu belum memiliki mentor. Satu mentor yang tepat bisa mempercepat perjalananmu.</p>
          </div>
          <button onClick={() => router.push("/mentors")} className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer flex-shrink-0">
            Cari
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

const CAPITAL_CFG = [
  { key: "knowledge" as const, label: "Pengetahuan", emoji: "📚", color: "from-blue-500 to-blue-600" },
  { key: "skill" as const, label: "Skill", emoji: "⚡", color: "from-amber-500 to-orange-500" },
  { key: "health" as const, label: "Kesehatan", emoji: "💪", color: "from-green-500 to-emerald-600" },
  { key: "relationship" as const, label: "Relasi", emoji: "👥", color: "from-pink-500 to-rose-500" },
  { key: "character" as const, label: "Karakter", emoji: "⭐", color: "from-purple-500 to-violet-600" },
  { key: "spiritual" as const, label: "Spiritual", emoji: "🕊️", color: "from-indigo-500 to-blue-600" },
];

function getCapitalLabel(value: number): { label: string; color: string } {
  if (value < 20) return { label: "Perlu Perhatian", color: "text-red-500" };
  if (value < 40) return { label: "Sedang Bertumbuh", color: "text-amber-500" };
  if (value < 70) return { label: "Baik", color: "text-green-500" };
  return { label: "Sangat Baik", color: "text-emerald-500" };
}

function MyGrowth() {
  const [showDetails, setShowDetails] = useState(false);
  const profile = getLifeProfile();
  const capital = profile.lifeCapital;
  const capitalOverview = getCapitalOverview();
  const avg = capitalOverview.average;
  const lifeLevel = getLifeLevel(capitalOverview.total);
  const router = useRouter();
  const growthWins = getAllGrowthWins();

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-rose-500" />
            <CardTitle>🌱 Perkembangan Diriku</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              {showDetails ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{showDetails ? "Sembunyikan" : "Detail"}</span>
            </button>
            <button onClick={() => router.push("/journey")} className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer">
              Buka
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 border border-rose-100">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-800/30 flex items-center justify-center text-lg">
            {lifeLevel.emoji}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-primary">{lifeLevel.label} · {avg}%</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-400 to-orange-500 rounded-full" style={{ width: `${avg}%` }} />
              </div>
            </div>
          </div>
          <span className="text-[10px] text-text-secondary">{growthWins.length} wins</span>
        </div>

        {showDetails ? (
          <div className="space-y-2">
            {CAPITAL_CFG.map((c) => {
              const val = capital[c.key];
              const { label, color } = getCapitalLabel(val);
              return (
                <div key={c.key} className="flex items-center gap-3">
                  <span className="text-sm w-5 text-center">{c.emoji}</span>
                  <span className="text-[10px] font-medium text-text-secondary w-[72px] flex-shrink-0">{c.label}</span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r ${c.color}`} style={{ width: `${val}%` }} />
                  </div>
                  <span className={`text-[10px] font-semibold w-[96px] text-right ${color}`}>{label}</span>
                  <span className="text-[10px] font-bold text-text-primary w-7 text-right">{val}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {CAPITAL_CFG.map((c) => {
              const val = capital[c.key];
              const { label, color } = getCapitalLabel(val);
              return (
                <div key={c.key} className="flex flex-col items-center p-3 rounded-xl bg-surface border border-border">
                  <span className="text-lg mb-1">{c.emoji}</span>
                  <span className="text-[10px] font-medium text-text-secondary">{c.label}</span>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mt-1.5">
                    <div className={`h-full rounded-full bg-gradient-to-r ${c.color}`} style={{ width: `${val}%` }} />
                  </div>
                  <span className={`text-[9px] font-semibold mt-0.5 ${color}`}>{label}</span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MyJournalsAndStories() {
  const router = useRouter();
  const journals = getJournals();
  const anonPosts = getAnonPosts();
  const totalEntries = journals.reduce((sum, j) => sum + (j.entry_count || 0), 0);

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookHeart size={18} className="text-primary" />
            <CardTitle>📖 Catatan Perjalananku</CardTitle>
          </div>
          <button onClick={() => router.push("/jurnal")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col items-center p-3 rounded-xl bg-primary/5 border border-primary/10">
            <span className="text-lg font-bold text-text-primary">{journals.length}</span>
            <span className="text-[10px] text-text-secondary">Jurnal</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-accent/5 border border-accent/10">
            <span className="text-lg font-bold text-text-primary">{totalEntries}</span>
            <span className="text-[10px] text-text-secondary">Entri</span>
          </div>
        </div>

        {journals.length > 0 ? (
          <div className="space-y-1.5">
            {journals.slice(0, 3).map((j) => (
              <button key={j.id} onClick={() => router.push(`/jurnal/${j.slug}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors text-left cursor-pointer border border-border">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{j.title}</p>
                  <p className="text-[10px] text-text-secondary">{j.entry_count} entri</p>
                </div>
                <ChevronRight size={14} className="text-text-secondary/30 flex-shrink-0" />
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={20} className="text-primary/30" />
            </div>
            <p className="text-xs text-text-secondary max-w-xs mx-auto">
              Perjalanan besar dimulai dari catatan kecil pertama. Mulailah menulis jurnal untuk mendokumentasikan perjalananmu.
            </p>
            <button onClick={() => router.push("/jurnal")} className="mt-3 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
              + Buat Jurnal Pertama
            </button>
          </div>
        )}

        <button onClick={() => router.push("/cerita")} className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors text-left cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <BookHeart size={14} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary">Cerita Anonim</p>
            <p className="text-[10px] text-text-secondary">{anonPosts.length} cerita telah dibagikan</p>
          </div>
          <ChevronRight size={14} className="text-text-secondary/30 flex-shrink-0" />
        </button>
      </CardContent>
    </Card>
  );
}

function SupportSystem() {
  const router = useRouter();
  const anonPosts = getAnonPosts();
  const myAnonPosts = anonPosts.filter((p: any) => p.postingMode === "anonymous");

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-purple-600" />
          <CardTitle>🤝 Dukungan Untukku</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <button onClick={() => router.push("/inspirasi")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 hover:bg-purple-100/50 transition-colors text-left cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-800/30 flex items-center justify-center">
            <Shield size={18} className="text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary">Safe Space</p>
            <p className="text-[10px] text-text-secondary">Tempat aman untuk berbagi dan mencari dukungan</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-text-primary">{myAnonPosts.length}</span>
            <span className="text-[9px] text-text-secondary">post</span>
          </div>
          <ChevronRight size={14} className="text-text-secondary/30" />
        </button>

        <button onClick={() => router.push("/circle")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/20 hover:bg-secondary/10 transition-colors text-left cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Users size={18} className="text-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary">Circle</p>
            <p className="text-[10px] text-text-secondary">Kamu belum bergabung dengan circle. Temukan teman seperjalanan yang memiliki impian yang sama.</p>
          </div>
          <ChevronRight size={14} className="text-text-secondary/30" />
        </button>

        <button onClick={() => router.push("/mentors")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors text-left cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <Heart size={18} className="text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary">Mentor</p>
            <p className="text-[10px] text-text-secondary">Kamu belum memiliki mentor. Satu mentor yang tepat bisa mempercepat perjalananmu.</p>
          </div>
          <ChevronRight size={14} className="text-text-secondary/30" />
        </button>
      </CardContent>
    </Card>
  );
}

function OpportunitiesAndRewards() {
  const router = useRouter();
  const sessions = getVoucherSessions();
  const activeSessions = sessions.filter((s) => s.status === "active");
  const redeemedSessions = sessions.filter((s) => s.status === "redeemed");
  const achievements = FAMILIA_ACHIEVEMENT_REWARDS;

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-amber-500" />
            <CardTitle>🎁 Kesempatan & Reward</CardTitle>
          </div>
          <button onClick={() => router.push("/familia")} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer">
            Buka
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => router.push("/opportunity")} className="flex flex-col items-center p-3 rounded-xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-colors cursor-pointer">
            <BriefcaseIcon size={18} className="text-accent mb-1" />
            <span className="text-sm font-bold text-text-primary">0</span>
            <span className="text-[9px] text-text-secondary">Tersimpan</span>
          </button>
          <div className="flex flex-col items-center p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100">
            <Ticket size={18} className="text-amber-600 mb-1" />
            <span className="text-sm font-bold text-text-primary">{activeSessions.length}</span>
            <span className="text-[9px] text-text-secondary">Voucher Aktif</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100">
            <Award size={18} className="text-blue-600 mb-1" />
            <span className="text-sm font-bold text-text-primary">{redeemedSessions.length}</span>
            <span className="text-[9px] text-text-secondary">Reward</span>
          </div>
        </div>

        {achievements.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Achievement Rewards</p>
            <div className="space-y-1.5">
              {achievements.slice(0, 2).map((ar) => (
                <div key={ar.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-r ${ar.color || "from-emerald-500 to-teal-500"} flex items-center justify-center flex-shrink-0`}>
                    <Trophy size={12} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-text-primary">{ar.title}</p>
                    <p className="text-[9px] text-text-secondary truncate">{ar.reward_description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BriefcaseIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function SettingsSection() {
  const { signOut } = useAuth();
  const menuItems = [
    { icon: User, label: "Edit Profil" },
    { icon: Settings, label: "Pengaturan Akun" },
    { icon: BookOpen, label: "Kebijakan Privasi" },
    { icon: LogOut, label: "Keluar", danger: true, action: async () => { await signOut(); window.location.href = "/"; } },
  ];

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-text-secondary" />
          <CardTitle>Pengaturan</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={i}
              onClick={item.action}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted/30 transition-colors text-left cursor-pointer ${i < menuItems.length - 1 ? "border-b border-border" : ""}`}
            >
              <Icon size={16} className={item.danger ? "text-destructive" : "text-text-secondary"} />
              <span className={`text-sm flex-1 ${item.danger ? "text-destructive font-medium" : "text-text-primary"}`}>{item.label}</span>
              <ChevronRight size={16} className="text-text-secondary/30" />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function LoginPrompt() {
  return (
    <div className="flex flex-col items-center justify-center pt-16 pb-8 px-6 min-h-screen bg-bg">
      <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <User size={36} className="text-primary/40" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-2 text-center">Mulai Perjalananmu</h2>
      <p className="text-sm text-text-secondary text-center mb-8 max-w-xs">
        Masuk untuk melihat perjalanan hidupmu, melacak progres mimpimu, dan terhubung dengan pendukungmu.
      </p>
      <Link href="/login" className="w-full max-w-xs">
        <Button variant="primary" size="lg" className="w-full">
          <LogIn size={16} /> Masuk
        </Button>
      </Link>
      <p className="text-xs text-text-secondary mt-4">
        Belum punya akun?{" "}
        <Link href="/register" className="text-secondary font-semibold hover:underline">Daftar</Link>
      </p>
    </div>
  );
}

/* ─── MAIN SCREEN ─── */

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("profil");
  const router = useRouter();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto px-6 pt-6 pb-24 space-y-6">
          <div className="flex flex-col items-center pt-4 pb-6">
            <Skeleton className="w-20 h-20 rounded-full mb-4" />
            <Skeleton className="w-36 h-6 mb-2" />
            <Skeleton className="w-56 h-4" />
            <div className="grid grid-cols-3 gap-4 mt-5 w-full max-w-sm">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <Skeleton className="w-10 h-4" />
                  <Skeleton className="w-12 h-3" />
                </div>
              ))}
            </div>
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return <LoginPrompt />;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto pb-24 space-y-5">
        <ProfileHero />

        <EmotionalSummary />

        <MyJourneySection />

        <div className="px-6 space-y-5">
          <LifeJourney />
          <CurrentFocus />
          <MyGrowth />
          <MyJournalsAndStories />
          <SupportSystem />
          <OpportunitiesAndRewards />
          <SettingsSection />
        </div>
      </div>

      <BottomNavigation
        items={NAV_TABS}
        activeTab={activeTab}
        onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }}
      />
    </div>
  );
}
