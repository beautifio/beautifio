import { NextResponse } from "next/server";
import { readSession } from "@/lib/auth/session";
import { mintPostgrestToken } from "@/lib/auth/supabase-jwt";

export const dynamic = "force-dynamic";

/**
 * Exchange the httpOnly bf_session cookie for a short-lived PostgREST-compatible
 * JWT. The browser Supabase client uses this as its access token so RLS policies
 * keyed on auth.uid() keep working. Never cache this response — it is per-user.
 */
export async function GET() {
  try {
    const session = await readSession();
    if (!session?.sub) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: { "Cache-Control": "no-store, private" } }
      );
    }

    const { token, expiresIn } = await mintPostgrestToken(session.sub);
    return NextResponse.json(
      { token, expiresIn },
      { headers: { "Cache-Control": "no-store, private" } }
    );
  } catch (error) {
    console.error("GET /api/auth/token:", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: { "Cache-Control": "no-store, private" } }
    );
  }
}
