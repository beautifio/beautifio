import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

// Favicon redirect from app_settings. Prisma-backed (migration off Supabase).
export async function GET() {
  const row = await prisma.app_settings.findFirst({
    where: { key: "favicon_url" },
    select: { value: true },
  })
  if (row?.value) return NextResponse.redirect(row.value)
  return new NextResponse(null, { status: 204 })
}
