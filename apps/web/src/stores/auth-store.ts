import { create } from "zustand";
import { resetAccessTokenCache } from "@/lib/supabase/client";

interface AppUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  role: string;
}

interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  bisikMatchCount: number;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  setBisikMatchCount: (count: number) => void;
  incrementBisikMatch: () => void;
  clearBisikMatch: () => void;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  bisikMatchCount: 0,
  setUser: (user) => {
    set({ user });
  },
  setLoading: (isLoading) => {
    set((state) => {
      if (state.isLoading === isLoading) return state;
      return { isLoading };
    });
  },
  setBisikMatchCount: (bisikMatchCount) => set({ bisikMatchCount }),
  incrementBisikMatch: () => set((s) => ({ bisikMatchCount: s.bisikMatchCount + 1 })),
  clearBisikMatch: () => set({ bisikMatchCount: 0 }),
  signOut: async () => {
    try {
      const res = await fetch("/api/auth/signout", { method: "POST" });
      if (!res.ok) {
        // Ignore server errors, proceed with local cleanup
      }
    } catch {
      // Ignore network errors
    }
    // Drop the in-memory PostgREST JWT so a stale token cannot read user data.
    resetAccessTokenCache();
    // Notify other tabs to sign out
    try {
      localStorage.setItem("bf_signout", Date.now().toString());
    } catch {
      // Ignore
    }
    set({ user: null, isLoading: false, bisikMatchCount: 0 });
  },
  reset: () => {
    set({ user: null, isLoading: false, bisikMatchCount: 0 });
  },
}));
