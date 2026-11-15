import { SignJWT, jwtVerify } from "jose";

// Pure jose helpers — NO next/headers import, so this module is safe to use in
// the Edge runtime (middleware). The cookie-aware wrappers live in session.ts.

export const SESSION_COOKIE = "bf_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

/**
 * The session token carries ONLY the immutable subject (user id).
 *
 * Deliberately NO `role` claim: a 30-day token would otherwise serve a stale
 * role for up to 30 days after an admin demotion/promotion. Every authorization
 * decision reads the role fresh from `public.users` via getServerUser() /
 * verifyServerUser() in server-auth.ts (also used by /api/auth/me and
 * app/admin/layout.tsx). The middleware only checks that `sub` is present.
 */
export interface SessionPayload {
  sub: string;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ sub: payload.sub })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.sub !== "string") return null;
    return { sub: payload.sub };
  } catch {
    return null;
  }
}
