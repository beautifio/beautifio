"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Compass, Sparkles, ArrowRight, CheckCircle2, Circle,
  Sunrise, Sun, Moon,
} from "lucide-react";
import { Avatar, BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { useAuth } from "@/hooks/use-auth";
import type {
  DreamJourney, JourneyProgress, DailyActivity,
  JourneyDailyReflection, BigWin, SmallWin,
} from "@beautifio/types";

/* ─── GREETING ─── */

function Greeting({ userName, journey }: { userName: string; journey: DreamJourney | null }) {
  const router = useRouter();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Selamat Pagi" : hour < 17 ? "Selamat Siang" : "Selamat Malam";
  const GreetIcon = hour < 12 ? Sunrise : hour < 17 ? Sun : Moon;
  const initials = userName.split(" ").filter(Boolean).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary px-6 pt-8 pb-7 text-white">
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar initials={initials} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <GreetIcon size={14} className="text-white/80" />
                <h1 className="text-base font-bold">{greeting}, {userName}!</h1>
              </div>
              <p className="text-xs text-white/70 mt-0.5">
                Setiap langkah kecil membawamu lebih dekat ke impianmu.
              </p>
            </div>
          </div>
          {journey && (
            <button onClick={() => router.push(`/journey/${journey.id}`)} className="p-2 bg-white/15 rounded-xl hover:bg-white/25 transition-all cursor-pointer active:scale-90">
              <Sparkles size={16} />
            </button>
          )}
        </div>

        {journey && (
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3.5 backdrop-blur-sm">
            <span className="text-3xl">{journey.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold">{journey.title}</p>
              <p className="text-[10px] text-white/70">Apa mimpiku?</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SECTION: TARGETKU ─── */

function TargetSection({ progress }: { progress: JourneyProgress | null }) {
  const router = useRouter();
  const bw = progress?.current_big_win;
  const sw = progress?.current_small_win;

  return (
    <section>
      <h2 className="text-base font-bold text-text-primary mb-3">Apa targetku saat ini?</h2>
      <div className="p-4 rounded-2xl bg-surface border border-border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Compass size={20} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            {bw ? (
              <>
                <p className="text-sm font-bold text-text-primary">{bw.title}</p>
                {bw.description && (
                  <p className="text-xs text-text-secondary mt-1">{bw.description}</p>
                )}
                {sw && (
                  <div className="flex items-center gap-2 mt-2">
                    <Circle size={12} className="text-primary" />
                    <span className="text-xs text-text-secondary">{sw.title}</span>
                  </div>
                )}
                {progress && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-text-secondary">
                      Big Win {progress.big_wins_completed}/{progress.big_wins_total} · Small Win {progress.small_wins_completed}/{progress.small_wins_total}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-bold text-text-primary">Belum ada target</p>
                <p className="text-xs text-text-secondary mt-1">Aktifkan journey untuk melihat targetmu</p>
              </>
            )}
          </div>
          {bw && (
            <button
              onClick={() => router.push(`/journey/${(progress as any)?.journey_id || ""}`)}
              className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors cursor-pointer whitespace-nowrap"
            >
              Detail
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: HARI INI ─── */

function TodaySection({
  activities,
  progress,
  onComplete,
}: {
  activities: DailyActivity[];
  progress: JourneyProgress | null;
  onComplete: (id: string) => void;
}) {
  const done = progress?.completed_activities_today ?? 0;
  const total = progress?.total_activities_today ?? activities.length;

  if (total === 0) {
    return (
      <section>
        <h2 className="text-base font-bold text-text-primary mb-3">Apa yang harus kulakukan hari ini?</h2>
        <div className="p-4 rounded-2xl bg-surface border border-border text-center">
          <p className="text-sm text-text-secondary">Belum ada aktivitas hari ini.</p>
          <p className="text-xs text-text-secondary/60 mt-1">Mulai journey untuk mendapatkan aktivitas harian.</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-bold text-text-primary">Apa yang harus kulakukan hari ini?</h2>
        <span className="text-xs text-text-secondary">{done}/{total} selesai</span>
      </div>

      <div className="flex gap-1.5 mb-3">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i < done ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      <div className="space-y-1.5">
        {activities.map((a) => (
          <button
            key={a.id}
            onClick={() => !a.is_completed && onComplete(a.id)}
            disabled={a.is_completed}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:bg-muted/30 transition-all text-left cursor-pointer disabled:cursor-default"
          >
            {a.is_completed ? (
              <CheckCircle2 size={20} className="text-success flex-shrink-0" />
            ) : (
              <Circle size={20} className="text-text-secondary/30 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${a.is_completed ? "text-text-secondary line-through" : "text-text-primary"}`}>
                {a.title}
              </p>
              <p className="text-[10px] text-text-secondary/60">{a.dimension}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ─── SECTION: KEMAJUAN TERBARUKU ─── */

function RecentSection({
  reflection,
  progress,
}: {
  reflection: JourneyDailyReflection | null;
  progress: JourneyProgress | null;
}) {
  const done = progress?.completed_activities_today ?? 0;
  const total = progress?.total_activities_today ?? 0;

  return (
    <section>
      <h2 className="text-base font-bold text-text-primary mb-3">Apa kemajuan terbaruku?</h2>
      <div className="p-4 rounded-2xl bg-surface border border-border">
        {reflection ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-text-primary mb-1">Apa yang kupelajari hari ini?</p>
              <p className="text-xs text-text-secondary">{reflection.learned}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary mb-1">Yang kusyukuri hari ini</p>
              <p className="text-xs text-text-secondary">{reflection.grateful}</p>
            </div>
            {reflection.improve && (
              <div>
                <p className="text-xs font-semibold text-text-primary mb-1">Yang ingin kuperbaiki</p>
                <p className="text-xs text-text-secondary">{reflection.improve}</p>
              </div>
            )}
            {reflection.mood && (
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-text-secondary">Suasana hati: {reflection.mood}</span>
              </div>
            )}
          </div>
        ) : total > 0 ? (
          <>
            <p className="text-sm text-text-secondary">
              {done}/{total} aktivitas hari ini sudah selesai
            </p>
            {done === total && (
              <p className="text-xs text-text-secondary/60 mt-1">
                Bagus! Jangan lupa refleksikan harimu di halaman Journey.
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-text-secondary">Belum ada aktivitas hari ini.</p>
        )}
      </div>
    </section>
  );
}

/* ─── NO JOURNEY STATE ─── */

function NoJourney() {
  const router = useRouter();
  return (
    <section>
      <div className="p-6 rounded-2xl bg-surface border border-border text-center">
        <p className="text-sm text-text-secondary">Kamu belum memulai perjalanan.</p>
        <button
          onClick={() => router.push("/journey")}
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <Sparkles size={16} />
          Pilih Mimpi Pertamamu
        </button>
      </div>
    </section>
  );
}

/* ─── MAIN ─── */

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("home");
  const router = useRouter();
  const { user } = useAuth();

  const [journey, setJourney] = useState<DreamJourney | null>(null);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [reflection, setReflection] = useState<JourneyDailyReflection | null>(null);
  const [loading, setLoading] = useState(true);

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Sobat";

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { getActiveJourney, getJourneyProgress, getTodayActivities, getTodayReflection } = await import("@/lib/journey-queries");
        const j = await getActiveJourney(user.id);
        setJourney(j);
        if (j) {
          const p = await getJourneyProgress(user.id, j.id);
          setProgress(p);
          const acts = await getTodayActivities(user.id);
          setActivities(acts);
          const ref = await getTodayReflection(user.id);
          setReflection(ref);
        }
      } catch (e) {
        console.error("Failed to load journey data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleCompleteActivity = async (id: string) => {
    try {
      const { completeActivity } = await import("@/lib/journey-queries");
      await completeActivity(id);
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_completed: true, completed_at: new Date().toISOString() } : a))
      );
      if (progress) {
        setProgress({ ...progress, completed_activities_today: progress.completed_activities_today + 1 });
      }
    } catch (e) {
      console.error("Failed to complete activity", e);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-5 pb-24 space-y-6">
        <Greeting userName={userName} journey={journey} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : journey ? (
          <>
            <TargetSection progress={progress} />
            <TodaySection activities={activities} progress={progress} onComplete={handleCompleteActivity} />
            <RecentSection reflection={reflection} progress={progress} />
          </>
        ) : (
          <NoJourney />
        )}
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}
