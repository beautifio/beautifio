export const GOAL_CATEGORIES = [
  { value: "karir", label: "Karir" },
  { value: "pendidikan", label: "Pendidikan" },
  { value: "skill", label: "Skill" },
  { value: "bisnis", label: "Bisnis" },
] as const;

export const OPP_CATEGORIES = [
  { value: "beasiswa", label: "Beasiswa" },
  { value: "magang", label: "Magang" },
  { value: "kompetisi", label: "Kompetisi" },
  { value: "workshop", label: "Workshop" },
] as const;

export const CIRCLE_STATUS = {
  active: "Aktif",
  full: "Penuh",
  inactive: "Tidak Aktif",
} as const;

export const MILESTONE_STATUS_LABEL = {
  locked: "Terkunci",
  available: "Tersedia",
  in_progress: "Sedang Dikerjakan",
  completed: "Selesai",
} as const;

export const STORY_CATEGORIES = [
  { value: "education", label: "Edukasi", icon: "BookOpen" },
  { value: "career", label: "Karir", icon: "Briefcase" },
  { value: "business", label: "Bisnis", icon: "TrendingUp" },
  { value: "sports", label: "Olahraga", icon: "Dumbbell" },
  { value: "music", label: "Musik", icon: "Music" },
  { value: "gaming", label: "Gaming", icon: "Gamepad2" },
  { value: "creator", label: "Kreator", icon: "Camera" },
  { value: "beauty", label: "Kecantikan", icon: "Sparkles" },
  { value: "technology", label: "Teknologi", icon: "Monitor" },
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
  education: "BookOpen",
  career: "Briefcase",
  business: "TrendingUp",
  sports: "Dumbbell",
  music: "Music",
  gaming: "Gamepad2",
  creator: "Camera",
  beauty: "Sparkles",
  technology: "Monitor",
};
