"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { use, useState, useEffect, useRef } from "react";
import { Sunrise, Sun, CloudSun, Moon, ArrowRight, Flame, Sparkles, Heart } from "lucide-react";
import { Button } from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase/client";
import { getDreamTemplate, getTemplateFromBenchmarkSlug } from "@beautifio/utils";
import { journeyUrl } from "@/lib/journey-queries";
import type { DreamJourney, JourneyProgress, DreamTemplate } from "@beautifio/types";

const JourneyOnboardingModal = dynamic(() => import("@/features/journey/journey-onboarding-modal").then(m => ({ default: m.JourneyOnboardingModal })), { ssr: false });

function timeGreeting(): { text: string; icon: React.ReactNode } {
  const h = new Date().getHours();
  if (h < 11) return { text: "Selamat Pagi", icon: <Sunrise size={18} /> };
  if (h < 15) return { text: "Selamat Siang", icon: <Sun size={18} /> };
  if (h < 18) return { text: "Selamat Sore", icon: <CloudSun size={18} /> };
  return { text: "Selamat Malam", icon: <Moon size={18} /> };
}

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

  const mimpiSlug = resolvedParams?.mimpi;

  const isAnonymous = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous";

  const userName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    (isAnonymous ? "Sobat Tamu" : "Sobat");

  // Load trial info + journey for anonymous users
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

        // Load trial info for anonymous users
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
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-6">
        {/* Trial banner for anonymous users */}
        {isAnonymous && trialInfo && (
          <div className="bg-[#FFF7E6] border border-[#FFB627] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-[#92400E]">
                🕐 Mode Tamu
              </p>
              <p className="text-xs text-[#92400E]">
                Sisa {calcTrialDays(trialInfo).remaining} hari
              </p>
            </div>
            <div className="w-full bg-[#FFE4A0] rounded-full h-1.5 mb-2">
              <div
                className="h-1.5 rounded-full bg-[#FFB627] transition-all"
                style={{ width: `${(calcTrialDays(trialInfo).currentDay / calcTrialDays(trialInfo).totalDays) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-[#92400E]/70">
              Daftar untuk simpan progress selamanya
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 text-lg font-bold text-text-primary">
          {timeGreeting().icon}
          <span>{timeGreeting().text}, {userName} 👋</span>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-surface border border-border animate-pulse" />
            ))}
          </div>
        ) : journey ? (
          <>
            <div className="bg-surface rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{journey.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-text-primary">{journey.title}</p>
                  <p className="text-xs text-text-secondary">Perjalanan aktif</p>
                </div>
              </div>

              {progress && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Flame size={16} className="text-accent" />
                      <span className="text-sm text-text-secondary">Streak</span>
                    </div>
                    <span className="text-sm font-bold text-text-primary">{progress.streak} hari</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-primary" />
                      <span className="text-sm text-text-secondary">Aktivitas Hari Ini</span>
                    </div>
                    <span className="text-sm font-bold text-text-primary">
                      {progress.completed_activities_today}/{progress.total_activities_today}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push(journeyUrl(journey))}
            >
              Lanjutkan Journey <ArrowRight size={16} />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-12 space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles size={36} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-text-primary">
                Kamu belum memulai perjalanan
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Pilih mimpi yang ingin kamu wujudkan
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={() => router.push("/journey")}
            >
              Mulai Perjalananmu <ArrowRight size={16} />
            </Button>
          </div>
        )}
      </div>

      {onboardingTemplate && (
        <JourneyOnboardingModal
          open={true}
          template={onboardingTemplate}
          onClose={() => setOnboardingTemplate(null)}
        />
      )}
    </div>
  );
}
