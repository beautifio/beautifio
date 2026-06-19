import { Home, Map, BookOpen, Users, type LucideIcon } from "lucide-react";

export interface NavTab {
  id: string;
  label: string;
  icon: LucideIcon;
  isSheet?: boolean; // tabs that open a sheet instead of navigating
}

export const NAV_TABS: NavTab[] = [
  { id: "home",      label: "Beranda",  icon: Home,     isSheet: true },
  { id: "journey",   label: "Journey",  icon: Map },
  // FAB slot here
  { id: "inspirasi", label: "Inspirasi", icon: BookOpen },
  { id: "circles",   label: "Circles",  icon: Users,    isSheet: true },
];

export function navRoute(id: string): string {
  if (id === "home") return "/home";
  if (id === "journey") return "/journey";
  if (id === "inspirasi") return "/inspirasi";
  return `/${id}`;
}
