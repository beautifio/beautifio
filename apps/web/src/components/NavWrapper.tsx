"use client";

import { useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BottomNavigation } from "@beautifio/ui";
import { NAV_TABS, navRoute } from "@/lib/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { LogIn, UserPlus, X, User } from "lucide-react";

const PROTECTED_TABS = ["journey", "circle", "profil"];

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [showGuestSheet, setShowGuestSheet] = useState(false);

  const isAnonymous = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous";

  const activeTab = (() => {
    if (pathname.startsWith("/journey")) return "journey";
    const match = NAV_TABS.find((tab) => {
      const route = navRoute(tab.id);
      return pathname === route || pathname.startsWith(route + "/");
    });
    return match?.id ?? "home";
  })();

  const onTabChange = useCallback(
    (id: string) => {
      if (user) {
        // Anonymous user clicking "profil" → show guest sheet instead
        if (id === "profil" && isAnonymous) {
          setShowGuestSheet(true);
          return;
        }
        router.push(navRoute(id));
        return;
      }

      // No user → protected tabs show sheet
      if (PROTECTED_TABS.includes(id)) {
        setPendingTab(id);
        return;
      }

      router.push(navRoute(id));
    },
    [user, isAnonymous, router],
  );

  const onTabHover = useCallback(
    (id: string) => {
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

      {/* Guest sheet for anonymous profil */}
      {showGuestSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowGuestSheet(false)}
          />
          <div className="relative w-full max-w-content bg-surface rounded-t-2xl px-6 pt-6 pb-8 animate-in slide-in-from-bottom duration-300">
            <button
              onClick={() => setShowGuestSheet(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-muted transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User size={24} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-text-primary">
                Kamu pakai mode tamu
              </h3>
              <p className="text-sm text-text-secondary mt-1.5">
                Daftar untuk menyimpan progress selamanya
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  router.push("/register?upgrade=true");
                  setShowGuestSheet(false);
                }}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <UserPlus size={16} /> Daftar Gratis
              </button>
              <button
                onClick={() => {
                  router.push(navRoute("profil"));
                  setShowGuestSheet(false);
                }}
                className="w-full py-3.5 rounded-xl border border-border bg-surface text-text-primary font-semibold text-sm flex items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                Lanjut sebagai Tamu
              </button>
            </div>

            <p className="text-[11px] text-text-secondary/50 text-center mt-4">
              Kamu hanya bisa akses dari browser ini sampai daftar
            </p>
          </div>
        </div>
      )}

      {/* Login prompt sheet for unauthenticated users */}
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
