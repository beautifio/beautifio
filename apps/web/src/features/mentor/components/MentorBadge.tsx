"use client";

import { GraduationCap, Award, Briefcase, Trophy } from "lucide-react";
import type { MentorBadge as MentorBadgeType } from "@beautifio/types";

const iconMap = {
  education: GraduationCap,
  certification: Award,
  experience: Briefcase,
  achievement: Trophy,
};

const colorMap = {
  education: "text-blue-600 bg-blue-100",
  certification: "text-purple-600 bg-purple-100",
  experience: "text-green-600 bg-green-100",
  achievement: "text-accent-foreground bg-accent/20",
};

export function MentorBadge({ badge }: { badge: MentorBadgeType }) {
  const Icon = iconMap[badge.type];
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-medium ${colorMap[badge.type]}`}>
      <Icon size={12} />
      <span>{badge.label}</span>
    </div>
  );
}
