"use client";

import { useEffect, useState } from "react";
import { Flame, BookOpen, Library, MapPin, TrendingUp, GraduationCap } from "lucide-react";
import { Skeleton } from "@beautifio/ui";
import { ROADMAP_V3_SEED, getStreak, getStoredReflections, getVaultItems } from "@beautifio/utils";

const READ_LESSONS_KEY = "beautifio_masterclass_read";

function getReadLessons(): string[] {
  try {
    const raw = localStorage.getItem(READ_LESSONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function getTotalLessons(): number {
  let count = 0;
  for (const slug of Object.keys(ROADMAP_V3_SEED)) {
    count += (ROADMAP_V3_SEED[slug].masterclassLessons?.length || 0);
  }
  return count;
}

export function GrowthTracker() {
  const [stats, setStats] = useState<{
    totalStreak: number;
    totalReflections: number;
    totalVaultItems: number;
    activeRoadmaps: number;
    totalLessons: number;
    readLessons: number;
    depthScore: number;
  } | null>(null);

  useEffect(() => {
    const slugs = Object.keys(ROADMAP_V3_SEED);
    let totalStreak = 0;
    let totalReflections = 0;
    let totalVault = 0;
    let activeCount = 0;

    for (const slug of slugs) {
      const s = getStreak(slug);
      totalStreak += s;
      if (s > 0) activeCount++;
      totalReflections += getStoredReflections(slug).length;
      totalVault += getVaultItems(slug).length;
    }

    const totalLessons = getTotalLessons();
    const readLessons = getReadLessons().length;

    setStats({
      totalStreak,
      totalReflections,
      totalVaultItems: totalVault,
      activeRoadmaps: activeCount,
      totalLessons,
      readLessons,
      depthScore: totalStreak + totalReflections + totalVault + readLessons,
    });
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-3 rounded-xl bg-muted/30">
            <Skeleton className="h-6 w-12 mb-1" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>
    );
  }

  const items = [
    {
      icon: Flame,
      label: "Total Streak",
      value: `${stats.totalStreak} hari`,
      color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20",
    },
    {
      icon: BookOpen,
      label: "Refleksi",
      value: `${stats.totalReflections}`,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: Library,
      label: "Tersimpan",
      value: `${stats.totalVaultItems}`,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: MapPin,
      label: "Roadmap Aktif",
      value: `${stats.activeRoadmaps}`,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      icon: GraduationCap,
      label: "Masterclass",
      value: `${stats.readLessons}/${stats.totalLessons}`,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-900/20",
    },
    {
      icon: TrendingUp,
      label: "Depth Score",
      value: `${stats.depthScore}`,
      color: "text-primary bg-primary/10",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-primary" />
        <span className="text-xs font-bold text-text-secondary uppercase tracking-wide">Growth Tracker</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="flex items-center gap-2.5 p-3 rounded-xl bg-surface border border-border">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-text-primary">{item.value}</p>
                <p className="text-[10px] text-text-secondary">{item.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
