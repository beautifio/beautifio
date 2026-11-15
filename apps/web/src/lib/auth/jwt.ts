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

export interface SessionPayload {
  sub: string;
  role?: string | null;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ sub: payload.sub, role: payload.role ?? null })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { sub: payload.sub as string, role: (payload as any).role ?? null };
  } catch {
    return null;
  }
}
