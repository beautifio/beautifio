import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const results: Record<string, any> = {};

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    results.userInfo = { id: user?.id, email: user?.email, aud: user?.aud, role: user?.role };

    // 1. Query merchants
    const m1 = await supabase.from("familia_merchants").select("id, name").limit(3);
    results.merchantQuery = { ok: !m1.error, data: m1.data, error: m1.error?.message || null, code: m1.error?.code || null };

    // 2. Check if NEXT_PUBLIC_SUPABASE_ANON_KEY is actually service_role
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "missing";
    const localAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNpdmx0cXZxa2JheWt1YXp3ZGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwMjM3MTksImV4cCI6MjA5NjU5OTcxOX0.EQHzjHuaFRL6JcDuM4H8O0qxXemtJxVWoG_Y3FZ9ZLc";
    results.keyPrefix = anonKey.substring(0, 30);
    results.keyLength = anonKey.length;
    results.keyMatchesLocal = anonKey === localAnonKey;
    results.hasServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    results.anonKeyRole = (() => {
      try {
        const parts = anonKey.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
          return { role: payload.role, sub: payload.sub?.substring(0,20) };
        }
      } catch {}
      return null;
    })();

    // 3. Try raw REST query bypassing the client
    const testUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    results.supabaseUrl = testUrl;

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
