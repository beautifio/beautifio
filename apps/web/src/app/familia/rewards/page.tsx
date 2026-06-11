"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, CheckCircle2, Circle, Gift, Sparkles, Users, Heart, BookOpen } from "lucide-react";
import { BottomNavigation, ProgressBar } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { FAMILIA_ACHIEVEMENT_REWARDS, FAMILIA_MERCHANTS } from "@beautifio/utils";
import { EcosystemLinks } from "@/features/ecosystem/EcosystemSection";
import type { EcosystemItem } from "@/features/ecosystem/EcosystemSection";

const ICON_MAP: Record<string, typeof Sparkles> = {
  Sparkles, Trophy, Users, Heart, BookOpen,
};

const TRIGGER_LABELS: Record<string, string> = {
  discovery_complete: "Selesaikan Discovery",
  roadmap_milestones: "Selesaikan Milestone Roadmap",
  circle_days: "Bergabung Circle",
  mentor_program: "Ikuti Mentor",
  journal_entries: "Tulis Jurnal",
  story_posted: "Posting Cerita",
};

const TRIGGER_PROGRESS: Record<string, { current: number; total: number }> = {
  discovery_complete: { current: 1, total: 1 },
  roadmap_milestones: { current: 4, total: 10 },
  circle_days: { current: 15, total: 30 },
  mentor_program: { current: 1, total: 1 },
  journal_entries: { current: 12, total: 20 },
};

export default function RewardsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("home");

  const ecosystemGroups: { title: string; items: EcosystemItem[] }[] = [
    { title: "Jelajahi Juga", items: [
      { id: "jr-vouchers", type: "familia-voucher" as const, title: "Voucher Merchant", subtitle: "Klaim voucher gratis dari merchant partner", href: "/familia/vouchers" },
      { id: "jr-deals", type: "familia-deal" as const, title: "Affiliate Deals", subtitle: "Penawaran spesial dari partner", href: "/familia/deals" },
      { id: "jr-goals", type: "goal" as const, title: "Goals Aktifmu", subtitle: "Selesaikan goals untuk unlock reward", href: "/profil" },
    ]},
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-white pb-24">
      <div className="max-w-content mx-auto px-6 pt-6">
        <button onClick={() => router.push("/familia")} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all active:scale-90 mb-4">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </button>

        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Achievement Rewards</h1>
            <p className="text-xs text-gray-500 mt-0.5">Dapatkan benefit dengan menyelesaikan aktivitas</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
            <Trophy className="w-4 h-4" />
            <span>{FAMILIA_ACHIEVEMENT_REWARDS.length} Reward</span>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          {FAMILIA_ACHIEVEMENT_REWARDS.map((reward) => {
            const IconComponent = reward.icon ? ICON_MAP[reward.icon] : Trophy;
            const progress = TRIGGER_PROGRESS[reward.trigger_type] || { current: 0, total: reward.trigger_value };
            const pct = Math.min(100, Math.round((progress.current / progress.total) * 100));
            const isComplete = progress.current >= progress.total;

            return (
              <div
                key={reward.id}
                className={`p-4 rounded-xl border transition-all ${
                  isComplete
                    ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200"
                    : "bg-white border-gray-100 hover:border-emerald-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${reward.color || "from-emerald-500 to-teal-500"} flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{reward.title}</span>
                      {isComplete && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{reward.description}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span>{TRIGGER_LABELS[reward.trigger_type] || reward.trigger_type}</span>
                        <span>{progress.current}/{progress.total}</span>
                      </div>
                      <ProgressBar value={pct} size="sm" variant="accent" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Gift className="w-3 h-3 text-amber-500" />
                      <span className="text-[10px] font-medium text-amber-700">{reward.reward_description}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <EcosystemLinks groups={ecosystemGroups} />
      </div>

      <BottomNavigation items={NAV_TABS} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); router.push(navRoute(id)); }} />
    </div>
  );
}
