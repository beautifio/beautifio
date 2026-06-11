"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Compass, Heart, Brain, Users, BookOpen, Star, Zap,
  ArrowRight, Target, Trophy, Sparkles, Flame, TrendingUp,
  RefreshCw, Shield, GraduationCap, Quote, ChevronRight, Settings,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import {
  getLifeProfile, isOnboardingComplete, updateZone,
  generateDailyWins, applyCapitalChanges, calculateCapitalChange,
  getStageProgression, getAllGrowthWins, ZONE_INFO, STAGE_INFO,
  SPIRITUAL_PRACTICES, ROADMAP_V3_SEED,
} from "@beautifio/utils";
import type { LifeCapital, GrowthZoneRecommendation, GrowthWin } from "@beautifio/types";

const CAPITAL_CONFIG: { key: keyof LifeCapital; label: string; emoji: string; color: string }[] = [
  { key: "knowledge", label: "Pengetahuan", emoji: "📚", color: "from-blue-500 to-blue-600" },
  { key: "skill", label: "Skill", emoji: "⚡", color: "from-amber-500 to-orange-500" },
  { key: "health", label: "Kesehatan", emoji: "💪", color: "from-green-500 to-emerald-600" },
  { key: "relationship", label: "Relasi", emoji: "👥", color: "from-pink-500 to-rose-500" },
  { key: "character", label: "Karakter", emoji: "⭐", color: "from-purple-500 to-violet-600" },
  { key: "spiritual", label: "Spiritual", emoji: "🕊️", color: "from-indigo-500 to-blue-600" },
];

export const dynamic = "force-dynamic";

function CapitalBar({ value, label, emoji, color }: { value: number; label: string; emoji: string; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{emoji}</span>
          <span className="text-xs font-semibold text-text-primary">{label}</span>
        </div>
        <span className="text-xs font-bold text-text-primary">{value}</span>
      </div>
      <div className="h-2 bg-border rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

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

function DailySuggestionCard({ rec }: { rec: GrowthZoneRecommendation }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Target size={14} className="text-accent" />
          Saran Harian
        </h3>
        <Badge variant="accent" className="text-[9px]">{rec.weeklyFocus}</Badge>
      </div>
      <div className="space-y-2">
        {rec.dailyWins.map((dw, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
            <span className="text-lg">{dw.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold text-text-primary capitalize">{dw.category}</p>
              <ul className="mt-1 space-y-0.5">
                {dw.tasks.slice(0, 2).map((task, j) => (
                  <li key={j} className="text-[10px] text-text-secondary flex items-start gap-1.5">
                    <span className="text-text-secondary/30 mt-0.5">•</span>
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
        <p className="text-xs font-semibold text-accent flex items-center gap-1.5">
          <Target size={12} />
          Fokus Bulanan
        </p>
        <p className="text-[11px] text-text-secondary mt-1">{rec.monthlyGoal}</p>
      </div>
    </div>
  );
}

function StageCard({ stage }: { stage: string }) {
  const info = STAGE_INFO[stage];
  const progression = getStageProgression(stage as any);
  if (!info) return null;
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{info.emoji}</span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Tahap Hidup</p>
          <h2 className="text-base font-bold text-text-primary">{info.label}</h2>
          <p className="text-[10px] text-text-secondary">{info.ageRange}</p>
        </div>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">{info.description}</p>
      <div className="flex items-center gap-2 mt-3">
        {progression.previous && (
          <Badge variant="default" className="text-[9px]">{STAGE_INFO[progression.previous]?.emoji} {STAGE_INFO[progression.previous]?.label}</Badge>
        )}
        <Badge variant="accent" className="text-[9px]">{info.emoji} {info.label}</Badge>
        {progression.next && (
          <Badge variant="default" className="text-[9px]">{STAGE_INFO[progression.next]?.emoji} {STAGE_INFO[progression.next]?.label}</Badge>
        )}
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

export default function LifeDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");
  const profile = useMemo(() => getLifeProfile(), []);
  const [zone, setZoneState] = useState(profile.currentZone);
  const [capital, setCapital] = useState(profile.lifeCapital);
  const [recommendation, setRecommendation] = useState<GrowthZoneRecommendation | null>(null);
  const growthWins = useMemo(() => getAllGrowthWins(), []);

  useEffect(() => {
    if (!isOnboardingComplete()) {
      router.replace("/life/start");
      return;
    }
    const currentZone = updateZone();
    setZoneState(currentZone);
    setCapital(getLifeProfile().lifeCapital);
    setRecommendation(generateDailyWins(profile.currentStage, currentZone, profile.currentDreamSlug));
  }, []);

  const dreamTitle = profile.currentDreamSlug ? ROADMAP_V3_SEED[profile.currentDreamSlug]?.title ?? profile.currentDreamSlug : null;

  const totalCapital = capital.knowledge + capital.skill + capital.health + capital.relationship + capital.character + capital.spiritual;
  const avgCapital = Math.round(totalCapital / 6);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Life Engine</h1>
            <p className="text-xs text-text-secondary mt-0.5">Your personal growth companion</p>
          </div>
          <button onClick={() => router.push("/life/start")} className="p-2 rounded-xl bg-muted hover:bg-muted/70 transition-colors cursor-pointer">
            <RefreshCw size={16} className="text-text-secondary" />
          </button>
        </div>

        <ZoneCard zone={zone} />

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10 text-center">
            <p className="text-lg font-bold text-primary">{avgCapital}</p>
            <p className="text-[9px] text-text-secondary">Life Capital</p>
          </div>
          <div className="p-3 rounded-xl bg-accent/5 border border-accent/10 text-center">
            <p className="text-lg font-bold text-accent">{STAGE_INFO[profile.currentStage]?.emoji}</p>
            <p className="text-[9px] text-text-secondary">{STAGE_INFO[profile.currentStage]?.label}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 text-center">
            <p className="text-lg font-bold text-amber-600">{growthWins.length}</p>
            <p className="text-[9px] text-text-secondary">Growth Wins</p>
          </div>
        </div>

        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-destructive" />
              <CardTitle>Life Capital</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {CAPITAL_CONFIG.map((cfg) => (
              <CapitalBar key={cfg.key} value={capital[cfg.key]} label={cfg.label} emoji={cfg.emoji} color={cfg.color} />
            ))}
          </CardContent>
        </Card>

        <StageCard stage={profile.currentStage} />

        {dreamTitle && (
          <div className="p-4 rounded-2xl bg-accent/5 border border-accent/10">
            <div className="flex items-center gap-3">
              <Target size={18} className="text-accent" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">Impian Saat Ini</p>
                <p className="text-sm font-bold text-text-primary truncate">{dreamTitle}</p>
              </div>
              <button onClick={() => router.push(`/roadmap/${profile.currentDreamSlug}`)} className="text-xs font-semibold text-accent hover:underline cursor-pointer">
                Buka
              </button>
            </div>
          </div>
        )}

        {recommendation && <DailySuggestionCard rec={recommendation} />}

        <Card padding="lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-success" />
              <CardTitle>Growth Wins</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <GrowthWinsList wins={growthWins} />
          </CardContent>
        </Card>

        <button onClick={() => router.push("/life/start")} className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface border border-border hover:border-primary/20 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Settings size={18} className="text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">Konfigurasi Life Engine</p>
              <p className="text-[10px] text-text-secondary">Ubah tahap, zona, atau preferensi spiritual</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-text-secondary/30" />
        </button>
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}
