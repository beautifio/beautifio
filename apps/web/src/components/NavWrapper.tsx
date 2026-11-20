"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/BottomNav";

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const isOnboarding = pathname === "/onboarding" || pathname === "/welcome";
  // Layar permainan Tebak Aku fokus penuh (punya tombol kembali sendiri)
  const isTebakGame = pathname.startsWith("/tebak/") && !pathname.startsWith("/tebak/leaderboard");
  const hideNav = isLanding || isAdmin || isOnboarding || isTebakGame;

  return (
    <div className={`min-h-screen bg-bg`}>
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
