import { Home, Users, User, Compass, type LucideIcon } from "lucide-react";

export interface NavTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_TABS: NavTab[] = [
  { id: "home", label: "Beranda", icon: Home },
  { id: "journey", label: "Journey", icon: Compass },
  { id: "circle", label: "Circle", icon: Users },
  { id: "profil", label: "Profil", icon: User },
];

export function navRoute(id: string): string {
  if (id === "home") return "/home";
  if (id === "journey") return "/journey";
  return `/${id}`;
}
