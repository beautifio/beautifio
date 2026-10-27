import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Public familia event benefits. Prisma-backed (migration off Supabase).
export async function GET(request: NextRequest) {
  try {
    // This table has no slug column (the old slug lookup always 404'd); match by id.
    const id = request.nextUrl.searchParams.get("slug");

    if (id) {
      const data = await prisma.familia_event_benefits.findFirst({
        where: { id, is_active: true },
      });
      if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ data });
    }

    const data = await prisma.familia_event_benefits.findMany({
      where: { is_active: true },
      orderBy: { event_date: "asc" },
    });
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
