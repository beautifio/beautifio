import { NextRequest, NextResponse } from "next/server";
import { verifyMailTransport } from "@/lib/mail";

export const dynamic = "force-dynamic";

/** Protected SMTP health check: GET /api/health/mail with the CRON_SECRET bearer. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await verifyMailTransport();
  return NextResponse.json(result, {
    status: result.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store, private" },
  });
}
