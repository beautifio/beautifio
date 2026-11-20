import type { ReactNode } from "react"
import Link from "next/link"
import { Horizon } from "@/components/landing/Horizon"
import { BrandLogo } from "@/components/landing/BrandLogo"

/**
 * Shared frame for auth & pre-app screens: a dusk band with the still horizon,
 * and a raised panel overlapping it. Depth comes from the overlap.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  backHref = "/",
}: {
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  backHref?: string | null
}) {
  return (
    <div className="min-h-[100svh] bg-embun">
      <div className="on-dark relative isolate h-[300px] overflow-hidden bg-night grain md:h-[340px]">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[78%]">
          <Horizon mode="still" showTrail={false} />
        </div>
        <div className="relative z-10 mx-auto flex max-w-md flex-col px-6 pt-[max(20px,env(safe-area-inset-top))]">
          <div className="flex h-12 items-center justify-center">
            {backHref ? (
              <Link href={backHref} aria-label="Kembali ke beranda Beautifio">
                <BrandLogo className="h-9 max-w-[200px]" />
              </Link>
            ) : (
              <BrandLogo className="h-9 max-w-[200px]" />
            )}
          </div>
          <h1 className="mt-7 text-center font-display text-[28px] font-bold leading-tight tracking-[-0.02em] text-white">
            {title}
          </h1>
          {subtitle ? (
            <p className="mx-auto mt-2 max-w-[32ch] text-center text-[15px] leading-relaxed text-white/70">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <main className="relative z-10 mx-auto -mt-16 w-full max-w-md px-4 pb-10">
        <div className="rounded-2xl border border-laut-700/[0.06] bg-white p-6 shadow-xl">{children}</div>
        {footer ? <div className="mt-6 text-center text-sm text-kabut">{footer}</div> : null}
      </main>
    </div>
  )
}
