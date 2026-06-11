"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Compass, Target, TrendingUp, Sparkles, Quote, ArrowRight,
  Heart, Brain, BookOpen, Users, Sun, Star, Zap, Shield,
  Trophy, RefreshCw, Lightbulb, CheckCircle2, ArrowUp,
} from "lucide-react";
import { Badge, Button, Card, CardHeader, CardTitle, CardContent } from "@beautifio/ui";
import {
  getCoachPanelData, ZONE_INFO,
} from "@beautifio/utils";
import type {
  CoachPanelData, DailyCoachFocus, PersonalizedInsight,
  ZoneAnalysis, CapitalAdvice, DreamNavigation,
  MotivationMessage, OpportunityMatch, WeeklyGrowthReport,
} from "@beautifio/utils";

interface LifeCoachPanelProps {
  onRefresh?: () => void;
}

function InsightCard({ insight }: { insight: PersonalizedInsight }) {
  const priorityColors = {
    high: "border-rose-200 bg-rose-50/50 dark:bg-rose-900/10",
    medium: "border-amber-200 bg-amber-50/50 dark:bg-amber-900/10",
    low: "border-blue-200 bg-blue-50/50 dark:bg-blue-900/10",
  };
  return (
    <div className={`p-3 rounded-xl border ${priorityColors[insight.priority]}`}>
      <div className="flex items-start gap-2">
        <span className="text-lg flex-shrink-0">{insight.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-text-primary leading-relaxed">{insight.message}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <Badge variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "accent" : "default"} className="text-[8px]">
              {insight.priority === "high" ? "Penting" : insight.priority === "medium" ? "Sedang" : "Ringan"}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

function ZoneAnalysisCard({ analysis }: { analysis: ZoneAnalysis }) {
  const info = ZONE_INFO[analysis.zone];
  return (
    <div className={`rounded-2xl p-5 border ${
      analysis.zone === "comfort" ? "bg-blue-50/50 border-blue-100" :
      analysis.zone === "fear" ? "bg-amber-50/50 border-amber-100" :
      analysis.zone === "learning" ? "bg-green-50/50 border-green-100" :
      "bg-purple-50/50 border-purple-100"
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{info?.emoji}</span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">Analisis Zona</p>
          <h3 className="text-base font-bold text-text-primary">{info?.label}</h3>
        </div>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">{analysis.why}</p>
      <div className="space-y-2">
        <div>
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Sinyal Terdeteksi</p>
          <ul className="space-y-1">
            {analysis.signalsObserved.slice(0, 2).map((s, i) => (
              <li key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-text-secondary/30 flex-shrink-0 mt-1" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider mb-1">Rekomendasi</p>
          <ul className="space-y-1">
            {analysis.recommendedActions.slice(0, 2).map((a, i) => (
              <li key={i} className="text-[11px] text-accent flex items-start gap-1.5">
                <ArrowRight size={10} className="text-accent flex-shrink-0 mt-0.5" />
                {a}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function CapitalAdviceCard({ advice }: { advice: CapitalAdvice }) {
  const router = useRouter();
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <Heart size={16} className="text-rose-500" />
        <h3 className="text-sm font-bold text-text-primary">Life Capital Advisor</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-success/20">
          <p className="text-[9px] text-text-secondary">Terkuat</p>
          <p className="text-xs font-bold text-text-primary">{advice.strongest.label} ({advice.strongest.value})</p>
        </div>
        <div className="p-2.5 rounded-xl bg-white/60 dark:bg-white/5 border border-amber-200">
          <p className="text-[9px] text-text-secondary">Terlemah</p>
          <p className="text-xs font-bold text-text-primary">{advice.weakest.label} ({advice.weakest.value})</p>
        </div>
      </div>
      <p className="text-[11px] text-text-secondary leading-relaxed">{advice.recommendation}</p>
      <div className="flex items-center gap-2 mt-3">
        <Target size={12} className="text-accent" />
        <span className="text-[11px] font-medium text-accent">Misi: {advice.focusMission}</span>
      </div>
    </div>
  );
}

function DreamNavCard({ nav }: { nav: DreamNavigation }) {
  const router = useRouter();
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/10">
      <div className="flex items-center gap-2 mb-3">
        <Compass size={16} className="text-accent" />
        <h3 className="text-sm font-bold text-text-primary">Dream Navigator</h3>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">{nav.nextFocus}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold ${nav.onRightPath ? "text-success" : "text-amber-600"}`}>
          {nav.onRightPath ? "✓ Di jalur yang tepat" : "⚡ Perlu penyesuaian"}
        </span>
      </div>
      {nav.missingSkills.length > 0 && (
        <div className="mb-2">
          <p className="text-[10px] font-semibold text-text-secondary mb-1">Skill yang perlu dikembangkan:</p>
          <div className="flex flex-wrap gap-1">
            {nav.missingSkills.map((s, i) => (
              <Badge key={i} variant="accent" className="text-[9px]">{s}</Badge>
            ))}
          </div>
        </div>
      )}
      {nav.opportunities.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-text-secondary mb-1">Peluang:</p>
          <ul className="space-y-0.5">
            {nav.opportunities.map((o, i) => (
              <li key={i} className="text-[11px] text-text-secondary flex items-center gap-1.5">
                <Sparkles size={10} className="text-accent" />
                {o}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WeeklyReportCard({ report }: { report: WeeklyGrowthReport }) {
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-success/5 to-primary/5 border border-success/20">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-success" />
        <h3 className="text-sm font-bold text-text-primary">Ringkasan Mingguan</h3>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed mb-3">{report.summary}</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div>
          <p className="text-[10px] font-semibold text-success mb-1">Kemenangan</p>
          <ul className="space-y-0.5">
            {report.wins.slice(0, 2).map((w, i) => (
              <li key={i} className="text-[10px] text-text-secondary flex items-center gap-1">
                <span>{w.emoji}</span>
                <span>{w.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-amber-600 mb-1">Tantangan</p>
          <ul className="space-y-0.5">
            {report.challenges.slice(0, 2).map((c, i) => (
              <li key={i} className="text-[10px] text-text-secondary flex items-center gap-1">
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-text-secondary mb-1">Saran Perbaikan</p>
        {report.suggestedImprovements.slice(0, 1).map((imp, i) => (
          <p key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
            <Lightbulb size={12} className="text-amber-500 flex-shrink-0 mt-0.5" />
            {imp}
          </p>
        ))}
      </div>
    </div>
  );
}

function MotivationCard({ motivation }: { motivation: MotivationMessage }) {
  return (
    <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-50/80 to-rose-50/80 dark:from-amber-900/10 dark:to-rose-900/10 border border-amber-200/50">
      <div className="flex items-start gap-2">
        <span className="text-2xl flex-shrink-0">{motivation.emoji}</span>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Life Coach</span>
          </div>
          <p className="text-sm text-text-primary leading-relaxed italic">"{motivation.message}"</p>
        </div>
      </div>
    </div>
  );
}

function TodayFocusCard({ focus }: { focus: DailyCoachFocus }) {
  const categoryEmojis: Record<string, string> = {
    physical: "💪", mental: "🧠", knowledge: "📚",
    spiritual: "🕊️", social: "👥",
  };
  return (
    <div className="space-y-2">
      <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-xs text-text-secondary leading-relaxed">{focus.insight}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {focus.focusAreas.slice(0, 4).map((area, i) => (
          <div key={i} className="p-3 rounded-xl bg-surface border border-border">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{categoryEmojis[area.category] || area.emoji}</span>
              <span className="text-[10px] font-bold text-text-secondary uppercase">{area.title}</span>
            </div>
            <p className="text-[10px] text-text-secondary leading-relaxed">{area.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OpportunityMatchCard({ matches }: { matches: OpportunityMatch[] }) {
  const typeEmojis: Record<string, string> = {
    story: "📖", roadmap: "🗺️", circle: "👥", mentor: "🎯", event: "📅",
  };
  const router = useRouter();
  return (
    <div className="space-y-2">
      {matches.map((m, i) => (
        <button key={i} onClick={() => router.push(m.href)}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:border-accent/30 hover:bg-accent/5 transition-all text-left cursor-pointer"
        >
          <span className="text-lg">{typeEmojis[m.type] || "🔗"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-text-primary">{m.title}</p>
            <p className="text-[10px] text-text-secondary">{m.reason}</p>
          </div>
          <ArrowRight size={14} className="text-text-secondary/30 flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}

export function LifeCoachPanel({ onRefresh }: LifeCoachPanelProps) {
  const [data, setData] = useState<CoachPanelData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setData(getCoachPanelData());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 rounded-2xl bg-muted" />
        <div className="h-20 rounded-2xl bg-muted" />
        <div className="h-32 rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-primary" />
          <h2 className="text-base font-bold text-text-primary">Life Coach</h2>
        </div>
        <button onClick={() => { load(); onRefresh?.(); }}
          className="p-2 rounded-xl bg-muted hover:bg-muted/70 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className="text-text-secondary" />
        </button>
      </div>

      {/* Motivation */}
      <MotivationCard motivation={data.motivation} />

      {/* Today's Focus */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sun size={14} className="text-amber-500" />
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">
            {data.dailyFocus.greeting} — Fokus Hari Ini
          </h3>
        </div>
        <TodayFocusCard focus={data.dailyFocus} />
      </div>

      {/* Insights */}
      {data.insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={14} className="text-purple-500" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Personalized Insights</h3>
          </div>
          <div className="space-y-2">
            {data.insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Zone Analysis */}
      <ZoneAnalysisCard analysis={data.zoneAnalysis} />

      {/* Capital Advice */}
      <CapitalAdviceCard advice={data.capitalAdvice} />

      {/* Dream Navigator */}
      {data.dreamNavigation && <DreamNavCard nav={data.dreamNavigation} />}

      {/* Weekly Report */}
      {data.weeklyReport && <WeeklyReportCard report={data.weeklyReport} />}

      {/* Opportunities */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Compass size={14} className="text-accent" />
          <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Rekomendasi Untukmu</h3>
        </div>
        <OpportunityMatchCard matches={data.opportunities} />
      </div>
    </div>
  );
}
