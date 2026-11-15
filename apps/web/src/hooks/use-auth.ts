"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: string;
  status: string;
  is_verified: boolean;
  onboarding_completed: boolean;
  // Compatibility fields: previously supplied by Supabase Auth. Our guest
  // sessions are flagged via `is_anonymous`; metadata mirrors the users row.
  is_anonymous?: boolean;
  app_metadata?: { provider?: string } | null;
  user_metadata?: { full_name?: string } | null;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user as AppUser | null);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser as (u: AppUser | null) => void);
  const setLoading = useAuthStore((s) => s.setLoading);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      if (cancelled) return;
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data?.data) {
            setUser(data.data as AppUser);
          }
        } else if (!cancelled) {
          setUser(null);
        }
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSession();

    // Listen for sign-out events from other tabs/windows
    const onStorage = (e: StorageEvent) => {
      if (e.key === "bf_signout") {
        setUser(null);
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled = true;
      window.removeEventListener("storage", onStorage);
    };
  }, [setUser, setLoading]);

  return { user, isLoading, signOut };
}
