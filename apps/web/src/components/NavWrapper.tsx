"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getGuestJourney, isTrialExpired } from "@/lib/guest-journey";
import { LogIn, UserPlus, X } from "lucide-react";

const PROTECTED_TABS = ["journey", "circle", "profil"];

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const activeTab = (() => {
    if (pathname.startsWith("/coba/")) return "journey";
    const match = NAV_TABS.find((tab) => {
      const route = navRoute(tab.id);
      return pathname === route || pathname.startsWith(route + "/");
    });
    return match?.id ?? "home";
  })();

  const onTabChange = useCallback(
    (id: string) => {
      if (user) {
        router.push(navRoute(id));
        return;
      }

      // Active guest trial → all tabs navigate directly (no login prompt)
      const guest = getGuestJourney();
      if (guest && !isTrialExpired(guest.startDate)) {
        if (id === "journey") {
          router.push(`/coba/${guest.templateSlug}`);
        } else {
          router.push(navRoute(id));
        }
        return;
      }

      // No guest trial, no user → protected tabs show sheet
      if (PROTECTED_TABS.includes(id)) {
        setPendingTab(id);
        return;
      }

      router.push(navRoute(id));
    },
    [user, router],
  );

  const onTabHover = useCallback(
    (id: string) => {
      if (id === "journey") {
        const guest = getGuestJourney();
        if (guest && !isTrialExpired(guest.startDate)) {
          router.prefetch(`/coba/${guest.templateSlug}`);
          return;
        }
      }
      router.prefetch(navRoute(id));
    },
    [router],
  );

  return (
    <div className="min-h-screen bg-bg pb-16">
      {children}
      <BottomNavigation
        items={NAV_TABS}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onTabHover={onTabHover}
      />

      {pendingTab && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPendingTab(null)}
          />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <button
              onClick={() => setPendingTab(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-base font-bold text-text-primary">
                Masuk atau daftar untuk mengakses ini
              </h3>
              <p className="text-sm text-text-secondary mt-1.5">
                Fitur ini tersedia setelah kamu masuk akun
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  router.push("/login");
                  setPendingTab(null);
                }}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <LogIn size={16} /> Masuk
              </button>
              <button
                onClick={() => {
                  router.push("/register");
                  setPendingTab(null);
                }}
                className="w-full py-3.5 rounded-xl border border-border bg-surface text-text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <UserPlus size={16} /> Daftar
              </button>
            </div>

            <p className="text-[11px] text-text-secondary/50 text-center mt-4">
              Gratis, tidak perlu email
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
