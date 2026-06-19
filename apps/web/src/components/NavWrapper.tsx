"use client";

import { usePathname, useRouter } from "next/navigation";
import { Search, User } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

export function NavWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLanding = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");
  const hideNav = isLanding || isAdmin;

  // Halaman tertentu tidak perlu top bar
  const hideTopBar = isLanding || isAdmin ||
    pathname.startsWith("/bisik/") || pathname.startsWith("/tebak/") ||
    pathname.startsWith("/login") || pathname.startsWith("/register");

  return (
    <div className={`min-h-screen bg-bg ${hideNav ? "" : "pb-16"}`}>
      {!hideTopBar && (
        <div className="sticky top-0 z-40 bg-surface/95 backdrop-blur-xl border-b border-border">
          <div className="max-w-content mx-auto flex items-center justify-between h-12 px-4">
            <button
              onClick={() => router.push("/search")}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer"
              aria-label="Cari"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => router.push("/profil")}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors cursor-pointer"
              aria-label="Profil"
            >
              <User size={18} />
            </button>
          </div>
        </div>
      )}
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
