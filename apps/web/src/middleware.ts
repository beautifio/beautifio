import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const authPages = ["/login", "/register", "/forgot-password", "/auth"];

const protectedPages = [
  "/journey",
  "/profil",
  "/familia",
  "/jurnal",
  "/onboarding",
  "/welcome",
];

const deprecatedPages: Record<string, string> = {
  "/life": "/journey",
  "/life/start": "/journey",
  "/roadmap": "/journey",
  "/onboarding": "/journey",
  "/welcome": "/journey",
};

function isAuthPage(pathname: string): boolean {
  return authPages.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isProtectedPage(pathname: string): boolean {
  return protectedPages.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

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

  // Handle OAuth PKCE code exchange
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    const dest = error ? "/login?error=auth_failed" : "/home";
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

  // Redirect authenticated users away from auth pages
  if (isAuth && isAuthPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users away from protected pages
  if (!isAuth && isProtectedPage(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect deprecated pages (and sub-paths) to new Journey system
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
