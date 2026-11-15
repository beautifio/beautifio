import { createBrowserClient } from "@supabase/ssr";

// Supabase is used strictly as the data/REST layer now — all authentication
// lives in our own bf_session JWT (see lib/auth/*).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://api.beautifio.com";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// The bf_session cookie is httpOnly, so the browser cannot read it. Instead we
// exchange it for a short-lived PostgREST-compatible JWT via a same-origin
// endpoint. supabase-js calls this provider on every request; the result is
// cached in memory. Returning `null` (no session) makes supabase-js fall back to
// the anon key, which keeps public reads working for logged-out visitors.
let cachedToken: { token: string; validUntil: number } | null = null;
let anonymousUntil = 0;

async function getAccessToken(): Promise<string | null> {
  // supabase-js calls this provider once at construction time (realtime.setAuth).
  // During static prerendering that construction happens on the server, where a
  // same-origin fetch() with cache:"no-store" would flip a static page to
  // dynamic at runtime ("Page changed from static to dynamic"). Only ever fetch
  // in the browser; on the server simply fall back to the anon key.
  if (typeof window === "undefined") return null;

  if (cachedToken && Date.now() < cachedToken.validUntil) return cachedToken.token;
  if (Date.now() < anonymousUntil) return null;

  try {
    const res = await fetch("/api/auth/token", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      cachedToken = null;
      anonymousUntil = Date.now() + 30_000; // avoid a fetch on every anon query
      return null;
    }
    const data = await res.json();
    if (!data?.token) {
      cachedToken = null;
      anonymousUntil = Date.now() + 30_000;
      return null;
    }
    cachedToken = {
      token: data.token,
      validUntil: Date.now() + (data.expiresIn - 120) * 1000, // refresh 2m early
    };
    anonymousUntil = 0;
    return cachedToken.token;
  } catch {
    cachedToken = null;
    anonymousUntil = Date.now() + 10_000;
    return null;
  }
}

/** Drop cached tokens after logout so a stale JWT cannot keep reading user data. */
export function resetAccessTokenCache() {
  cachedToken = null;
  anonymousUntil = 0;
}

export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    accessToken: getAccessToken,
  });
}

export const supabase = createClient();
