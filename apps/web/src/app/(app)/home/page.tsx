"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { use, useState, useEffect } from "react";
import { Sunrise, Sun, CloudSun, Moon, ArrowRight, Flame, Sparkles } from "lucide-react";
import { Button } from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
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

  const mimpiSlug = resolvedParams?.mimpi;

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
        const { getActiveJourney, getJourneyProgress } = await import("@/lib/journey-queries");
        const j = await getActiveJourney(user.id);
        setJourney(j);
        if (j) {
          const p = await getJourneyProgress(user.id, j.id);
          setProgress(p);
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

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-6">
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
