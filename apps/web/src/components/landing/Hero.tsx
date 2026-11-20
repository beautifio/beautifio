import Link from "next/link"
import { Horizon } from "./Horizon"
import { BrandLogo } from "./BrandLogo"
import { HeroPhotoBackdrop, HeroPhotoFrame } from "./HeroPhoto"
import { StartButton, StartLink } from "./StartButton"
import styles from "./landing.module.css"

export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night grain"
      style={{ minHeight: "max(100svh, 660px)" }}
    >
      <HeroPhotoBackdrop />

      {/* Landscape: night sky → dawn → three ridges → path of lights */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] md:h-[55%]">
        <Horizon mode="hero" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-center px-5 pt-[max(24px,env(safe-area-inset-top))] md:justify-between md:px-10 md:pt-8">
        <BrandLogo className="h-12 max-w-[260px] md:h-14 md:max-w-[320px]" />
        <Link
          href="/login"
          className="hidden h-10 items-center rounded-md px-4 text-sm font-semibold text-white/85 transition-colors hover:bg-white/10 hover:text-white md:inline-flex"
        >
          Masuk
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-start gap-10 px-5 pt-10 md:grid-cols-[1.3fr_0.7fr] md:px-10 md:pt-[clamp(2.5rem,7vh,5rem)]">
        <div className="max-w-2xl">
          <h1
            id="hero-title"
            className={`${styles.enter1} text-display text-[clamp(2.5rem,11vw,4.6rem)] text-white [text-shadow:0_2px_30px_rgba(3,24,42,0.5)]`}
          >
            <span className="block whitespace-nowrap">Masa Depan</span>
            <span className="block whitespace-nowrap">Dimulai Hari Ini</span>
          </h1>
          <p className={`${styles.enter2} mt-5 max-w-[30ch] text-[17px] leading-relaxed text-white/75 md:mt-6 md:text-xl`}>
            Temukan arah, tumbuh tiap hari, dan nggak sendirian menjalaninya.
          </p>
          <div className={`${styles.enter3} mt-10 hidden items-center gap-6 md:flex`}>
            <StartButton>Mulai Perjalananku</StartButton>
            <StartLink className="text-white/70 hover:text-white">Lihat dulu tanpa daftar</StartLink>
          </div>
        </div>
        <HeroPhotoFrame className="hidden md:block md:pt-2" />
      </div>

      {/* Mobile: actions float on glass over the ridges */}
      <div className={`${styles.enter4} relative z-10 px-4 pb-[max(20px,env(safe-area-inset-bottom))] md:hidden`}>
        <div className="surface-glass-dark mx-auto flex max-w-md flex-col gap-2.5 rounded-2xl p-3.5">
          <StartButton fullWidth>Mulai Perjalananku</StartButton>
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] font-display text-[15px] font-semibold text-white transition-colors active:bg-white/15"
          >
            Masuk
          </Link>
          <StartLink className="py-1.5 text-white/65">Lihat dulu tanpa daftar</StartLink>
        </div>
      </div>
    </section>
  )
}
