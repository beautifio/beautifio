import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// TEMPORARY: proves the Prisma client + engine are bundled and can reach the live DB.
// Remove once the first real pages are converted.
export async function GET() {
  try {
    const users = await prisma.users.count();
    return NextResponse.json({ ok: true, users });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}
