"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Home, BookOpen, Users, User, Compass } from "lucide-react";
import { BottomNavigation, Badge } from "@beautifio/ui";
import { ROADMAP_TEMPLATES, ROADMAP_CATEGORIES } from "@beautifio/utils";
import type { RoadmapTemplate } from "@beautifio/types";
import { RoadmapCard } from "@/features/roadmap/components/RoadmapCard";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "discover", label: "Temukan", icon: Compass },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profil", label: "Profil", icon: User },
];

const mockTemplates: RoadmapTemplate[] = ROADMAP_TEMPLATES.map((t) => ({
  id: t.slug,
  slug: t.slug,
  title: t.title,
  description: t.description,
  category: t.category,
  icon: t.icon,
  color: t.color,
  estimated_duration: t.duration,
  total_milestones: 4,
  created_at: "2026-06-01T00:00:00Z",
}));

export default function RoadmapListPage() {
  const [activeTab, setActiveTab] = useState("roadmap");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const router = useRouter();

  const filtered = useMemo(
    () => selectedCategory
      ? mockTemplates.filter((t) => t.category === selectedCategory)
      : mockTemplates,
    [selectedCategory]
  );

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-6 pt-6 pb-24">
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-text-primary">Roadmap</h1>
          <p className="text-sm text-text-secondary mt-1">
            Pilih jalur pengembangan dirimu
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              !selectedCategory
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-text-primary"
            }`}
          >
            Semua
          </button>
          {ROADMAP_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.slug
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-surface text-text-secondary border-border hover:border-primary/30 hover:text-text-primary"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filtered.length > 0 ? (
            filtered.map((template, i) => (
              <div key={template.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 80}ms` }}>
                <RoadmapCard template={template} />
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MapPin size={32} className="mx-auto text-text-secondary/30 mb-3" />
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <MapPin size={28} className="text-text-secondary/40" />
              </div>
              <p className="text-sm font-semibold text-text-primary">Tidak ada roadmap ditemukan</p>
              <p className="text-xs text-text-secondary mt-1">Coba pilih kategori lain</p>
            </div>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation items={tabs} activeTab={activeTab} onTabChange={(id) => { setActiveTab(id); if (id === "home") router.push("/home"); else router.push(`/${id}`); }} />
    </div>
  );
}
