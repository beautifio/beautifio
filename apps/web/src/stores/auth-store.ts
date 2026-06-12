import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  setUser: (user) => {
    set((state) => {
      if (state.user?.id === user?.id) return state;
      return { user };
    });
  },
  setSession: (session) => {
    set((state) => {
      if (state.session?.access_token === session?.access_token) return state;
      return { session };
    });
  },
  setLoading: (isLoading) => {
    set((state) => {
      if (state.isLoading === isLoading) return state;
      return { isLoading };
    });
  },
  signOut: async () => {
    try {
      const { supabase } = await import("@/lib/supabase/client");
      if (supabase) {
        await supabase.auth.signOut();
      }
    } catch {
      // Proceed with local cleanup even if Supabase call fails
    }
    set({ user: null, session: null, isLoading: false });
  },
  reset: () => {
    set({ user: null, session: null, isLoading: false });
  },
}));
