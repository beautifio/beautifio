"use client";

import { usePathname, useRouter } from "next/navigation";
import { BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const activeTab = NAV_TABS.find((tab) => {
    const route = navRoute(tab.id);
    return pathname === route || pathname.startsWith(route + "/");
  })?.id ?? "home";

  return (
    <div className="min-h-screen bg-bg pb-20">
      {children}
      <BottomNavigation
        items={NAV_TABS}
        activeTab={activeTab}
        onTabChange={(id) => router.push(navRoute(id))}
      />
    </div>
  );
}
