import { cookies } from "next/headers";
import { signSessionToken, verifyToken, SESSION_COOKIE, SESSION_MAX_AGE } from "./jwt";
import type { SessionPayload } from "./jwt";

// Cookie-aware session wrappers (Node runtime: server components, actions,
// route handlers). For Edge/middleware use the helpers in ./jwt directly.

export { SESSION_COOKIE, verifyToken };
export type { SessionPayload };

/**
 * Create the signed JWT and set it as the httpOnly bf_session cookie.
 * Only the user id is stored — role is always read fresh from the DB.
 */
export async function createSession(userId: string): Promise<string> {
  const token = await signSessionToken({ sub: userId });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return token;
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** Read & verify the session from cookies(). */
export async function readSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifyToken(token);
}
