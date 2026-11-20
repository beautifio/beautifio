import { HeartHandshake, GraduationCap, Users } from "lucide-react"
import { IconTile } from "@beautifio/ui"
import { ChapterLabel } from "./ChapterLabel"
import { ChatPreview } from "./ChatPreview"

export function ChapterBersama() {
  return (
    <section aria-labelledby="bersama-title" className="relative bg-embun px-5 pb-24 md:px-10 md:pb-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 border-t border-garis pt-20 md:grid-cols-2 md:gap-20 md:pt-28">
        <div>
          <ChapterLabel tone="light">Nggak sendirian</ChapterLabel>
          <h2 id="bersama-title" className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.025em] text-tinta">
            Ada yang menemani, termasuk saat hari terasa berat.
          </h2>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-kabut">
            Bisik mempertemukanmu dengan teman ngobrol anonim yang sedang melewati hal serupa. Cerita apa saja, tanpa
            takut dinilai.
          </p>

          <div className="surface-deep grain mt-8 rounded-xl p-5">
            <div className="relative z-10 flex gap-4">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-fajar ring-1 ring-inset ring-white/15">
                <HeartHandshake className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-[17px] font-semibold text-white">Beautifio Care</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-white/70">
                  Saat butuh bicara dengan yang lebih berpengalaman, Care menyediakan ruang konsultasi, termasuk untuk
                  keadaan darurat.
                </p>
              </div>
            </div>
          </div>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            <li className="surface-raised flex gap-3 rounded-xl p-4">
              <IconTile tone="langit" size="sm"><GraduationCap /></IconTile>
              <div>
                <p className="font-display text-[15px] font-semibold text-tinta">Mentor</p>
                <p className="mt-0.5 text-sm text-kabut">Belajar dari yang sudah lebih dulu jalan.</p>
              </div>
            </li>
            <li className="surface-raised flex gap-3 rounded-xl p-4">
              <IconTile tone="fajar" size="sm"><Users /></IconTile>
              <div>
                <p className="font-display text-[15px] font-semibold text-tinta">Circles</p>
                <p className="mt-0.5 text-sm text-kabut">Komunitas kecil dengan mimpi yang mirip.</p>
              </div>
            </li>
          </ul>
        </div>
        <ChatPreview />
      </div>
    </section>
  )
}
