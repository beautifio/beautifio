import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth/server-auth";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Shape-compatible with the old Supabase Auth user object so existing UI
    // (home / profil / journey) keeps working without changes.
    const isAnonymous = user.email?.startsWith("guest-") ?? false;
    return NextResponse.json({
      data: {
        ...user,
        is_anonymous: isAnonymous,
        app_metadata: { provider: isAnonymous ? "anonymous" : "email" },
        user_metadata: { full_name: user.full_name },
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
