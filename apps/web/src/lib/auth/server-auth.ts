import { createClient } from "@/lib/supabase/server";
import { readSession, verifyToken } from "./session";

export interface SessionUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: string | null;
  status: string | null;
  is_verified: boolean | null;
  onboarding_completed: boolean | null;
}

const USER_FIELDS = "id, email, full_name, avatar_url, role, status, is_verified, onboarding_completed";

/**
 * Get the currently authenticated user from the custom JWT session (bf_session cookie).
 * Drop-in replacement for `supabase.auth.getUser()` in Server Components, actions,
 * route handlers.
 *
 * Uses the same Supabase REST/DB layer as the rest of the app (single source of
 * truth for `users`), not Prisma's separate Postgres. Returns null when the
 * session is missing/invalid or the user no longer exists.
 */
export async function getServerUser(): Promise<SessionUser | null> {
  const session = await readSession();
  if (!session?.sub) return null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select(USER_FIELDS)
      .eq("id", session.sub)
      .maybeSingle();
    return (data as SessionUser) ?? null;
  } catch {
    return null;
  }
}

/**
 * Verify a raw JWT token string (route handlers that pass request cookies).
 * Returns the users table row, or null.
 */
export async function verifyServerUser(token: string | undefined): Promise<SessionUser | null> {
  const payload = await verifyToken(token);
  if (!payload?.sub) return null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select(USER_FIELDS)
      .eq("id", payload.sub)
      .maybeSingle();
    return (data as SessionUser) ?? null;
  } catch {
    return null;
  }
}
