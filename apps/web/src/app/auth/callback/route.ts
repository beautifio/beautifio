import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createSession } from "@/lib/auth/session";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://beautifio.com";

const ALLOWED_PATHS = [
  "/", "/home", "/journey", "/profil", "/bisik", "/event", "/circle",
  "/belanja", "/voucher", "/login", "/register",
];

function resolveNext(nextRaw: string): string {
  const next = nextRaw.startsWith("/") ? nextRaw : "/";
  return ALLOWED_PATHS.some(p => next === p || next.startsWith(p + "/"))
    ? next
    : "/home";
}

/**
 * GET /auth/callback?code=...&next=...
 * Custom Google OAuth callback: exchange the authorization code, fetch the
 * Google profile, find-or-create a row in our users table, then create our
 * own bf_session JWT. Supabase Auth is no longer involved.
 */
export async function GET(request: NextRequest) {
  // NOTE: use the configured public app URL, NOT `new URL(request.url).origin`.
  // Behind Traefik the latter resolves to the container's internal address
  // (0.0.0.0:3000), which would send users to an unreachable host after login.
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = resolveNext(searchParams.get("next") ?? "/");

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(
      `${APP_URL}/login?error=google_oauth_not_configured`
    );
  }

  const redirectUri = `${APP_URL}/auth/callback`;

  try {
    // 1. Exchange authorization code for a Google access token.
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=google_token_exchange_failed`);
    }

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch Google user profile.
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return NextResponse.redirect(`${APP_URL}/login?error=google_profile_failed`);
    }

    const profile = await profileRes.json();
    const email: string | undefined = profile.email?.toLowerCase();
    const fullName: string = profile.name || "";
    const avatarUrl: string | null = profile.picture || null;

    if (!email) {
      return NextResponse.redirect(`${APP_URL}/login?error=google_no_email`);
    }

    // 3. Find or create user in our users table (Supabase client used as DB
    //    layer only — no Supabase Auth).
    const supabase = await createClient();

    const { data: existingUser } = await supabase
      .from("users")
      .select("id, role")
      .eq("email", email)
      .maybeSingle();

    let userId: string;
    let role: string;

    if (existingUser) {
      userId = existingUser.id;
      role = existingUser.role || "user";
    } else {
      const { data: newUser, error: createErr } = await supabase
        .from("users")
        .insert({
          email,
          full_name: fullName,
          avatar_url: avatarUrl,
          role: "user",
          status: "active",
          is_verified: true, // Google-verified email
          onboarding_completed: false,
          password_hash: null, // Google users have no local password
        })
        .select("id, role")
        .single();

      if (createErr || !newUser) {
        return NextResponse.redirect(`${APP_URL}/login?error=user_create_failed`);
      }
      userId = newUser.id;
      role = newUser.role || "user";
    }

    // 4. Create our own custom JWT session (sets the bf_session cookie).
    await createSession(userId, role);

    return NextResponse.redirect(`${APP_URL}${next}`);
  } catch {
    return NextResponse.redirect(`${APP_URL}/login?error=auth_failed`);
  }
}
