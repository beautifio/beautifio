"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { Button, Card, CardContent, Skeleton } from "@beautifio/ui";
import { getAllDreamTemplates } from "@beautifio/utils";
import type { DreamTemplate, DreamJourney } from "@beautifio/types";
import { useAuth } from "@/hooks/use-auth";
import { getActiveJourney, getAllJourneys, createJourney } from "@/lib/journey-queries";

export default function JourneyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeJourney, setActiveJourney] = useState<DreamJourney | null>(null);
  const [previousJourneys, setPreviousJourneys] = useState<DreamJourney[]>([]);
  const [templates] = useState(getAllDreamTemplates());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const active = await getActiveJourney(user.id);
      setActiveJourney(active);
      const all = await getAllJourneys(user.id);
      setPreviousJourneys(all.filter((j) => j.status !== "active"));
      setLoading(false);
    })();
  }, [user]);

  const handleStartJourney = async (template: DreamTemplate) => {
    if (!user || creating) return;
    setCreating(true);
    setSelectedTemplate(template.slug);
    const journey = await createJourney(
      user.id,
      template.slug,
      template.title,
      template.emoji,
      template.category
    );
    setCreating(false);
    if (journey) {
      router.push(`/journey/${journey.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg p-6 max-w-content mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-40 w-full mb-4 rounded-xl" />
        <Skeleton className="h-40 w-full mb-4 rounded-xl" />
      </div>
    );
  }

  if (activeJourney) {
    return (
      <div className="min-h-screen bg-bg">
        <div className="max-w-content mx-auto px-6 pt-8 pb-24">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Perjalanan Mimpiku</h1>
            <p className="text-sm text-text-secondary mt-1">Lanjutkan perjalananmu</p>
          </div>

          <Link href={`/journey/${activeJourney.id}`}>
            <Card className="p-6 border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-4xl">{activeJourney.emoji}</span>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">{activeJourney.title}</h2>
                  <p className="text-sm text-text-secondary">Perjalanan aktif</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary font-medium">Lihat Detail</span>
                <ArrowRight size={16} className="text-primary" />
              </div>
            </Card>
          </Link>

          {previousJourneys.length > 0 && (
            <div className="mt-8">
              <h3 className="text-base font-bold text-text-primary mb-4">Mimpi Sebelumnya</h3>
              <div className="space-y-3">
                {previousJourneys.map((j) => (
                  <Card key={j.id} className="p-4 opacity-60">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{j.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{j.title}</p>
                        <p className="text-xs text-text-secondary">{j.status === "pivoted" ? "Dialihkan" : "Selesai"}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Link
            href={`/journey/${activeJourney.id}`}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-content"
          >
            <Button variant="accent" size="lg" className="w-full shadow-lg">
              Lanjutkan Perjalanan <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Mulai Perjalananmu</h1>
          <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
            Pilih mimpi yang paling menarik untukmu. Kamu bisa ganti kapan saja.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
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
                loading={creating && selectedTemplate === t.slug}
                disabled={creating}
              >
                <Heart size={14} /> Pilih Mimpi Ini
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
