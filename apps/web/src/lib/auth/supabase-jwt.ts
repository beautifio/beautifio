import { SignJWT } from "jose";

// Short-lived, PostgREST-compatible JWT for the BROWSER Supabase client.
//
// PostgREST populates `request.jwt.claim.sub` from the JWT's `sub` claim, which
// is exactly what auth.uid() reads. Minting this from our own bf_session keeps
// every existing RLS policy working after Supabase Auth was removed — no policy
// changes and no client-query rewrites needed.
//
// Signed with the Supabase project's JWT secret (server-only). This is NOT the
// bf_session secret (AUTH_SECRET); the two serve different verifiers.
const TTL_SECONDS = 60 * 60; // 1 hour

export async function mintPostgrestToken(
  sub: string
): Promise<{ token: string; expiresIn: number }> {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) throw new Error("SUPABASE_JWT_SECRET is not set");

  const token = await new SignJWT({
    aud: "authenticated",
    role: "authenticated",
    sub,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${TTL_SECONDS}s`)
    .sign(new TextEncoder().encode(secret));

  return { token, expiresIn: TTL_SECONDS };
}
