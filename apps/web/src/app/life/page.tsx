"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Compass, Heart, Target, Trophy, Sparkles, TrendingUp,
  RefreshCw, Quote, ChevronRight, Settings, Lock, Unlock,
  ArrowUp, ArrowDown, CheckCircle2, Circle, Flame,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import {
  getLifeProfile, isOnboardingComplete, updateZone,
  generateDailyWins, ZONE_INFO, STAGE_INFO,
  getStageProgression, getAllGrowthWins, ROADMAP_V3_SEED,
  getLifeLevel, getLifeLevelProgress,
  getCapitalOverview, getCapitalBalanceTips,
  generateDailyMissions, completeMission,
  getAvailableUnlocks, rewardAfterFailure, CAPITAL_SOURCES,
  earnCapital,
} from "@beautifio/utils";
import type { LifeCapital, GrowthWin, CapitalMission, UnlockRequirement, CapitalBalanceTip } from "@beautifio/types";

const CAPITAL_CONFIG: { key: keyof LifeCapital; label: string; emoji: string; color: string }[] = [
  { key: "knowledge", label: "Pengetahuan", emoji: "📚", color: "from-blue-500 to-blue-600" },
  { key: "skill", label: "Skill", emoji: "⚡", color: "from-amber-500 to-orange-500" },
  { key: "health", label: "Kesehatan", emoji: "💪", color: "from-green-500 to-emerald-600" },
  { key: "relationship", label: "Relasi", emoji: "👥", color: "from-pink-500 to-rose-500" },
  { key: "character", label: "Karakter", emoji: "⭐", color: "from-purple-500 to-violet-600" },
  { key: "spiritual", label: "Spiritual", emoji: "🕊️", color: "from-indigo-500 to-blue-600" },
];

export const dynamic = "force-dynamic";

function TrendBadge({ value }: { value: number }) {
  if (value === 0) return null;
  return (
    <span className={`flex items-center gap-0.5 text-[9px] font-bold ${value > 0 ? "text-success" : "text-destructive"}`}>
      {value > 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {Math.abs(value)}
    </span>
  );
}

function LifeLevelCard({ total }: { total: number }) {
  const { current, next, progress } = getLifeLevelProgress(total);
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{current.emoji}</span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Life Level</p>
          <h2 className="text-lg font-bold text-text-primary">{current.label}</h2>
        </div>
        <div className="ml-auto text-right">
          <p className="text-2xl font-bold text-primary">{total}</p>
          <p className="text-[9px] text-text-secondary">total capital</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">{current.emoji}</span>
        <div className="flex-1 h-2.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
        </div>
        {next && <span className="text-xs text-text-secondary">{next.emoji}</span>}
      </div>
      {next && (
        <p className="text-[10px] text-text-secondary mt-1.5 text-center">
          {progress}% menuju {next.label} ({next.minCapital - total} poin lagi)
        </p>
      )}
      <p className="text-[11px] text-text-secondary mt-2 leading-relaxed">{current.description}</p>
    </div>
  );
}

function CapitalBarWithTrend({ value, weekly, monthly, label, emoji, color }: {
  value: number; weekly: number; monthly: number;
  label: string; emoji: string; color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{emoji}</span>
          <span className="text-[11px] font-semibold text-text-primary">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendBadge value={weekly} />
          <span className="text-xs font-bold text-text-primary">{value}</span>
        </div>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`} style={{ width: `${value}%` }} />
      </div>
      <div className="flex justify-between text-[8px] text-text-secondary">
        <span>M: {monthly > 0 ? `+${monthly}` : monthly}</span>
        <span>W: {weekly > 0 ? `+${weekly}` : weekly}</span>
      </div>
    </div>
  );
}

function BalanceCard({ tips, strongest, weakest }: {
  tips: CapitalBalanceTip[]; strongest: string; weakest: string;
}) {
  const strongCfg = CAPITAL_CONFIG.find((c) => c.key === strongest);
  const weakCfg = CAPITAL_CONFIG.find((c) => c.key === weakest);
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-50/80 to-rose-50/80 dark:from-amber-900/10 dark:to-rose-900/10 border border-amber-200/50">
      <h3 className="text-xs font-bold text-text-primary flex items-center gap-2 mb-3">
        <TrendingUp size={14} className="text-amber-600" />
        Balance Engine
      </h3>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5">
          <p className="text-[9px] text-text-secondary">Terkuat</p>
          <p className="text-xs font-bold text-text-primary">{strongCfg?.emoji} {strongCfg?.label}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5">
          <p className="text-[9px] text-text-secondary">Terlemah</p>
          <p className="text-xs font-bold text-text-primary">{weakCfg?.emoji} {weakCfg?.label}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {tips.slice(0, 2).map((tip) => (
          <div key={tip.capitalKey} className="flex items-start gap-2 p-2 rounded-lg bg-white/40 dark:bg-white/5">
            <span className="text-base">{tip.emoji}</span>
            <div>
              <p className="text-[10px] font-semibold text-text-primary capitalize">{tip.label}: {tip.value}</p>
              <p className="text-[9px] text-text-secondary">{tip.tip}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MissionCard({ mission, onComplete }: { mission: CapitalMission; onComplete: (id: string) => void }) {
  return (
    <div className={`p-3 rounded-xl border transition-all ${mission.status === "completed" ? "border-success/30 bg-success/5" : "border-border bg-surface"}`}>
      <div className="flex items-center gap-3">
        <span className="text-lg">{mission.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${mission.status === "completed" ? "text-success line-through" : "text-text-primary"}`}>
            {mission.title}
          </p>
          <p className="text-[10px] text-text-secondary">{mission.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={mission.status === "completed" ? "success" : "default"} className="text-[9px]">
            +{mission.points}
          </Badge>
          {mission.status === "active" && (
            <button onClick={() => onComplete(mission.id)}
              className="w-7 h-7 rounded-lg bg-accent/10 hover:bg-accent/20 flex items-center justify-center cursor-pointer transition-colors"
            >
              <CheckCircle2 size={14} className="text-accent" />
            </button>
          )}
          {mission.status === "completed" && <CheckCircle2 size={14} className="text-success" />}
        </div>
      </div>
    </div>
  );
}

function UnlockCard({ unlocks }: { unlocks: UnlockRequirement[] }) {
  const available = unlocks.filter((u) => u.unlocked);
  const locked = unlocks.filter((u) => !u.unlocked);
  return (
    <div className="space-y-2">
      {available.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Unlock size={12} /> Tersedia
          </p>
          <div className="space-y-1.5">
            {available.slice(0, 3).map((u) => (
              <div key={u.feature} className="flex items-center gap-2 p-2.5 rounded-xl bg-success/5 border border-success/20">
                <span className="text-base">{u.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-text-primary">{u.label}</p>
                  <p className="text-[9px] text-text-secondary">{u.description}</p>
                </div>
                <Unlock size={12} className="text-success flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
      {locked.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <Lock size={12} /> Terkunci
          </p>
          <div className="space-y-1.5">
            {locked.slice(0, 2).map((u) => {
              const reqs = Object.entries(u.requirements)
                .map(([k, v]) => `${CAPITAL_CONFIG.find((c) => c.key === k)?.emoji} ${v}`).join(" · ");
              return (
                <div key={u.feature} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border">
                  <span className="text-base opacity-50">{u.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-text-secondary">{u.label}</p>
                    <p className="text-[9px] text-text-secondary">{reqs}</p>
                  </div>
                  <Lock size={12} className="text-text-secondary/30 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LifeDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const profile = useMemo(() => getLifeProfile(), []);
  const [zone, setZone] = useState(profile.currentZone);
  const [overview, setOverview] = useState(() => getCapitalOverview());
  const [balanceTips, setBalanceTips] = useState(() => getCapitalBalanceTips());
  const [missions, setMissions] = useState<CapitalMission[]>([]);
  const [unlocks, setUnlocks] = useState(() => getAvailableUnlocks());
  const growthWins = useMemo(() => getAllGrowthWins(), []);

  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.replace("/life/start");
      return;
    }
    const currentZone = updateZone();
    setZone(currentZone);
    setOverview(getCapitalOverview());
    setBalanceTips(getCapitalBalanceTips());
    setMissions(generateDailyMissions());
    setUnlocks(getAvailableUnlocks());
  }, []);

  const dreamTitle = profile.currentDreamSlug
    ? ROADMAP_V3_SEED[profile.currentDreamSlug]?.title ?? profile.currentDreamSlug
    : null;

  // Scroll to section on hash change
  const handleSection = (hash: string) => {
    const el = document.getElementById(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Life Capital</h1>
            <p className="text-[10px] text-text-secondary mt-0.5">
              {overview.level.emoji} {overview.level.label} · {overview.average}% rata-rata
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push("/life/start")}
              className="p-2 rounded-xl bg-muted hover:bg-muted/70 transition-all cursor-pointer"
              title="Settings"
            >
              <RefreshCw size={16} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Life Level */}
        <LifeLevelCard total={overview.total} />

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-xs font-bold text-primary">{overview.average}</p>
            <p className="text-[8px] text-text-secondary">Capital</p>
          </div>
          <button onClick={() => handleSection("capital")}
            className="p-2.5 rounded-xl bg-accent/5 border border-accent/10 text-center cursor-pointer hover:bg-accent/10 transition-colors"
          >
            <p className="text-xs font-bold text-accent">{overview.level.emoji}</p>
            <p className="text-[8px] text-text-secondary">Level</p>
          </button>
          <button onClick={() => handleSection("missions")}
            className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 text-center cursor-pointer hover:bg-amber-100/50 transition-colors"
          >
            <p className="text-xs font-bold text-amber-600">{missions.filter((m) => m.status === "active").length}</p>
            <p className="text-[8px] text-text-secondary">Misi</p>
          </button>
          <button onClick={() => handleSection("unlocks")}
            className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 text-center cursor-pointer hover:bg-purple-100/50 transition-colors"
          >
            <p className="text-xs font-bold text-purple-600">{unlocks.filter((u) => u.unlocked).length}</p>
            <p className="text-[8px] text-text-secondary">Unlock</p>
          </button>
        </div>

        {/* Capital Details */}
        <div id="capital">
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-rose-500" />
                  <CardTitle>6 Capitals</CardTitle>
                </div>
                <span className="text-[10px] text-text-secondary">W ↑ weekly · M ↑ monthly</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {CAPITAL_CONFIG.map((cfg) => (
                <CapitalBarWithTrend
                  key={cfg.key}
                  value={overview.trends[cfg.key].value}
                  weekly={overview.trends[cfg.key].weekly}
                  monthly={overview.trends[cfg.key].monthly}
                  label={cfg.label}
                  emoji={cfg.emoji}
                  color={cfg.color}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Balance Engine */}
        <BalanceCard tips={balanceTips} strongest={overview.strongest} weakest={overview.weakest} />

        {/* Capital Missions */}
        <div id="missions">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Target size={14} className="text-accent" />
              Capital Missions
            </h3>
            <Badge variant="accent" className="text-[9px]">{missions.filter((m) => m.status === "active").length} aktif</Badge>
          </div>
          <div className="space-y-2">
            {missions.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onComplete={(id) => {
                  completeMission(id);
                  setMissions(generateDailyMissions());
                  setOverview(getCapitalOverview());
                  setBalanceTips(getCapitalBalanceTips());
                }}
              />
            ))}
          </div>
        </div>

        {/* Unlock System */}
        <div id="unlocks">
          <Card padding="lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <CardTitle>Unlocks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <UnlockCard unlocks={unlocks} />
            </CardContent>
          </Card>
        </div>

        {/* Growth Wins */}
        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-success" />
              <CardTitle>Growth Wins</CardTitle>
              <Badge variant="success" className="text-[9px] ml-auto">{profile.resilienceScore} resilience</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <GrowthWinsList wins={growthWins} />
          </CardContent>
        </Card>

        {/* Dream */}
        {dreamTitle && (
          <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-3">
              <Target size={18} className="text-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Impian Saat Ini</p>
                <p className="text-sm font-bold text-text-primary truncate">{dreamTitle}</p>
              </div>
              <button onClick={() => router.push(`/roadmap/${profile.currentDreamSlug}`)}
                className="text-xs font-semibold text-accent hover:underline cursor-pointer"
              >
                Buka
              </button>
            </div>
          </div>
        )}

        {/* Zone Card */}
        <ZoneCard zone={zone} />

        {/* Settings */}
        <button onClick={() => router.push("/life/start")}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface border border-border hover:border-primary/20 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">Konfigurasi Life Engine</p>
              <p className="text-[10px] text-text-secondary">Ubah tahap hidup, zona, atau preferensi spiritual</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-secondary/30" />
        </button>
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}

/* ─── Sub-components ─── */

function ZoneCard({ zone }: { zone: string }) {
  const info = ZONE_INFO[zone];
  if (!info) return null;
  return (
    <div className={`rounded-2xl p-5 border ${
      zone === "comfort" ? "bg-blue-50/50 border-blue-100" :
      zone === "fear" ? "bg-amber-50/50 border-amber-100" :
      zone === "learning" ? "bg-green-50/50 border-green-100" :
      "bg-purple-50/50 border-purple-100"
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{info.emoji}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Growth Zone</p>
          <h2 className="text-lg font-bold text-text-primary">{info.label}</h2>
        </div>
      </div>
      <p className="text-sm text-text-secondary leading-relaxed">{info.description}</p>
      <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-white/60 dark:bg-white/5">
        <Quote size={14} className="text-text-secondary/40 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-text-secondary leading-relaxed italic">{info.encouragement}</p>
      </div>
    </div>
  );
}

function GrowthWinsList({ wins }: { wins: GrowthWin[] }) {
  const categoryEmoji: Record<string, string> = {
    knowledge: "📚", skill: "⚡", health: "💪",
    relationship: "👥", character: "⭐", spiritual: "🕊️",
  };
  return (
    <div className="space-y-2">
      {wins.length === 0 ? (
        <div className="p-4 rounded-xl bg-muted/30 border border-border text-center">
          <Sparkles size={20} className="mx-auto text-text-secondary/30 mb-2" />
          <p className="text-xs text-text-secondary">Growth wins akan muncul saat kamu melewati tantangan besar.</p>
        </div>
      ) : (
        wins.slice(0, 5).map((win) => (
          <div key={win.id} className="flex items-start gap-3 p-3 rounded-xl bg-success/5 border border-success/20">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
              <Trophy size={14} className="text-success" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-text-primary">{win.title}</p>
              <p className="text-[10px] text-text-secondary mt-0.5">{win.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="success" className="text-[8px]">
                  {categoryEmoji[win.category] || "🏆"} {win.category}
                </Badge>
                <span className="text-[9px] text-text-secondary">
                  {new Date(win.unlockedAt).toLocaleDateString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}