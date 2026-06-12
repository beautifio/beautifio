"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Compass, Sparkles, Flame, ArrowRight,
  Settings, LogOut, LogIn, User,
  BookOpen, BookHeart, Users, Heart,
  Shield, ChevronRight, CheckCircle2, Circle,
} from "lucide-react";
import {
  Card, CardHeader, CardTitle, CardContent, Avatar,
  BottomNavigation, Button, Skeleton,
} from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import type { DreamJourney, JourneyProgress, DailyActivity, GrowthTimelineEvent } from "@beautifio/types";

/* ─── PROFILE HERO ─── */

function ProfileHero({ journey, progress }: { journey: DreamJourney | null; progress: JourneyProgress | null }) {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Pengguna";
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").filter(Boolean).map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="bg-gradient-to-b from-bg to-surface">
      <div className="max-w-content mx-auto">
        <div className="relative pt-8 pb-6 px-6">
          <div className="flex flex-col items-center">
            <Avatar initials={initials} size="xl" />
            <h1 className="text-xl font-bold text-text-primary mt-4">{displayName}</h1>

            {journey ? (
              <div className="mt-4 w-full max-w-sm p-4 rounded-2xl bg-gradient-to-r from-accent/10 to-primary/10 border border-accent/20 text-center">
                <span className="text-3xl block mb-2">{journey.emoji}</span>
                <p className="text-sm font-bold text-text-primary">{journey.title}</p>
                {progress?.current_big_win && (
                  <>
                    <div className="w-8 h-0.5 bg-accent/30 mx-auto my-2" />
                    <p className="text-xs text-text-secondary">
                      🏆 {progress.current_big_win.title}
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="mt-4 w-full max-w-sm p-4 rounded-2xl bg-accent/5 border border-dashed border-accent/30 text-center">
                <p className="text-sm text-text-secondary">Belum memiliki perjalanan</p>
                <p className="text-xs text-text-secondary/60 mt-1">Pilih mimpi dan mulai perjalananmu</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── PERJALANAN HIDUP SAYA ─── */

function MyJourneySection({ journey, progress, activities, timeline }: {
  journey: DreamJourney | null;
  progress: JourneyProgress | null;
  activities: DailyActivity[];
  timeline: GrowthTimelineEvent[];
}) {
  const router = useRouter();

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
              <CardTitle>Perjalanan Hidup Saya</CardTitle>
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
              {progress?.current_small_win && (
                <p className="text-xs text-text-secondary/70 ml-4">→ {progress.current_small_win.title}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Flame size={14} className="text-accent" />
            <span className="text-xs text-text-secondary">
              {completedToday}/{totalToday} hari ini
            </span>
            {progress && (
              <span className="text-xs text-text-secondary/60 ml-auto">
                Big Win {progress.big_wins_completed}/{progress.big_wins_total}
              </span>
            )}
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

          {activities.length > 0 && (
            <div className="mt-2 space-y-1">
              {activities.slice(0, 4).map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-xs text-text-secondary">
                  {a.is_completed ? (
                    <CheckCircle2 size={10} className="text-success" />
                  ) : (
                    <Circle size={10} className="text-text-secondary/30" />
                  )}
                  <span className={a.is_completed ? "line-through opacity-60" : ""}>
                    {a.title}
                  </span>
                </div>
              ))}
              {activities.length > 4 && (
                <p className="text-[10px] text-text-secondary/60">+{activities.length - 4} lainnya</p>
              )}
            </div>
          )}

          {timeline.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <p className="text-[11px] font-medium text-text-primary mb-1">Cerita Terbaru</p>
              <p className="text-xs text-text-secondary italic">
                "{timeline[0].title}"
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── REFLEKSI TERBARU ─── */

function RecentReflections({ journey, progress }: { journey: DreamJourney | null; progress: JourneyProgress | null }) {
  const reflection = progress?.today_reflection;

  if (!journey || !reflection) return null;

  return (
    <div className="px-6">
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookHeart size={18} className="text-primary" />
            <CardTitle>Refleksi Terbaru</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-text-primary mb-1">Apa yang kupelajari hari ini?</p>
              <p className="text-xs text-text-secondary">{reflection.learned}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary mb-1">Yang kusyukuri</p>
              <p className="text-xs text-text-secondary">{reflection.grateful}</p>
            </div>
            {reflection.improve && (
              <div>
                <p className="text-xs font-semibold text-text-primary mb-1">Yang ingin kuperbaiki</p>
                <p className="text-xs text-text-secondary">{reflection.improve}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── DUKUNGAN ─── */

function SupportSystem() {
  const router = useRouter();

  return (
    <div className="px-6">
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-purple-600" />
            <CardTitle>Dukungan Untukku</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <button onClick={() => router.push("/circle")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/5 border border-secondary/20 hover:bg-secondary/10 transition-colors text-left cursor-pointer">
            <Users size={16} className="text-secondary" />
            <span className="text-xs font-semibold text-text-primary flex-1">Circle</span>
            <ChevronRight size={14} className="text-text-secondary/30" />
          </button>
          <button onClick={() => router.push("/mentors")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-destructive/5 border border-destructive/20 hover:bg-destructive/10 transition-colors text-left cursor-pointer">
            <Heart size={16} className="text-destructive" />
            <span className="text-xs font-semibold text-text-primary flex-1">Mentor</span>
            <ChevronRight size={14} className="text-text-secondary/30" />
          </button>
          <button onClick={() => router.push("/inspirasi")} className="w-full flex items-center gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 hover:bg-purple-100/50 transition-colors text-left cursor-pointer">
            <Shield size={16} className="text-purple-600" />
            <span className="text-xs font-semibold text-text-primary flex-1">Safe Space</span>
            <ChevronRight size={14} className="text-text-secondary/30" />
          </button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── PENGATURAN ─── */

function SettingsSection() {
  const { signOut } = useAuth();

  return (
    <div className="px-6">
      <Card padding="lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-text-secondary" />
            <CardTitle>Pengaturan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          {[
            { icon: User, label: "Edit Profil" },
            { icon: BookOpen, label: "Kebijakan Privasi" },
            { icon: LogOut, label: "Keluar", danger: true, action: async () => { await signOut(); window.location.href = "/"; } },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button
                key={i}
                onClick={item.action}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl hover:bg-muted/30 transition-colors text-left cursor-pointer ${i < 2 ? "border-b border-border" : ""}`}
              >
                <Icon size={16} className={item.danger ? "text-destructive" : "text-text-secondary"} />
                <span className={`text-sm flex-1 ${item.danger ? "text-destructive font-medium" : "text-text-primary"}`}>{item.label}</span>
                <ChevronRight size={16} className="text-text-secondary/30" />
              </button>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── LOGIN ─── */

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

/* ─── MAIN ─── */

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("profil");
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [journey, setJourney] = useState<DreamJourney | null>(null);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [timeline, setTimeline] = useState<GrowthTimelineEvent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadProfileData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setDataError(null);
    try {
      const { getActiveJourney, getJourneyProgress, getTimeline } = await import("@/lib/journey-queries");
      const j = await getActiveJourney(user.id);
      setJourney(j);
      if (j) {
        const [p, t] = await Promise.all([
          getJourneyProgress(user.id, j.id),
          getTimeline(user.id, j.id, 3),
        ]);
        setProgress(p);
        setActivities(p.today_activities);
        setTimeline(t);
      }
    } catch (e) {
      console.error("Failed to load journey", e);
      setDataError("Gagal memuat data perjalanan. Silakan coba lagi.");
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto px-6 pt-6 pb-24 space-y-6">
          <div className="flex flex-col items-center pt-4 pb-6">
            <Skeleton className="w-20 h-20 rounded-full mb-4" />
            <Skeleton className="w-36 h-6 mb-2" />
            <Skeleton className="w-56 h-4" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) return <LoginPrompt />;

  if (dataError) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-content mx-auto flex flex-col items-center justify-center text-center">
        <p className="text-destructive font-medium mb-4">{dataError}</p>
        <Button variant="primary" size="sm" onClick={loadProfileData}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto px-6 pt-6 pb-24 space-y-6">
          <div className="flex flex-col items-center pt-4 pb-6">
            <Skeleton className="w-20 h-20 rounded-full mb-4" />
            <Skeleton className="w-36 h-6 mb-2" />
            <Skeleton className="w-56 h-4" />
          </div>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-full h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto pb-24 space-y-5">
        <ProfileHero journey={journey} progress={progress} />
        <MyJourneySection journey={journey} progress={progress} activities={activities} timeline={timeline} />
        <RecentReflections journey={journey} progress={progress} />
        <SupportSystem />
        <SettingsSection />
      </div>

      <BottomNavigation
        items={NAV_TABS}
        activeTab={activeTab}
        onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }}
      />
    </div>
  );
}
