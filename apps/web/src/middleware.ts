import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const PUBLIC_ROUTES = [
  "/",
  "/home",
  "/login",
  "/register",
  "/mimpi",
  "/journey",
  "/inspirasi",
  "/circle",
  "/profil",
  "/auth/callback",
  "/trial-expired",
];

const ANONYMOUS_BLOCKED = [
  "/profil/settings",
];

const deprecatedPages: Record<string, string> = {
  "/life": "/journey",
  "/life/start": "/journey",
  "/roadmap": "/journey",
  "/onboarding": "/journey",
  "/welcome": "/journey",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Handle OAuth PKCE code exchange — delegate to /auth/callback route handler
  const isCallbackRoute = pathname === "/auth/callback";
  const code = isCallbackRoute ? null : request.nextUrl.searchParams.get("code");
  if (code) {
    const mimpi = request.nextUrl.searchParams.get("mimpi");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }
    const dest = mimpi ? `/home?mimpi=${mimpi}` : "/home";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Try getUser with retry for transient failures (cookie propagation race)
  let user: any = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
      if (user) break;
    } catch {
      if (attempt === 0) {
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
    }
  }

  // Fallback to cookie presence check only if both retries failed
  if (!user) {
    try {
      const { data } = await supabase.auth.getSession();
      user = data?.session?.user ?? null;
    } catch {
      // truly not authenticated
    }
  }

  const isAuth = !!user;
  const isAnonymous = user?.is_anonymous === true || user?.app_metadata?.provider === "anonymous";

  const isPublic = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // Unauthenticated → only allow public routes
  if (!isAuth && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Check trial expiration for anonymous users
  if (isAnonymous && user) {
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("trial_expires_at")
        .eq("id", user.id)
        .single();

      if (userData?.trial_expires_at) {
        const isTrialExpired = new Date() > new Date(userData.trial_expires_at);
        if (isTrialExpired && pathname !== "/trial-expired") {
          const url = request.nextUrl.clone();
          url.pathname = "/trial-expired";
          return NextResponse.redirect(url);
        }
      }
    } catch {
      // If the query fails, allow access (degrade gracefully)
    }

    // Block certain routes for anonymous users
    if (ANONYMOUS_BLOCKED.some((p) => pathname.startsWith(p))) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Authenticated on landing or auth pages → redirect to home
  // Allow anonymous users to access /register or /login with ?upgrade=true
  if (isAuth && !(isAnonymous && request.nextUrl.searchParams.get("upgrade") === "true")) {
    if (pathname === "/" || pathname === "/login" || pathname === "/register") {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      const mimpi = request.nextUrl.searchParams.get("mimpi");
      if (mimpi) url.searchParams.set("mimpi", mimpi);
      return NextResponse.redirect(url);
    }
  }

  // Redirect deprecated pages to new Journey system
  const deprecatedMatch = Object.entries(deprecatedPages).find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  if (isAuth && deprecatedMatch) {
    const url = request.nextUrl.clone();
    url.pathname = deprecatedMatch[1];
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
