"use client";

import { useState } from "react";
import { MapPin, Home, BookOpen, Users, User } from "lucide-react";
import { BottomNavigation } from "@beautifio/ui";
import { ROADMAP_TEMPLATES } from "@beautifio/utils";
import type { RoadmapTemplate } from "@beautifio/types";
import { RoadmapCard } from "@/features/roadmap/components/RoadmapCard";

const tabs = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "cerita", label: "Cerita", icon: BookOpen },
  { id: "circle", label: "Circle", icon: Users },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "profile", label: "Profil", icon: User },
];

const mockTemplates: RoadmapTemplate[] = ROADMAP_TEMPLATES.map((t) => ({
  id: t.slug,
  slug: t.slug,
  title: t.title,
  description: t.description,
  category: t.slug,
  icon: t.icon,
  color: t.color,
  estimated_duration: t.duration,
  total_milestones: 4,
  created_at: "2026-06-01T00:00:00Z",
}));

export default function RoadmapListPage() {
  const [activeTab, setActiveTab] = useState("roadmap");

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-[390px] mx-auto px-6 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">Roadmap</h1>
          <p className="text-sm text-text-secondary mt-1">
            Pilih jalur pengembangan dirimu
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {mockTemplates.map((template) => (
            <RoadmapCard key={template.id} template={template} />
          ))}
        </div>
      </div>

      <BottomNavigation items={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
