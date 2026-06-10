"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, Target, Heart, MapPin, Users, ArrowRight,
  RefreshCw, Home,
} from "lucide-react";
import { Card, Badge } from "@beautifio/ui";
import {
  DISCOVERY_GOAL_LABELS, ROADMAP_TEMPLATES,
  INTEREST_TO_ROADMAP, INSPIRATION_TO_ROADMAP,
  INSPIRATION_TO_CIRCLES, INTEREST_TO_CIRCLES,
} from "@beautifio/utils";
import type { DiscoveryAnswer } from "@beautifio/types";

const STORAGE_KEY = "beautifio_discovery_answers";



const circleNames: Record<string, { name: string; tag: string; color: string; members: number }> = {
  "1": { name: "Tech Founders", tag: "Kewirausahaan", color: "from-primary to-secondary", members: 8 },
  "2": { name: "Creative Lab", tag: "Kreatif", color: "from-secondary to-accent", members: 6 },
  "3": { name: "Future Leaders", tag: "Kepemimpinan", color: "from-accent to-primary", members: 10 },
  "4": { name: "Green Warriors", tag: "Lingkungan", color: "from-green-600 to-emerald-400", members: 5 },
  "5": { name: "Data Science ID", tag: "Teknologi", color: "from-blue-600 to-cyan-400", members: 9 },
  "6": { name: "Content Creator Hub", tag: "Kreatif", color: "from-pink-500 to-orange-400", members: 7 },
};

function computeResult(answers: DiscoveryAnswer[]) {
  const answerMap: Record<string, string[]> = {};
  for (const a of answers) {
    answerMap[a.questionId] = a.answers;
  }

  const inspiration = answerMap["inspiration"]?.[0] ?? "";
  const aspiration = answerMap["aspiration"]?.[0] ?? "";
  const interests = answerMap["interests"] ?? [];
  const goals = answerMap["goals"]?.[0] ?? "";

  const goalInfo = DISCOVERY_GOAL_LABELS[aspiration] ?? { label: "Menjadi Versi Terbaik Diri", emoji: "⭐" };

  const roadmapSlugs = new Set<string>();
  for (const interest of interests) {
    const fromInterest = INTEREST_TO_ROADMAP[interest] ?? [];
    fromInterest.forEach((s) => roadmapSlugs.add(s));
  }
  const fromInspiration = INSPIRATION_TO_ROADMAP[inspiration] ?? [];
  fromInspiration.forEach((s) => roadmapSlugs.add(s));

  const circleIds = new Set<string>();
  for (const interest of interests) {
    const fromInterest = INTEREST_TO_CIRCLES[interest] ?? [];
    fromInterest.forEach((id) => circleIds.add(id));
  }
  const fromInspirationCircles = INSPIRATION_TO_CIRCLES[inspiration] ?? [];
  fromInspirationCircles.forEach((id) => circleIds.add(id));

  return {
    mainGoal: goalInfo.label,
    mainGoalEmoji: goalInfo.emoji,
    topInterests: interests.map(
      (v) => DISCOVERY_QUESTIONS.find((q) => q.id === "interests")
        ?.options.find((o) => o.value === v)?.label ?? v
    ),
    recommendedRoadmapSlugs: [...roadmapSlugs],
    recommendedCircleIds: [...circleIds],
  };
}

import { DISCOVERY_QUESTIONS } from "@beautifio/utils";

export default function DiscoverResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ReturnType<typeof computeResult> | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      router.replace("/discover");
      return;
    }
    try {
      const answers: DiscoveryAnswer[] = JSON.parse(raw);
      setResult(computeResult(answers));
    } catch {
      router.replace("/discover");
    }
  }, [router]);

  const handleRedo = () => {
    localStorage.removeItem(STORAGE_KEY);
    router.push("/discover");
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-text-secondary">Memproses hasil...</p>
        </div>
      </div>
    );
  }

  const recommendedTemplates = ROADMAP_TEMPLATES.filter((t) =>
    result.recommendedRoadmapSlugs.includes(t.slug)
  );

  const recommendedCircles = result.recommendedCircleIds
    .map((id) => ({ id, ...circleNames[id] }))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[390px] mx-auto px-6 pt-8 pb-24">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            Hasil Penemuan Dirimu
          </h1>
          <p className="text-sm text-text-secondary mt-2">
            Berdasarkan jawabanmu, ini rekomendasi yang cocok untukmu
          </p>
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Target size={18} className="text-primary" />
            <h2 className="text-base font-bold text-text-primary">Tujuan Utama</h2>
          </div>
          <Card padding="lg" className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="flex items-center gap-4">
              <span className="text-3xl">{result.mainGoalEmoji}</span>
              <div>
                <p className="text-sm text-text-secondary">Tujuan terbesarmu</p>
                <p className="text-lg font-bold text-text-primary">{result.mainGoal}</p>
              </div>
            </div>
          </Card>
        </section>

        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Heart size={18} className="text-destructive" />
            <h2 className="text-base font-bold text-text-primary">Minat Teratas</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.topInterests.map((interest) => (
              <Badge key={interest} variant="accent" className="px-3 py-1.5 text-sm">
                {interest}
              </Badge>
            ))}
          </div>
        </section>

        {recommendedTemplates.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-accent" />
                <h2 className="text-base font-bold text-text-primary">Roadmap Rekomendasi</h2>
              </div>
              <Link
                href="/roadmap"
                className="text-xs font-medium text-secondary hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {recommendedTemplates.map((t) => (
                <Link key={t.slug} href={`/roadmap/${t.slug}`}>
                  <Card padding="md" className="hover:border-secondary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-sm bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                        <MapPin size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-text-primary">{t.title}</h3>
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{t.description}</p>
                      </div>
                      <ArrowRight size={16} className="text-text-secondary group-hover:text-accent transition-colors flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {recommendedCircles.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-secondary" />
                <h2 className="text-base font-bold text-text-primary">Circle Rekomendasi</h2>
              </div>
              <Link
                href="/circle"
                className="text-xs font-medium text-secondary hover:underline"
              >
                Lihat Semua
              </Link>
            </div>
            <div className="space-y-3">
              {recommendedCircles.map((c) => (
                <Link key={c.id} href={`/circle/${c.id}`}>
                  <Card padding="md" className="hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-sm bg-gradient-to-br ${c.color} flex items-center justify-center flex-shrink-0`}>
                        <Users size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-text-primary">{c.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 leading-none">{c.tag}</Badge>
                          <span className="text-xs text-text-secondary">{c.members} anggota</span>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-text-secondary group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="flex flex-col gap-3 mt-4">
          <Link href="/onboarding">
            <button className="w-full h-12 rounded-sm bg-primary text-primary-foreground text-sm font-bold cursor-pointer hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
              <Sparkles size={16} /> Lanjut ke Onboarding
            </button>
          </Link>
          <Link href="/">
            <button className="w-full h-12 rounded-sm border border-border bg-surface text-sm font-medium text-text-secondary cursor-pointer hover:border-primary/30 hover:text-text-primary transition-colors flex items-center justify-center gap-2">
              <Home size={16} /> Ke Beranda
            </button>
          </Link>
          <button
            onClick={handleRedo}
            className="w-full h-12 rounded-sm border border-border bg-surface text-sm font-medium text-text-secondary cursor-pointer hover:border-primary/30 hover:text-text-primary transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} /> Ulang Tes
          </button>
        </div>
      </div>

    </div>
  );
}
