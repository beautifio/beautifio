"use client";

import { useState, useMemo } from "react";
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
} from "@beautifio/utils";
import { RESOURCES, EMERGENCY_CONTACTS } from "@/lib/safe-space-data";
import type { Journal, FamiliaAchievementReward } from "@beautifio/types";
import { GrowthTracker } from "@/features/roadmap/components/GrowthTracker";

const MOCK_USER = {
  name: "Andini Putri",
  initials: "AP",
  email: "andini.putri@email.com",
  city: "Sleman, Yogyakarta",
  bio: "Frontend Developer | UI/UX Enthusiast | Lifelong Learner",
  interests: ["Frontend Dev", "UI/UX Design", "Data Science"],
  currentGoal: "Jadi Frontend Developer",
  growthScore: 2450,
  streak: 12,
  badges: [
    { id: "b1", label: "Early Adopter", icon: Star, color: "text-amber-500" },
    { id: "b2", label: "Journal Keeper", icon: BookOpen, color: "text-blue-500" },
    { id: "b3", label: "Circle Social", icon: Users, color: "text-green-500" },
    { id: "b4", label: "Story Seeker", icon: BookHeart, color: "text-purple-500" },
  ],
  goals: ["Jadi Frontend Developer", "Toefl 600+"],
  roadmap: { title: "Programmer", progress: 62, milestones: { done: 5, total: 8 } },
  discovery: { completed: true, mainGoal: "Frontend Developer", emoji: "💻" },
  circles: [
    { name: "Tech Founders", members: 8, role: "Anggota", activity: "Diskusi React Hooks" },
    { name: "Creative Lab", members: 6, role: "Anggota", activity: "Challenge Design" },
    { name: "Data Science ID", members: 9, role: "Anggota", activity: "Study Group" },
  ],
  savedStories: [
    { title: "Cara Belajar Efektif di Era Digital", slug: "cara-belajar-efektif-di-era-digital" },
    { title: "Panduan Membangun Karir di Industri Teknologi", slug: "panduan-membangun-karir-di-teknologi" },
  ],
  createdStories: [
    { title: "Perjalanan Belajar React", slug: "perjalanan-belajar-react", likes: 24, comments: 8 },
  ],
  likedStories: [
    { title: "Tips Produktivitas untuk Developer", slug: "tips-produktivitas-developer" },
  ],
  mentors: [
    { name: "Pak Rudi", initials: "RR", expertise: "Tech Entrepreneur", lastInteraction: "2 hari lalu" },
    { name: "Bu Sari", initials: "SS", expertise: "Leadership Coach", lastInteraction: "1 minggu lalu" },
  ],
  savedOpportunities: [
    { title: "Beasiswa Prestasi 2026", org: "Yayasan Nusantara Cerdas", type: "Beasiswa" },
    { title: "Program Magang Frontend", org: "TechStart Indonesia", type: "Magang" },
  ],
  appliedOpportunities: [
    { title: "Program Magang Frontend", org: "TechStart Indonesia", type: "Magang", status: "Pending" },
  ],
};

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
  growthScore: number; streak: number; badges: typeof MOCK_USER.badges;
  onEdit: () => void;
}) {
  const scoreLevel = growthScore >= 5000 ? "Diamond" : growthScore >= 2000 ? "Gold" : growthScore >= 500 ? "Silver" : "Bronze";
  const scoreColors = { Diamond: "from-cyan-400 to-blue-500", Gold: "from-amber-400 to-orange-500", Silver: "from-gray-300 to-gray-400", Bronze: "from-amber-700 to-amber-800" };

  return (
    <div className="bg-gradient-to-b from-bg to-surface">
      <div className="max-w-content mx-auto">
        <div className="relative pt-8 pb-4 px-6">
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar initials={initials} size="xl" />
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r ${scoreColors[scoreLevel]} flex items-center justify-center text-[10px] text-white font-bold shadow-md`}>
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-text-primary mt-4">{name}</h1>
            {bio && <p className="text-sm text-text-secondary mt-1 text-center max-w-xs">{bio}</p>}
            {city && (
              <div className="flex items-center gap-1.5 mt-2">
                <MapPin size={12} className="text-text-secondary/50" />
                <span className="text-xs text-text-secondary">{city}</span>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-1.5 mt-3">
              {interests.map((i) => (
                <Badge key={i} variant="accent" className="text-[10px]">{i}</Badge>
              ))}
            </div>

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
        {/* Discovery */}
        {discovery.completed ? (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <CheckCircle2 size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">Discovery Selesai</p>
              <p className="text-[10px] text-text-secondary">{discovery.answerCount} jawaban · {MOCK_USER.discovery.emoji} {MOCK_USER.discovery.mainGoal}</p>
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

        {/* Active Goal */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/10">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
            <Target size={18} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary">Goal Aktif</p>
            <p className="text-[10px] text-text-secondary">{MOCK_USER.goals[0]}</p>
          </div>
        </div>

        {/* Main Roadmap */}
        <div className="p-3 rounded-xl border border-border hover:border-primary/20 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GraduationCap size={16} className="text-secondary" />
              <span className="text-xs font-semibold text-text-primary">{MOCK_USER.roadmap.title}</span>
            </div>
            <Badge variant="secondary">Aktif</Badge>
          </div>
          <ProgressBar value={MOCK_USER.roadmap.progress} size="sm" variant="accent" showLabel />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-text-secondary">{MOCK_USER.roadmap.milestones.done} dari {MOCK_USER.roadmap.milestones.total} milestone</span>
            <div className="flex items-center gap-1">
              <Trophy size={12} className="text-accent" />
              <span className="text-[10px] font-semibold text-accent">{MOCK_USER.roadmap.progress}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StoriesSection() {
  const router = useRouter();
  const anonPosts = getAnonPosts();
  const totalCreated = anonPosts.length + MOCK_USER.createdStories.length;

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
            <span className="text-lg font-bold text-text-primary">{totalCreated}</span>
            <span className="text-[10px] text-text-secondary">Dibuat</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-accent/5 border border-accent/10">
            <span className="text-lg font-bold text-text-primary">{MOCK_USER.savedStories.length}</span>
            <span className="text-[10px] text-text-secondary">Tersimpan</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-xl bg-secondary/5 border border-secondary/10">
            <span className="text-lg font-bold text-text-primary">{MOCK_USER.likedStories.length}</span>
            <span className="text-[10px] text-text-secondary">Disukai</span>
          </div>
        </div>

        {MOCK_USER.savedStories.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Tersimpan</p>
            <div className="space-y-1">
              {MOCK_USER.savedStories.map((story, i) => (
                <button key={i} onClick={() => router.push(`/cerita/${story.slug}`)} className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors text-left cursor-pointer">
                  <Bookmark size={14} className="text-text-secondary/40 flex-shrink-0" />
                  <span className="text-xs text-text-primary truncate flex-1">{story.title}</span>
                  <ChevronRight size={14} className="text-text-secondary/20 flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
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
      <CardContent className="space-y-2">
        {MOCK_USER.circles.map((circle, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer border border-border">
            <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Circle size={16} className="text-secondary/50" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{circle.name}</p>
              <p className="text-[10px] text-text-secondary">{circle.members} anggota · {circle.activity}</p>
            </div>
            <Badge variant="default">{circle.role}</Badge>
          </div>
        ))}
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
      <CardContent className="space-y-2">
        {MOCK_USER.mentors.map((mentor, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer border border-border">
            <Avatar initials={mentor.initials} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">{mentor.name}</p>
              <p className="text-[10px] text-text-secondary">{mentor.expertise}</p>
            </div>
            <span className="text-[10px] text-text-secondary">{mentor.lastInteraction}</span>
          </div>
        ))}
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
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="accent" className="text-[10px]">
            Disimpan ({MOCK_USER.savedOpportunities.length})
          </Badge>
          <Badge variant="success" className="text-[10px]">
            Dilamar ({MOCK_USER.appliedOpportunities.length})
          </Badge>
        </div>
        {MOCK_USER.savedOpportunities.map((opp, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer border border-border">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
              <Briefcase size={16} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary truncate">{opp.title}</p>
              <p className="text-[10px] text-text-secondary">{opp.org}</p>
            </div>
            <Badge variant="accent" className="text-[10px]">{opp.type}</Badge>
          </div>
        ))}
        {MOCK_USER.appliedOpportunities.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mt-3 mb-1">Dilamar</p>
            {MOCK_USER.appliedOpportunities.map((opp, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">{opp.title}</p>
                  <p className="text-[10px] text-text-secondary">{opp.org}</p>
                </div>
                <Badge variant="success" className="text-[10px]">{opp.status}</Badge>
              </div>
            ))}
          </div>
        )}
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
  const streakDays = MOCK_USER.streak;
  const maxStreak = 30;
  const streakPct = Math.min(100, (streakDays / maxStreak) * 100);

  const achievements = FAMILIA_ACHIEVEMENT_REWARDS;
  const unlockedPct = Math.min(100, Math.round((2 / achievements.length) * 100));

  return (
    <Card padding="lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          <CardTitle>Gamification</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Growth Score */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-amber-200/50" />
              <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${(MOCK_USER.growthScore / 5000) * 150.8} 150.8`} strokeLinecap="round" className="text-amber-500" />
            </svg>
            <span className="absolute text-xs font-bold text-text-primary">{Math.round((MOCK_USER.growthScore / 5000) * 100)}%</span>
          </div>
          <div>
            <p className="text-xs font-bold text-text-primary">{MOCK_USER.growthScore.toLocaleString()} / 5.000</p>
            <p className="text-[10px] text-text-secondary">Growth Score — Level {MOCK_USER.growthScore >= 5000 ? "Diamond" : MOCK_USER.growthScore >= 2000 ? "Gold" : MOCK_USER.growthScore >= 500 ? "Silver" : "Bronze"}</p>
          </div>
        </div>

        {/* Streak */}
        <div className="p-3 rounded-xl border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-500" />
              <span className="text-xs font-semibold text-text-primary">Streak</span>
            </div>
            <span className="text-xs font-bold text-text-primary">{streakDays} hari</span>
          </div>
          <ProgressBar value={streakPct} size="sm" variant="accent" />
          <p className="text-[10px] text-text-secondary mt-1.5">{maxStreak - streakDays} hari lagi menuju 30 hari</p>
        </div>

        {/* Achievements */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">Achievements</span>
            <span className="text-[10px] text-text-secondary">{unlockedPct}%</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {achievements.slice(0, 4).map((ar) => {
              const isUnlocked = ["discovery_complete", "mentor_program"].includes(ar.trigger_type);
              return (
                <div key={ar.id} className={`flex items-center gap-2 p-2.5 rounded-xl border ${isUnlocked ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200" : "bg-muted/30 border-border opacity-60"}`}>
                  <div className={`w-7 h-7 rounded-lg ${isUnlocked ? `bg-gradient-to-r ${ar.color || "from-emerald-500 to-teal-500"}` : "bg-muted"} flex items-center justify-center`}>
                    <Trophy size={12} className={isUnlocked ? "text-white" : "text-text-secondary"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[10px] font-semibold ${isUnlocked ? "text-text-primary" : "text-text-secondary"} truncate`}>{ar.title}</p>
                    <p className="text-[8px] text-text-secondary">{isUnlocked ? "Unlocked" : "Locked"}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div>
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-2">Badges</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {MOCK_USER.badges.map((b) => (
              <div key={b.id} className="flex flex-col items-center gap-1 min-w-[64px]">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-100 flex items-center justify-center">
                  <b.icon size={18} className={b.color} />
                </div>
                <span className="text-[9px] text-text-secondary text-center leading-tight">{b.label}</span>
              </div>
            ))}
          </div>
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
    { icon: Circle, label: "Notifikasi" },
    { icon: BookOpen, label: "Kebijakan Privasi" },
    { icon: LogOut, label: "Keluar", danger: true, action: signOut },
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
          city={MOCK_USER.city}
          interests={MOCK_USER.interests}
          currentGoal={MOCK_USER.currentGoal}
          growthScore={MOCK_USER.growthScore}
          streak={MOCK_USER.streak}
          badges={MOCK_USER.badges}
          onEdit={() => {}}
        />

        <div className="px-6 space-y-5 mt-2">
          <JourneySection />
          <StoriesSection />
          <JournalsSection />
          <CirclesSection />
          <MentorsSection />
          <OpportunitiesSection />
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
