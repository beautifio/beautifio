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

export interface StoryCategoryConstant {
  id: string;
  name: string;
  slug: string;
  icon: string;
  label: string;
}

export const STORY_CATEGORIES: StoryCategoryConstant[] = [
  { id: "cat-edu", name: "Education", slug: "education", icon: "BookOpen", label: "Edukasi" },
  { id: "cat-career", name: "Career", slug: "career", icon: "Briefcase", label: "Karir" },
  { id: "cat-biz", name: "Business", slug: "business", icon: "TrendingUp", label: "Bisnis" },
  { id: "cat-sports", name: "Sports", slug: "sports", icon: "Dumbbell", label: "Olahraga" },
  { id: "cat-music", name: "Music", slug: "music", icon: "Music", label: "Musik" },
  { id: "cat-gaming", name: "Gaming", slug: "gaming", icon: "Gamepad2", label: "Gaming" },
  { id: "cat-creator", name: "Creator", slug: "creator", icon: "Camera", label: "Kreator" },
  { id: "cat-beauty", name: "Beauty", slug: "beauty", icon: "Sparkles", label: "Kecantikan" },
  { id: "cat-tech", name: "Technology", slug: "technology", icon: "Monitor", label: "Teknologi" },
];
