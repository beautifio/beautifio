"use client";

import { Users, GraduationCap, Briefcase, Package } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { RoadmapTemplateRecommendation } from "@beautifio/types";

const config = {
  circle: { icon: Users, label: "Circle Rekomendasi", color: "text-secondary", bg: "bg-secondary/10", badge: "secondary" as const },
  mentor: { icon: GraduationCap, label: "Mentor Rekomendasi", color: "text-accent", bg: "bg-accent/10", badge: "accent" as const },
  opportunity: { icon: Briefcase, label: "Peluang", color: "text-primary", bg: "bg-primary/10", badge: "default" as const },
  product: { icon: Package, label: "Produk Rekomendasi", color: "text-primary", bg: "bg-primary/10", badge: "default" as const },
};

export function RoadmapRecommendations({
  recommendations,
}: {
  recommendations: RoadmapTemplateRecommendation[];
}) {
  const grouped = {
    circle: recommendations.filter((r) => r.resource_type === "circle"),
    mentor: recommendations.filter((r) => r.resource_type === "mentor"),
    opportunity: recommendations.filter((r) => r.resource_type === "opportunity"),
    product: recommendations.filter((r) => r.resource_type === "product"),
  };

  const hasAny = Object.values(grouped).some((g) => g.length > 0);
  if (!hasAny) return null;

  return (
    <section>
      <h3 className="text-base font-bold text-text-primary mb-4">Rekomendasi</h3>
      <div className="space-y-5">
        {(["circle", "mentor", "opportunity", "product"] as const).map((type) => {
          const items = grouped[type];
          if (items.length === 0) return null;
          const c = config[type];
          const Icon = c.icon;

          return (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <Icon size={16} className={c.color} />
                <h4 className="text-sm font-semibold text-text-primary">{c.label}</h4>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {items.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center gap-3 p-3.5 rounded-sm border border-border hover:border-primary/30 hover:bg-surface transition-all cursor-pointer group"
                  >
                    <div className={`w-9 h-9 rounded-sm ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={16} className={c.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-semibold text-text-primary truncate">{rec.resource_name}</h5>
                      {rec.resource_description && (
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{rec.resource_description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
