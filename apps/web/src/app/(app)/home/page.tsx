"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Sunrise, Sun, CloudSun, Moon, ArrowRight, Heart } from "lucide-react";
import { Button, Card } from "@beautifio/ui";
import { useAuth } from "@/hooks/use-auth";
import { getAllDreamTemplates, getDreamTemplate } from "@beautifio/utils";
import { createJourney, journeyUrl } from "@/lib/journey-queries";
import { JourneyOnboardingModal } from "@/features/journey/journey-onboarding-modal";
import type { DreamTemplate, DreamJourney, JourneyProgress } from "@beautifio/types";

function DreamCard({ journey, dreamMeaning }: { journey: DreamJourney; dreamMeaning: string }) {
  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{journey.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-text-secondary/50 mb-1">🎯 Mimpiku</p>
          <p className="text-sm font-bold text-text-primary">{journey.title}</p>
          {dreamMeaning && (
            <p className="text-xs text-text-secondary/60 mt-2 leading-relaxed">
              {dreamMeaning}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function TargetCard({ progress, journey }: { progress: JourneyProgress | null; journey: DreamJourney | null }) {
  const router = useRouter();
  const bw = progress?.current_big_win;

  const pct = progress && progress.big_wins_total > 0
    ? Math.round((progress.big_wins_completed / progress.big_wins_total) * 100)
    : 0;

  return (
    <div className="bg-surface rounded-2xl border border-border p-5">
      <p className="text-xs text-text-secondary/50 mb-1">🔥 Target Saat Ini</p>
      {bw ? (
        <>
          <p className="text-sm font-bold text-text-primary mb-1">{bw.title}</p>
          {bw.description && (
            <p className="text-xs text-text-secondary/60 mb-3">{bw.description}</p>
          )}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-text-secondary">{pct}%</span>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-text-secondary/70">Belum ada target yang aktif.</p>
          <p className="text-xs text-text-secondary/50 mt-1 mb-3">
            Pilih atau aktifkan perjalananmu untuk memulai langkah berikutnya.
          </p>
        </>
      )}
    </div>
  );
}

function TemplateCards() {
  const router = useRouter();
  const { user } = useAuth();
  const [templates] = useState(getAllDreamTemplates());
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DreamTemplate | null>(null);

  const handleStartJourney = async (t: DreamTemplate) => {
    if (!user) return router.push("/login");
    setSelectedTemplate(t);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary text-center py-4">
        Kamu belum memulai perjalanan. Pilih mimpi yang paling menarik untukmu.
      </p>
      {error && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
          {error}
        </div>
      )}
      {templates.map((t) => (
        <Card key={t.slug} className="p-5 hover:border-primary/30 transition-all">
          <div className="flex items-start gap-4">
            <span className="text-3xl mt-1">{t.emoji}</span>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-text-primary">{t.title}</h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{t.description}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-text-secondary capitalize">{t.category}</span>
                <span className="text-[11px] text-text-secondary">{t.duration}</span>
              </div>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            className="w-full mt-4"
            onClick={() => handleStartJourney(t)}
          >
            <Heart size={14} /> Pilih Mimpi Ini
          </Button>
        </Card>
      ))}

      <JourneyOnboardingModal
        open={!!selectedTemplate}
        template={selectedTemplate!}
        onClose={() => setSelectedTemplate(null)}
      />
    </div>
  );
}

function timeGreeting(): { text: string; icon: React.ReactNode } {
  const h = new Date().getHours();
  if (h < 11) return { text: "Selamat Pagi", icon: <Sunrise size={18} /> };
  if (h < 15) return { text: "Selamat Siang", icon: <Sun size={18} /> };
  if (h < 18) return { text: "Selamat Sore", icon: <CloudSun size={18} /> };
  return { text: "Selamat Malam", icon: <Moon size={18} /> };
}

export default function HomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [journey, setJourney] = useState<DreamJourney | null>(null);
  const [progress, setProgress] = useState<JourneyProgress | null>(null);
  const [dreamMeaning, setDreamMeaning] = useState("");
  const [loading, setLoading] = useState(true);
  const [onboardingTemplate, setOnboardingTemplate] = useState<DreamTemplate | null>(null);

  const mimpiSlug = searchParams.get("mimpi");

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
          try {
            const { getDreamMeaning } = await import("@beautifio/utils");
            setDreamMeaning(getDreamMeaning(j.template_slug));
          } catch {}
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
      const t = getDreamTemplate(mimpiSlug);
      if (t) setOnboardingTemplate(t);
    }
  }, [loading, journey, mimpiSlug]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24 space-y-5">
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
            <DreamCard journey={journey} dreamMeaning={dreamMeaning} />
            <TargetCard progress={progress} journey={journey} />
            <div className="text-center pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => router.push(journeyUrl(journey))}
              >
                Lanjutkan Journey <ArrowRight size={16} />
              </Button>
            </div>
          </>
        ) : (
          <>
            <TemplateCards />

            <JourneyOnboardingModal
              open={!!onboardingTemplate}
              template={onboardingTemplate!}
              onClose={() => setOnboardingTemplate(null)}
            />
          </>
        )}
      </div>
    </div>
  );
}
