import Link from "next/link"
import { BookOpen, CalendarDays, Sparkles, Ticket } from "lucide-react"
import { IconTile } from "@beautifio/ui"
import { Horizon } from "./Horizon"
import { StartButton } from "./StartButton"

const MORE = [
  { icon: BookOpen, title: "Inspirasi", text: "Artikel dan kisah untuk menemukan ide.", tone: "laut" as const },
  { icon: CalendarDays, title: "Event", text: "Acara untuk belajar dan bertemu orang baru.", tone: "langit" as const },
  { icon: Sparkles, title: "Peluang", text: "Kesempatan untuk mengembangkan diri.", tone: "fajar" as const },
  { icon: Ticket, title: "Voucher", text: "Potongan harga dari mitra Beautifio Familia.", tone: "senja" as const },
]

export function MoreFeatures() {
  return (
    <section aria-labelledby="more-title" className="bg-embun px-5 pb-20 md:px-10 md:pb-28">
      <div className="mx-auto max-w-6xl">
        <h2 id="more-title" className="font-display text-xl font-semibold text-tinta">Juga ada di Beautifio</h2>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MORE.map(({ icon: Icon, title, text, tone }) => (
            <li key={title} className="flex items-start gap-3 rounded-xl border border-garis bg-white/60 p-4">
              <IconTile tone={tone} size="sm"><Icon /></IconTile>
              <div>
                <p className="font-display text-[15px] font-semibold text-tinta">{title}</p>
                <p className="mt-0.5 text-sm leading-snug text-kabut">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function FinalCta() {
  return (
    <section aria-labelledby="cta-title" className="bg-embun px-4 pb-16 md:px-10 md:pb-24">
      <div className="on-dark relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-night grain shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%]">
          <Horizon mode="still" showStars={false} />
        </div>
        <div className="relative z-10 flex flex-col items-start px-6 pb-56 pt-14 md:items-center md:px-12 md:pb-72 md:pt-20 md:text-center">
          <h2 id="cta-title" className="font-display text-[clamp(2rem,5.5vw,3.5rem)] font-bold leading-[1.06] tracking-[-0.025em] text-white">
            Hari ini, mulai dari sini.
          </h2>
          <p className="mt-4 max-w-[40ch] text-[17px] leading-relaxed text-white/70">
            Bisa dicoba dulu tanpa daftar. Perjalananmu tersimpan begitu kamu membuat akun.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <StartButton>Mulai Perjalananku</StartButton>
            <Link
              href="/login"
              className="inline-flex h-13 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] px-7 font-display text-[15px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/[0.12]"
            >
              Masuk
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function LandingFooter() {
  return (
    <footer className="border-t border-garis bg-embun px-5 py-10 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-xl font-bold tracking-[-0.03em] text-laut-700">beautifio</p>
          <p className="mt-1 text-sm text-kabut">Menemani anak muda dari siapa dirinya hari ini ke siapa yang ia tuju.</p>
        </div>
        <nav aria-label="Tautan footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-tinta">
          <Link href="/login" className="hover:text-laut-500">Masuk</Link>
          <Link href="/register" className="hover:text-laut-500">Daftar</Link>
          <Link href="/daftar-mitra" className="hover:text-laut-500">Jadi Mitra</Link>
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs text-kabut">© {new Date().getFullYear()} Beautifio</p>
    </footer>
  )
}
