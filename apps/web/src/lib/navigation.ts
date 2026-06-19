import { Home, Map, BookOpen, Users, type LucideIcon } from "lucide-react";

export interface NavTab {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
}

export const NAV_TABS: NavTab[] = [
  { id: "home",      label: "Beranda",  icon: Home,     href: "/home" },
  { id: "journey",   label: "Journey",  icon: Map,      href: "/journey" },
  { id: "inspirasi", label: "Inspirasi", icon: BookOpen, href: "/inspirasi" },
  { id: "circle",    label: "Circles",  icon: Users,    href: "/circle" },
];

export function navRoute(id: string): string {
  const tab = NAV_TABS.find((t) => t.id === id)
  return tab?.href ?? `/${id}`
}
