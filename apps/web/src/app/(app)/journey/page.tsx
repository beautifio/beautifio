"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles, ArrowRight, Heart, Compass } from "lucide-react";
import { Button, Card, CardContent, Skeleton } from "@beautifio/ui";
import { getAllDreamTemplates, getAgeGroupLabel, getJmEcosystemByTemplateSlug, getJmCareerPaths } from "@beautifio/utils";
import type { DreamTemplate, DreamJourney } from "@beautifio/types";
import { useAuth } from "@/hooks/use-auth";

import { getActiveJourney, getAllJourneys, createJourney, journeyUrl } from "@/lib/journey-queries";

const CATEGORY_LABELS: Record<string, string> = {
  sports: "Sports",
  creative: "Creative",
  business: "Business",
  health: "Health",
  tech: "Tech",
};

const FILTER_OPTIONS = ["Semua", ...Object.values(CATEGORY_LABELS)] as const;
type FilterKey = (typeof FILTER_OPTIONS)[number];

function categoryMatches(category: string, filter: FilterKey): boolean {
  if (filter === "Semua") return true;
  return CATEGORY_LABELS[category] === filter;
}

export default function JourneyPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeJourney, setActiveJourney] = useState<DreamJourney | null>(null);
  const [previousJourneys, setPreviousJourneys] = useState<DreamJourney[]>([]);
  const [templates] = useState(getAllDreamTemplates());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("Semua");

  const filteredTemplates = useMemo(
    () => templates.filter((t) => categoryMatches(t.category, activeFilter)),
    [templates, activeFilter]
  );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const active = await getActiveJourney(user.id);
        setActiveJourney(active);
        const all = await getAllJourneys(user.id);
        setPreviousJourneys(all.filter((j) => j.status !== "active"));
        const { supabase } = await import("@/lib/supabase/client");
        if (supabase) {
          const { data } = await supabase
            .from("users")
            .select("birth_date")
            .eq("id", user.id)
            .maybeSingle<{ birth_date: string }>();
          if (data?.birth_date) {
            const age = Math.floor(
              (Date.now() - new Date(data.birth_date).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            );
            setUserAge(age);
          }
        }
      } catch (e) {
        console.error("Gagal memuat perjalanan", e);
        setError("Gagal memuat data pengguna");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleStartJourney = async (template: DreamTemplate) => {
    if (!user || creating) return;
    setCreating(true);
    setError(null);
    setSelectedTemplate(template.slug);
    try {
      const journey = await createJourney(
        user.id,
        template.slug,
        template.title,
        template.emoji,
        template.category,
        userAge
      );
      if (journey) {
          router.push(journeyUrl(journey));
      } else {
        setError("Gagal membuat perjalanan. Coba lagi.");
        setCreating(false);
      }
    } catch (e: any) {
      console.error("handleStartJourney error:", e);
      setError(e?.message || "Terjadi kesalahan. Coba lagi.");
      setCreating(false);
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
        <div className="max-w-content mx-auto px-6 pt-8 pb-28">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary">Perjalanan Mimpiku</h1>
            <p className="text-sm text-text-secondary mt-1">Lanjutkan perjalananmu</p>
          </div>

          <Link href={journeyUrl(activeJourney)}>
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
            href={journeyUrl(activeJourney)}
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
      <div className="max-w-content mx-auto px-6 pt-8 pb-28">
        <div className="text-center mb-6">
          <p className="text-base text-text-secondary">Kamu belum memulai perjalanan.</p>
          <p className="text-sm text-text-secondary/60 mt-1">Pilih mimpi yang paling menarik untukmu.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`shrink-0 px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activeFilter === f
                  ? "bg-[#FF5E5B] text-white shadow-sm"
                  : "bg-muted text-text-secondary hover:text-text-primary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((t) => {
            const ecosystem = getJmEcosystemByTemplateSlug(t.slug);
            return (
              <Card key={t.slug} className="p-3 hover:border-primary/30 transition-all">
                <div className="flex flex-col gap-2">
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-text-primary leading-tight">{t.title}</h3>
                    <p className="text-[11px] text-text-secondary mt-1 line-clamp-2 leading-relaxed">{t.description}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-text-secondary capitalize">{t.category}</span>
                      <span className="text-[10px] text-text-secondary">{t.duration}</span>
                    </div>
                    {ecosystem && (
                      <p className="text-[10px] text-accent mt-1.5 leading-tight">
                        <Compass size={10} className="inline mr-0.5 -mt-0.5" />
                        {ecosystem.pivotPoint}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full mt-3 text-xs"
                  onClick={() => handleStartJourney(t)}
                  loading={creating && selectedTemplate === t.slug}
                  disabled={creating}
                >
                  <Heart size={12} /> Pilih
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
