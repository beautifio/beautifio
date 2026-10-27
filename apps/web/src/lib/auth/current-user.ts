import { prisma } from "@/lib/prisma";
import { readSession } from "./session";

// Server-side current user from our own session (migration off Supabase Auth).
// Replaces supabase.auth.getUser() in server components, actions, and route handlers.
export async function getCurrentUser() {
  const session = await readSession();
  if (!session?.sub) return null;
  try {
    return await prisma.users.findUnique({
      where: { id: session.sub },
      select: { id: true, email: true, full_name: true, role: true, avatar_url: true, is_bot: true },
    });
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
