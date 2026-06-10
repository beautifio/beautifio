"use client";

import { Users, GraduationCap, Briefcase } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { RoadmapTemplateRecommendation } from "@beautifio/types";

const config = {
  circle: { icon: Users, label: "Circle", color: "text-secondary", bg: "bg-secondary/10" },
  mentor: { icon: GraduationCap, label: "Mentor", color: "text-accent", bg: "bg-accent/10" },
  opportunity: { icon: Briefcase, label: "Peluang", color: "text-primary", bg: "bg-primary/10" },
} as const;

export function RoadmapRecommendations({
  recommendations,
}: {
  recommendations: RoadmapTemplateRecommendation[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <section>
      <h3 className="text-base font-bold text-text-primary mb-3">Rekomendasi</h3>
      <div className="grid grid-cols-1 gap-3">
        {recommendations.map((rec) => {
          const c = config[rec.resource_type];
          const Icon = c.icon;
          return (
            <div
              key={rec.id}
              className="flex items-center gap-3 p-4 rounded-sm border border-border hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className={`w-10 h-10 rounded-sm ${c.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={c.color} />
              </div>
              <div className="flex-1 min-w-0">
                <Badge
                  variant={rec.resource_type === "mentor" ? "accent" : rec.resource_type === "circle" ? "secondary" : "default"}
                  className="mb-1"
                >
                  {c.label}
                </Badge>
                <h4 className="text-sm font-semibold text-text-primary truncate">{rec.resource_name}</h4>
                {rec.resource_description && (
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{rec.resource_description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
