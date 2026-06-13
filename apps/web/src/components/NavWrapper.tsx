"use client";

import { useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    NAV_TABS.forEach((tab) => router.prefetch(navRoute(tab.id)));
  }, [router]);

  const onTabChange = useCallback(
    (id: string) => router.push(navRoute(id)),
    [router],
  );

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
        onTabChange={onTabChange}
      />
    </div>
  );
}
