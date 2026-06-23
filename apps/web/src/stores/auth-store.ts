import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  bisikMatchCount: number;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setBisikMatchCount: (count: number) => void;
  incrementBisikMatch: () => void;
  clearBisikMatch: () => void;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  bisikMatchCount: 0,
  setUser: (user) => {
    set({ user });
  },
  setSession: (session) => {
    set({ session });
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
      const { supabase } = await import("@/lib/supabase/client");
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // Proceed with local cleanup even if Supabase call fails
    }
    set({ user: null, session: null, isLoading: false, bisikMatchCount: 0 });
  },
  reset: () => {
    set({ user: null, session: null, isLoading: false, bisikMatchCount: 0 });
  },
}));
