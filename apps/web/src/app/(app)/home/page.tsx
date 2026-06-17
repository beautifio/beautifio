"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { getDreamTemplate, getTemplateFromBenchmarkSlug } from "@beautifio/utils";
import type { DreamJourney, JourneyProgress, DreamTemplate } from "@beautifio/types";
import { QuoteCard } from "./components/QuoteCard";
import { JourneyResume } from "./components/JourneyResume";
import { GuestCTA, GuestLandingCTA } from "./components/GuestCTA";
import { ArticlePick } from "./components/ArticlePick";
import { CurhatFeed } from "./components/CurhatFeed";
import { QuickActions } from "./components/QuickActions";
import { RuangAmanSheet } from "@/features/bantuan/RuangAmanSheet";

const JourneyOnboardingModal = dynamic(() => import("@/features/journey/journey-onboarding-modal").then(m => ({ default: m.JourneyOnboardingModal })), { ssr: false });

export default function HomeScreen({
  searchParams,
}: {
  searchParams: Promise<{ mimpi?: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const { user } = useAuth();

  const [journey, setJourney] = useState<DreamJourney | null>(null);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingTemplate, setOnboardingTemplate] = useState<DreamTemplate | null>(null);
  const [trialInfo, setTrialInfo] = useState<{ started_at: string; expires_at: string } | null>(null);
  const [ruangAmanOpen, setRuangAmanOpen] = useState(false);

  const mimpiSlug = resolvedParams?.mimpi;

  const isAnonymous = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous";

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    (isAnonymous ? "Sobat Tamu" : "Sobat");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const { getActiveJourney, getJourneyProgress } = await import("@/lib/journey-queries");
        const j = await getActiveJourney(user.id);
        setJourney(j);
        if (j) {
          const p = await getJourneyProgress(user.id, j.id);
          setProgress(p);
        }

        if (isAnonymous) {
          const { data: dbUser } = await supabase!
            .from("users")
            .select("trial_started_at, trial_expires_at")
            .eq("id", user.id)
            .single();
          if (dbUser) {
            setTrialInfo(dbUser as any);
          }
        }
      } catch (e) {
        console.error("Failed to load journey data", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  useEffect(() => {
    if (!loading && !journey && mimpiSlug) {
      let t = getDreamTemplate(mimpiSlug);
      if (!t) {
        const templateSlug = getTemplateFromBenchmarkSlug(mimpiSlug);
        if (templateSlug) t = getDreamTemplate(templateSlug);
      }
      if (t) setOnboardingTemplate(t);
    }
  }, [loading, journey, mimpiSlug]);

  function calcTrialDays(trialInfo: { started_at: string; expires_at: string }) {
    const now = new Date();
    const start = new Date(trialInfo.started_at);
    const expires = new Date(trialInfo.expires_at);
    const totalDays = Math.round((expires.getTime() - start.getTime()) / 86400000);
    const elapsedDays = Math.round((now.getTime() - start.getTime()) / 86400000);
    const currentDay = Math.min(Math.max(elapsedDays + 1, 1), totalDays);
    const remaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / 86400000));
    return { currentDay, totalDays, remaining };
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-5">
        {/* Trial banner */}
        {isAnonymous && trialInfo && (
          <div className="bg-[#FFF7E6] border border-[#FFB627] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#92400E]">🕐 Mode Tamu</p>
              <p className="text-xs text-[#92400E]">Sisa {calcTrialDays(trialInfo).remaining} hari</p>
            </div>
            <div className="w-full bg-[#FFE4A0] rounded-full h-1.5 mb-2">
              <div
                className="h-1.5 rounded-full bg-[#FFB627] transition-all"
                style={{ width: `${(calcTrialDays(trialInfo).currentDay / calcTrialDays(trialInfo).totalDays) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#92400E]/70">Daftar untuk simpan progress selamanya</p>
          </div>
        )}

        {/* Quote Card — semua state */}
        <QuoteCard userName={user ? userName : "Sobat"} />

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : user ? (
          <>
            {journey ? (
              <JourneyResume journey={journey} progress={progress} />
            ) : (
              <GuestCTA />
            )}
          </>
        ) : (
          <GuestLandingCTA />
        )}

        <ArticlePick journey={journey} />
        <CurhatFeed />
        <QuickActions onRuangAman={() => setRuangAmanOpen(true)} />
      </div>

      {onboardingTemplate && (
        <JourneyOnboardingModal
          open={true}
          template={onboardingTemplate}
          onClose={() => setOnboardingTemplate(null)}
        />
      )}

      <RuangAmanSheet open={ruangAmanOpen} onClose={() => setRuangAmanOpen(false)} />
    </div>
  );
}
