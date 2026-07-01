"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, History, Calendar, BarChart3, CalendarDays, Sparkles, CheckCircle, BookHeart, Sun } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@beautifio/ui";
import { StoryTimeline } from "@/features/story/story-timeline";
import { WeeklyReviewSection } from "@/features/story/weekly-review";
import { MonthlyReviewSection } from "@/features/story/monthly-review";
import { CalendarHistory } from "@/features/story/calendar-history";
import type { StoryEntry } from "@/lib/journey-queries";

type Tab = "timeline" | "calendar" | "weekly" | "monthly";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function daysAgo(dateStr: string): number {
  const d = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
}

function WeekSummary({ entries }: { entries: StoryEntry[] }) {
  const weekEntries = useMemo(() => {
    return entries.filter((e) => daysAgo(e.date) < 7);
  }, [entries]);

  if (weekEntries.length === 0) return null;

  const smallWins = weekEntries.filter((e) => e.type === "small_win").length;
  const reflections = weekEntries.filter((e) => e.type === "reflection" && e.learned).length;
  const bigWins = weekEntries.filter((e) => e.type === "big_win").length;
  const latestReflection = [...weekEntries]
    .reverse()
    .find((e) => e.type === "reflection" && e.improve);

  return (
    <div className="bg-gradient-to-br from-accent/5 to-primary/5 rounded-2xl border border-accent/10 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sun size={16} className="text-accent" />
        <p className="text-sm font-bold text-text-primary">Minggu Ini</p>
      </div>
      <div className="flex gap-4 mb-3">
        {bigWins > 0 && (
          <div className="flex items-center gap-1.5">
            <Sparkles size={14} className="text-success" />
            <span className="text-xs text-text-secondary">{bigWins} big win</span>
          </div>
        )}
        {smallWins > 0 && (
          <div className="flex items-center gap-1.5">
            <CheckCircle size={14} className="text-accent" />
            <span className="text-xs text-text-secondary">{smallWins} small win</span>
          </div>
        )}
        {reflections > 0 && (
          <div className="flex items-center gap-1.5">
            <BookHeart size={14} className="text-primary" />
            <span className="text-xs text-text-secondary">{reflections} refleksi</span>
          </div>
        )}
      </div>
      {latestReflection?.improve && (
        <p className="text-xs text-text-secondary/70 leading-relaxed">
          Fokus minggu depan: {latestReflection.improve}
        </p>
      )}
    </div>
  );
}

function MonthSummary({ entries }: { entries: StoryEntry[] }) {
  const monthEntries = useMemo(() => {
    return entries.filter((e) => daysAgo(e.date) < 30);
  }, [entries]);

  if (monthEntries.length === 0) return null;

  const smallWins = monthEntries.filter((e) => e.type === "small_win").length;
  const reflections = monthEntries.filter((e) => e.type === "reflection" && e.learned).length;
  const bigWins = monthEntries.filter((e) => e.type === "big_win").length;
  const latestGrateful = [...monthEntries]
    .reverse()
    .find((e) => e.type === "reflection" && e.grateful);

  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={16} className="text-primary" />
        <p className="text-sm font-bold text-text-primary">Bulan Ini</p>
      </div>
      <div className="space-y-1.5 mb-3">
        {bigWins > 0 && (
          <p className="text-xs text-text-secondary">🎉 {bigWins} big win selesai</p>
        )}
        <p className="text-xs text-text-secondary">✅ {smallWins} small win selesai</p>
        <p className="text-xs text-text-secondary">📝 {reflections} refleksi ditulis</p>
      </div>
      {latestGrateful?.grateful && (
        <div className="pt-3 border-t border-border">
          <p className="text-[11px] text-text-secondary/50 mb-1">Hal yang kamu syukuri:</p>
          <p className="text-xs text-text-secondary leading-relaxed italic">
            "{latestGrateful.grateful}"
          </p>
        </div>
      )}
    </div>
  );
}

export default function StoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("timeline");
  const [entries, setEntries] = useState<StoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { getStoryEntries } = await import("@/lib/journey-queries");
      const data = await getStoryEntries(user.id);
      setEntries(data);
    } catch (e) {
      // console.error("Failed to load story:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-content mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/profil")}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Kembali ke Profil
        </button>

        <h1 className="text-xl font-bold text-text-primary mb-1">Ceritaku</h1>
        <p className="text-sm text-text-secondary/60 mb-6">
          Perjalanan, refleksi, dan perubahanmu dari waktu ke waktu.
        </p>

        <div className="flex gap-1 mb-6 bg-muted rounded-xl p-1">
          <TabButton active={tab === "timeline"} onClick={() => setTab("timeline")} icon={<History size={14} />} label="Timeline" />
          <TabButton active={tab === "calendar"} onClick={() => setTab("calendar")} icon={<CalendarDays size={14} />} label="Kalender" />
          <TabButton active={tab === "weekly"} onClick={() => setTab("weekly")} icon={<Calendar size={14} />} label="Mingguan" />
          <TabButton active={tab === "monthly"} onClick={() => setTab("monthly")} icon={<BarChart3 size={14} />} label="Bulanan" />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="w-full h-20 rounded-xl" />
            ))}
          </div>
        ) : tab === "timeline" ? (
          <div className="space-y-4">
            <WeekSummary entries={entries} />
            <MonthSummary entries={entries} />
            <StoryTimeline entries={entries} />
          </div>
        ) : tab === "calendar" ? (
          <CalendarHistory userId={user.id} />
        ) : tab === "weekly" ? (
          <WeeklyReviewSection userId={user.id} onReviewSaved={loadData} />
        ) : (
          <MonthlyReviewSection userId={user.id} onReviewSaved={loadData} />
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
        active
          ? "bg-surface text-text-primary shadow-sm"
          : "text-text-secondary/60 hover:text-text-primary"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
