import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

// Server-side calls stay inside the docker network instead of hairpinning back out
// through public DNS -> Traefik -> TLS -> Kong (measured 102ms vs 8ms). The browser
// still uses NEXT_PUBLIC_SUPABASE_URL, which is what gets baked into the client bundle.
const SUPABASE_URL =
  process.env.SUPABASE_INTERNAL_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://api.beautifio.com";

// Server-side calls are authorized by our own bf_session JWT, not by a Supabase
// Auth JWT. RLS policies keyed on auth.uid() therefore cannot apply here, so we
// use the service-role key when available (falls back to the anon key).
const SERVER_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    SUPABASE_URL,
    SERVER_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore — called from Server Component or context where cookies are read-only
          }
        },
      },
    }
  );
}

export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createServerClient(SUPABASE_URL, key, {
    cookies: {
      getAll() { return []; },
      setAll() {},
    },
  });
}

export function createRouteClient(request: NextRequest) {
  // Route handlers authorize via our own bf_session JWT (verifyServerUser), so
  // they need the service-role key too — anon would be blocked by RLS policies
  // that reference auth.uid().
  return createServerClient(
    SUPABASE_URL,
    SERVER_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
        },
      },
    }
  );
}
