"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuthStore } from "@/stores/auth-store";

const REFRESH_INTERVAL = 10 * 60 * 1000;

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setUser = useAuthStore((s) => s.setUser);
  const setSession = useAuthStore((s) => s.setSession);
  const setLoading = useAuthStore((s) => s.setLoading);
  const signOut = useAuthStore((s) => s.signOut);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") {
        setUser(null);
        setSession(null);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
    });

    const refreshTimer = setInterval(async () => {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !cancelled) {
          setSession(session);
          setUser(session.user);
        }
      } catch {
        // silent
      }
    }, REFRESH_INTERVAL);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      clearInterval(refreshTimer);
    };
  }, [setUser, setSession, setLoading]);

  return { user, session, isLoading, signOut };
}
