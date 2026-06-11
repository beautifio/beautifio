"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, MapPin, User, Target, Trophy, ChevronRight, Circle,
  Bookmark, Briefcase, GraduationCap, Settings, LogOut, Heart,
  Star, LogIn, BookOpen, Sparkles, Clock, Zap, Shield, Gift,
  Ticket, ShoppingBag, Flame, CheckCircle2, Award, ExternalLink,
  BookHeart, MessageCircle, FileText, Eye, EyeOff, TrendingUp,
} from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardContent, Badge, Avatar,
  ProgressBar, BottomNavigation, Button, Skeleton, Tabs, TabsList,
  TabsTrigger, TabsContent,
} from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import {
  MOCK_JOURNALS, FAMILIA_ACHIEVEMENT_REWARDS, FAMILIA_MERCHANTS,
  getVoucherSessions, VOUCHER_TYPE_EMOJIS, VOUCHER_TYPE_LABELS,
  getLifeProfile,
} from "@beautifio/utils";
import { RESOURCES, EMERGENCY_CONTACTS } from "@/lib/safe-space-data";
import type { Journal, FamiliaAchievementReward } from "@beautifio/types";
import { GrowthTracker } from "@/features/roadmap/components/GrowthTracker";

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

function getDiscoveryResult() {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("beautifio_discovery_answers") : null;
    if (stored) {
      const answers = JSON.parse(stored);
      return { completed: true, answerCount: answers.length, answers };
    }
  } catch { /* ignore */ }
  return { completed: false, answerCount: 0, answers: [] };
}

function getAnonPosts() {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem("beautifio_anon_posts") : null;
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

/* ─── COMPONENTS ─── */

function IdentityHeader({ name, initials, bio, city, interests, currentGoal, growthScore, streak, badges, onEdit }: {
  name: string; initials: string; bio?: string; city?: string;
  interests: string[]; currentGoal: string;
  growthScore: number; streak: number; badges: { id: string; label: string; icon: any; color: string }[];
  onEdit: () => void;
}) {
  const scoreLevel = growthScore >= 5000 ? "Diamond" : growthScore >= 2000 ? "Gold" : growthScore >= 500 ? "Silver" : "Bronze";
  const scoreColors: Record<string, string> = { Diamond: "from-cyan-400 to-blue-500", Gold: "from-amber-400 to-orange-500", Silver: "from-gray-300 to-gray-400", Bronze: "from-amber-700 to-amber-800" };

  return (
    <div className="bg-gradient-to-b from-bg to-surface">
      <div className="max-w-content mx-auto">
        <div className="relative pt-8 pb-4 px-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar initials={initials} size="xl" />
              {growthScore > 0 && (
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${scoreColors[scoreLevel]} flex items-center justify-center text-[10px] text-white font-bold shadow-md`}>
                  <Award className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold text-text-primary mt-4">{name}</h1>
            {bio && <p className="text-sm text-text-secondary mt-1 text-center max-w-xs">{bio}</p>}
            {city && (
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={12} className="text-text-secondary/50" />
                <span className="text-xs text-text-secondary">{city}</span>
              </div>
            )}

            {interests.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                {interests.map((i) => (
                  <Badge key={i} variant="accent" className="text-[10px]">{i}</Badge>
                ))}
              </div>
            )}

            {currentGoal && (
              <div className="mt-4 w-full max-w-xs">
                <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-3">
                  <Target size={18} className="text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-accent/70 uppercase tracking-wider">Current Goal</p>
                    <p className="text-sm font-semibold text-text-primary truncate">{currentGoal}</p>
                  </div>
                  <ChevronRight size={16} className="text-text-secondary/30 flex-shrink-0" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-4 gap-3 mt-5 w-full max-w-sm">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-1">
                  <Award size={18} className="text-amber-600" />
                </div>
                <span className="text-sm font-bold text-text-primary">{growthScore.toLocaleString()}</span>
                <span className="text-[9px] text-text-secondary">Score</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-1">
                  <Flame size={18} className="text-orange-500" />
                </div>
                <span className="text-sm font-bold text-text-primary">{streak}</span>
                <span className="text-[9px] text-text-secondary">Streak</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-1">
                  <Trophy size={18} className="text-blue-600" />
                </div>
                <span className="text-sm font-bold text-text-primary">{badges.length}</span>
                <span className="text-[9px] text-text-secondary">Badges</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mb-1">
                  <Sparkles size={18} className="text-purple-600" />
                </div>
                <span className="text-sm font-bold text-text-primary">{scoreLevel}</span>
                <span className="text-[9px] text-text-secondary">Level</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JourneySection() {
  const router = useRouter();
  const discovery = getDiscoveryResult();
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-primary" />
            <CardTitle>My Journey</CardTitle>
          </div>
          <button onClick={() => router.push("/roadmap")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {discovery.completed ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">Discovery Selesai</p>
              <p className="text-[10px] text-text-secondary">{discovery.answerCount} jawaban</p>
            </div>
          </div>
        ) : (
          <button onClick={() => router.push("/discover")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20 hover:bg-accent/10 transition-colors text-left cursor-pointer">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles size={18} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">Ikuti Discovery</p>
              <p className="text-[10px] text-text-secondary">Temukan potensi dirimu</p>
            </div>
            <ChevronRight size={16} className="text-text-secondary/30" />
          </button>
        )}

        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Target size={18} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary">Goal Aktif</p>
            <p className="text-[10px] text-text-secondary">Belum ada goal yang ditetapkan</p>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-secondary" />
              <span className="text-xs font-semibold text-text-secondary">Roadmap Aktif</span>
            </div>
          </div>
          <p className="text-[10px] text-text-secondary">Mulai roadmap untuk melacak progres</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StoriesSection() {
  const router = useRouter();
  const anonPosts = getAnonPosts();

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookHeart size={18} className="text-primary" />
            <CardTitle>My Stories</CardTitle>
          </div>
          <button onClick={() => router.push("/cerita")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-3 rounded-xl bg-primary/5 border border-primary/10">
            <span className="text-lg font-bold text-text-primary">{anonPosts.length}</span>
            <span className="text-[10px] text-text-secondary">Dibuat</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-accent/5 border border-accent/10">
            <span className="text-lg font-bold text-text-primary">0</span>
            <span className="text-[10px] text-text-secondary">Tersimpan</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-secondary/5 border border-secondary/10">
            <span className="text-lg font-bold text-text-primary">0</span>
            <span className="text-[10px] text-text-secondary">Disukai</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function JournalsSection() {
  const router = useRouter();
  const journals = getJournals();
  const totalEntries = journals.reduce((sum, j) => sum + (j.entry_count || 0), 0);
  const totalFollowers = journals.reduce((sum, j) => sum + (j.follower_count || 0), 0);

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            <CardTitle>My Journals</CardTitle>
          </div>
          <button onClick={() => router.push("/jurnal")} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <FileText size={16} className="text-primary" />
            <div>
              <span className="text-sm font-bold text-text-primary">{journals.length}</span>
              <span className="text-[10px] text-text-secondary ml-1">Jurnal</span>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
            <BookOpen size={16} className="text-accent" />
            <div>
              <span className="text-sm font-bold text-text-primary">{totalEntries}</span>
              <span className="text-[10px] text-text-secondary ml-1">Entri</span>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/10">
            <Users size={16} className="text-secondary" />
            <div>
              <span className="text-sm font-bold text-text-primary">{totalFollowers}</span>
              <span className="text-[10px] text-text-secondary ml-1">Followers</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          {journals.slice(0, 3).map((j) => (
            <button key={j.id} onClick={() => router.push(`/jurnal/${j.slug}`)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors text-left cursor-pointer border border-border">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-text-primary truncate">{j.title}</p>
                <p className="text-[10px] text-text-secondary">{j.entry_count} entri · {j.follower_count} pengikut</p>
              </div>
              <ChevronRight size={14} className="text-text-secondary/30 flex-shrink-0" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CirclesSection() {
  const router = useRouter();
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-secondary" />
            <CardTitle>My Circles</CardTitle>
          </div>
          <button onClick={() => router.push("/circle")} className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-text-secondary text-center py-4">Belum bergabung dengan circle. Temukan circle yang sesuai dengan minatmu.</p>
      </CardContent>
    </Card>
  );
}

function MentorsSection() {
  const router = useRouter();
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-destructive" />
            <CardTitle>My Mentors</CardTitle>
          </div>
          <button onClick={() => router.push("/mentors")} className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-text-secondary text-center py-4">Belum memiliki mentor. Cari mentor yang sesuai dengan tujuanmu.</p>
      </CardContent>
    </Card>
  );
}

function OpportunitiesSection() {
  const router = useRouter();
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-accent" />
            <CardTitle>My Opportunities</CardTitle>
          </div>
          <button onClick={() => router.push("/opportunity")} className="text-xs font-semibold text-secondary hover:text-secondary/80 transition-colors cursor-pointer">
            Lihat Semua
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-text-secondary text-center py-4">Belum ada peluang yang disimpan. Jelajahi peluang yang tersedia.</p>
      </CardContent>
    </Card>
  );
}

function FamiliaProfileSection() {
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
            <CardTitle>Beautifio Familia</CardTitle>
          </div>
          <button onClick={() => router.push("/familia")} className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors cursor-pointer">
            Buka
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100">
            <Ticket size={16} className="text-amber-600" />
            <div>
              <span className="text-sm font-bold text-text-primary">{activeSessions.length}</span>
              <span className="text-[10px] text-text-secondary ml-1">Aktif</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100">
            <Ticket size={16} className="text-blue-600" />
            <div>
              <span className="text-sm font-bold text-text-primary">{redeemedSessions.length}</span>
              <span className="text-[10px] text-text-secondary ml-1">Tukar</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Achievement Rewards</p>
          <div className="space-y-1.5">
            {achievements.slice(0, 3).map((ar) => (
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
      </CardContent>
    </Card>
  );
}

function SafeSpaceSection() {
  const router = useRouter();
  const anonPosts = getAnonPosts();
  const myAnonPosts = anonPosts.filter((p: any) => p.postingMode === "anonymous");

  return (
    <Card padding="lg" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-purple-600" />
            <CardTitle>Safe Space</CardTitle>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-text-secondary">
            <Eye size={12} />
            <span>Private</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100">
            <span className="text-sm font-bold text-text-primary">{myAnonPosts.length}</span>
            <span className="text-[10px] text-text-secondary text-center">Anonymous Posts</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100">
            <span className="text-sm font-bold text-text-primary">0</span>
            <span className="text-[10px] text-text-secondary text-center">Safe Reports</span>
          </div>
          <div className="flex flex-col items-center p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100">
            <span className="text-sm font-bold text-text-primary">{RESOURCES.length}</span>
            <span className="text-[10px] text-text-secondary text-center">Resources</span>
          </div>
        </div>

        <button onClick={() => router.push("/inspirasi")} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 hover:bg-purple-50 transition-colors text-left cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <MessageCircle size={14} className="text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary">Tulis Cerita Anonim</p>
            <p className="text-[10px] text-text-secondary">Bagikan pengalamanmu dengan aman</p>
          </div>
          <ChevronRight size={14} className="text-text-secondary/30" />
        </button>
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

function LifeCapitalSection() {
  const profile = getLifeProfile();
  const capital = profile.lifeCapital;
  const avg = Math.round(Object.values(capital).reduce((a, b) => a + b, 0) / 6);
  const router = useRouter();
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={18} className="text-rose-500" />
            <CardTitle>Life Capital</CardTitle>
          </div>
          <button onClick={() => router.push("/life")} className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer">
            Detail
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100">
          <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <Heart size={20} className="text-rose-500" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-text-primary">Life Capital Score</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full" style={{ width: `${avg}%` }} />
              </div>
              <span className="text-sm font-bold text-rose-600">{avg}%</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {CAPITAL_CFG.map((c) => (
            <div key={c.key} className="flex items-center gap-3">
              <span className="text-sm w-5 text-center">{c.emoji}</span>
              <span className="text-[10px] font-medium text-text-secondary w-20 flex-shrink-0">{c.label}</span>
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${c.color}`} style={{ width: `${capital[c.key]}%` }} />
              </div>
              <span className="text-[11px] font-bold text-text-primary w-8 text-right">{capital[c.key]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function GrowthTrackerSection() {
  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          <CardTitle>Growth Tracker</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <GrowthTracker />
      </CardContent>
    </Card>
  );
}

function GamificationSection() {
  const achievements = FAMILIA_ACHIEVEMENT_REWARDS;
  const unlockedPct = Math.min(100, Math.round((0 / achievements.length) * 100));

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          <CardTitle>Gamification</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-amber-200/50" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="0 150.8" strokeLinecap="round" className="text-amber-500" />
            </svg>
            <span className="absolute text-xs font-bold text-text-primary">0%</span>
          </div>
          <div>
            <p className="text-xs font-bold text-text-primary">0 / 5.000</p>
            <p className="text-[10px] text-text-secondary">Growth Score — Bronze</p>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-500" />
              <span className="text-xs font-semibold text-text-primary">Streak</span>
            </div>
            <span className="text-xs font-bold text-text-primary">0 hari</span>
          </div>
          <ProgressBar value={0} size="sm" variant="accent" />
          <p className="text-[10px] text-text-secondary mt-1.5">30 hari lagi menuju 30 hari</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Achievements</span>
            <span className="text-[10px] text-text-secondary">{unlockedPct}%</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {achievements.slice(0, 4).map((ar) => (
              <div key={ar.id} className="flex items-center gap-2 p-2.5 rounded-xl border bg-muted/30 border-border opacity-60">
                <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center">
                  <Trophy size={12} className="text-text-secondary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-text-secondary truncate">{ar.title}</p>
                  <p className="text-[8px] text-text-secondary">Locked</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Badges</p>
          <p className="text-xs text-text-secondary text-center py-4">Selesaikan misi untuk membuka badge</p>
        </div>
      </CardContent>
    </Card>
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
      <h2 className="text-xl font-bold text-text-primary mb-2 text-center">Masuk untuk Melihat Dashboard</h2>
      <p className="text-sm text-text-secondary text-center mb-8 max-w-xs">
        Lihat perjalanan hidupmu, simpan progres, dan dapatkan benefit eksklusif.
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
  const [showSafeSpace, setShowSafeSpace] = useState(false);
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
            <Skeleton className="w-28 h-4 mt-2" />
            <div className="flex items-center gap-4 mt-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <Skeleton className="w-8 h-6" />
                  <Skeleton className="w-10 h-3" />
                </div>
              ))}
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return <LoginPrompt />;

  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";
  const displayInitials = user?.user_metadata?.full_name
    ? getInitials(user.user_metadata.full_name)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto pb-24">
        <IdentityHeader
          name={displayName}
          initials={displayInitials}
          bio={user?.email || ""}
          city=""
          interests={[]}
          currentGoal=""
          growthScore={0}
          streak={0}
          badges={[]}
          onEdit={() => {}}
        />

        <div className="px-6 space-y-5 mt-2">
          <JourneySection />
          <StoriesSection />
          <JournalsSection />
          <CirclesSection />
          <MentorsSection />
          <OpportunitiesSection />
          <LifeCapitalSection />
          <FamiliaProfileSection />
          <SafeSpaceSection />
          <GrowthTrackerSection />
          <GamificationSection />
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
