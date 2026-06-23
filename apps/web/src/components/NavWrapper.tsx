"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const isOnboarding = pathname === "/onboarding" || pathname === "/welcome";
  const hideNav = isLanding || isAdmin || isOnboarding;

  return (
    <div className={`min-h-screen bg-bg ${hideNav ? "" : "pb-16"}`}>
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
