"use client";

import { useRouter } from "next/navigation";
import {
  MapPin, Users, BookHeart, Briefcase, Gift, Trophy, GraduationCap,
  BookOpen, Star, ShoppingBag, Shield, Sparkles, Target,
} from "lucide-react";
import { Badge } from "@beautifio/ui";

export type ItemType =
  | "story" | "roadmap" | "circle" | "mentor" | "opportunity"
  | "product" | "familia-voucher" | "familia-deal" | "familia-reward"
  | "journal" | "resource" | "event" | "goal";

export interface EcosystemItem {
  id: string;
  type: ItemType;
  title: string;
  subtitle?: string;
  href?: string;
  image?: string;
}

interface EcosystemSectionProps {
  title: string;
  subtitle?: string;
  items: EcosystemItem[];
}

const ICON_MAP: Record<ItemType, typeof MapPin> = {
  story: BookHeart, roadmap: MapPin, circle: Users, mentor: Star,
  opportunity: Briefcase, product: ShoppingBag,
  "familia-voucher": Gift, "familia-deal": ShoppingBag, "familia-reward": Trophy,
  journal: BookOpen, resource: Shield, event: Sparkles, goal: Target,
};

const COLOR_MAP: Record<ItemType, string> = {
  story: "text-primary bg-primary/10",
  roadmap: "text-accent bg-accent/10",
  circle: "text-secondary bg-secondary/10",
  mentor: "text-amber-600 bg-amber-50",
  opportunity: "text-blue-600 bg-blue-50",
  product: "text-emerald-600 bg-emerald-50",
  "familia-voucher": "text-amber-600 bg-amber-50",
  "familia-deal": "text-blue-600 bg-blue-50",
  "familia-reward": "text-emerald-600 bg-emerald-50",
  journal: "text-primary bg-primary/10",
  resource: "text-purple-600 bg-purple-50",
  event: "text-rose-600 bg-rose-50",
  goal: "text-accent bg-accent/10",
};

const LABEL_MAP: Record<ItemType, string> = {
  story: "Cerita", roadmap: "Roadmap", circle: "Circle", mentor: "Mentor",
  opportunity: "Peluang", product: "Produk",
  "familia-voucher": "Voucher", "familia-deal": "Deal", "familia-reward": "Reward",
  journal: "Jurnal", resource: "Resource", event: "Event", goal: "Goal",
};

const TYPE_VARIANT: Record<ItemType, "accent" | "secondary" | "default" | "success" | "warning" | "destructive"> = {
  story: "default", roadmap: "accent", circle: "secondary", mentor: "warning",
  opportunity: "accent", product: "success",
  "familia-voucher": "warning", "familia-deal": "accent", "familia-reward": "success",
  journal: "default", resource: "default", event: "warning", goal: "accent",
};

export function EcosystemSection({ title, subtitle, items }: EcosystemSectionProps) {
  const router = useRouter();

  if (items.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-text-primary">{title}</h3>
          {subtitle && <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-2.5">
        {items.slice(0, 4).map((item) => {
          const colorClass = COLOR_MAP[item.type];
          const Icon = ICON_MAP[item.type];
          const badgeVariant = TYPE_VARIANT[item.type];

          return (
            <button
              key={item.id}
              onClick={() => { if (item.href) router.push(item.href); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-surface border border-border hover:border-primary/20 hover:bg-muted/30 transition-all text-left cursor-pointer group"
            >
              {item.image ? (
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Badge variant={badgeVariant} className="mb-0.5 text-[10px]">
                  {LABEL_MAP[item.type]}
                </Badge>
                <p className="text-sm font-semibold text-text-primary truncate">{item.title}</p>
                {item.subtitle && (
                  <p className="text-xs text-text-secondary mt-0.5 truncate">{item.subtitle}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

type GroupedItems = { title: string; subtitle?: string; items: EcosystemItem[] };

export function EcosystemLinks({ groups }: { groups: GroupedItems[] }) {
  if (groups.length === 0) return null;

  return (
    <div className="border-t border-border pt-6 mt-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={16} className="text-accent" />
        <h3 className="text-sm font-bold text-text-primary">Jelajahi Ekosistem</h3>
      </div>
      {groups.map((group, i) => (
        <EcosystemSection key={i} title={group.title} subtitle={group.subtitle} items={group.items} />
      ))}
    </div>
  );
}
