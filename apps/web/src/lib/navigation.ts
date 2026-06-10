import { Home, BookHeart, MapPin, Users, User, type LucideIcon } from "lucide-react";

export interface NavTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_TABS: NavTab[] = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "inspirasi", label: "Inspirasi", icon: BookHeart },
  { id: "roadmap", label: "Roadmap", icon: MapPin },
  { id: "circle", label: "Circle", icon: Users },
  { id: "profil", label: "Profil", icon: User },
];

export function navRoute(id: string): string {
  if (id === "home") return "/home";
  return `/${id}`;
}
