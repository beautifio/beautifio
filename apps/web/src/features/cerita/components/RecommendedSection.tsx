"use client";

import { MapPin, Users, Package, ArrowRight } from "lucide-react";
import { Badge } from "@beautifio/ui";
import type { StoryRecommendation } from "@beautifio/types";

const resourceConfig = {
  roadmap: { icon: MapPin, label: "Roadmap", color: "text-accent", bg: "bg-accent/10" },
  circle: { icon: Users, label: "Circle", color: "text-secondary", bg: "bg-secondary/10" },
  product: { icon: Package, label: "Produk", color: "text-primary", bg: "bg-primary/10" },
} as const;

export function RecommendedSection({
  recommendations,
}: {
  recommendations: StoryRecommendation[];
}) {
  if (recommendations.length === 0) return null;

  return (
    <section>
      <h3 className="text-base font-bold text-text-primary mb-3">Rekomendasi</h3>
      <div className="space-y-3">
        {recommendations.map((rec) => {
          const config = resourceConfig[rec.resource_type];
          const Icon = config.icon;
          return (
            <div
              key={rec.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-secondary/30 hover:bg-muted/30 transition-all cursor-pointer group"
            >
              <div
                className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={18} className={config.color} />
              </div>
              <div className="flex-1 min-w-0">
                <Badge
                  variant={
                    rec.resource_type === "roadmap"
                      ? "accent"
                      : rec.resource_type === "circle"
                        ? "secondary"
                        : "default"
                  }
                  className="mb-1"
                >
                  {config.label}
                </Badge>
                <h4 className="text-sm font-semibold text-text-primary truncate">
                  {rec.resource_name}
                </h4>
                {rec.resource_description && (
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">
                    {rec.resource_description}
                  </p>
                )}
              </div>
              <ArrowRight
                size={16}
                className="text-text-secondary group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
