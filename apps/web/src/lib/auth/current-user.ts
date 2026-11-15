import { getServerUser } from "./server-auth";

// Server-side current user from our own bf_session JWT.
// Kept as a thin alias so any future caller stays on the single source of truth
// (the Supabase REST users table, same as every other query in the app).
export async function getCurrentUser() {
  return getServerUser();
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
