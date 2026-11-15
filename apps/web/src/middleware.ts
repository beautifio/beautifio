import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, SESSION_COOKIE } from "@/lib/auth/jwt";

// Middleware runs in the Edge runtime: Prisma and the Supabase server client
// cannot run here. It therefore only gates on the presence of a VALID session.
// Role/authorization is checked against the DB in app/admin/layout.tsx (server
// component) and in the /api/admin route handlers themselves — reading the
// role from the JWT here would go stale for up to 30 days after a role change.
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifyToken(token);

  if (!session?.sub) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/mitra/:path*"],
};
