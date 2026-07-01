"use client"

import { usePathname } from "next/navigation"
import { MainTopBar } from "@/components/layout/MainTopBar"
import { BisikMatchNotifier } from "@/components/bisik/MatchNotifier"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideTopBar =
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/tebak/") ||
    pathname.startsWith("/tebak/") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")

  return (
    <>
      {!hideTopBar && <MainTopBar />}
      <BisikMatchNotifier />
      {children}
    </>
  )
}
