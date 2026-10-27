import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

// Own session (migration off Supabase Auth). Signed JWT in an httpOnly cookie.
// role is embedded so middleware (edge) can authorize without a DB round-trip;
// it is refreshed on every login.
const COOKIE = "bf_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  sub: string; // user id
  role?: string | null;
}

export async function createSession(userId: string, role?: string | null) {
  const token = await new SignJWT({ sub: userId, role: role ?? null })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

/** Verify the cookie and return its payload, or null. Safe on the edge (jose only). */
export async function readSession(): Promise<SessionPayload | null> {
  try {
    const token = (await cookies()).get(COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return { sub: payload.sub as string, role: (payload as any).role ?? null };
  } catch {
    return null;
  }
}

/** Verify a raw token string (for middleware, which has the request cookies). */
export async function verifyToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { sub: payload.sub as string, role: (payload as any).role ?? null };
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = COOKIE;
