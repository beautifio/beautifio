import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const authPages = ["/login", "/register", "/forgot-password", "/auth"];

const protectedPages = [
  "/home",
  "/journey",
  "/profil",
  "/cerita",
  "/circle",
  "/mentors",
  "/discover",
  "/inspirasi",
  "/familia",
  "/jurnal/buat",
  "/inspirasi/post",
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

  let user: any = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data?.user;
  } catch {
    // Session check failed — treat as unauthenticated
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
