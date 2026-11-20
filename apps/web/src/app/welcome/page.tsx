import Link from "next/link";
import { ChevronRight, Compass, Search } from "lucide-react";
import { Horizon } from "@/components/landing/Horizon";
import { BrandLogo } from "@/components/landing/BrandLogo";

const CHOICES = [
  {
    href: "/discover",
    icon: Compass,
    title: "Saya sudah punya tujuan",
    text: "Saya sudah tahu apa yang ingin saya capai.",
    action: "Lanjut ke Discovery",
  },
  {
    href: "/onboarding",
    icon: Search,
    title: "Saya masih bingung",
    text: "Saya ingin menemukan minat dan tujuan yang cocok.",
    action: "Temukan arah saya",
  },
];

export default function WelcomeScreen() {
  return (
    <div className="on-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night grain text-white">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%]">
        <Horizon mode="still" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-[max(28px,env(safe-area-inset-top))]">
        <div className="flex justify-center">
          <BrandLogo className="h-10 max-w-[220px]" />
        </div>

        <div className="mt-10">
          <h1 className="font-display text-[34px] font-bold leading-[1.1] tracking-[-0.025em]">Selamat datang</h1>
          <p className="mt-3 max-w-[34ch] text-[15px] leading-relaxed text-white/70">
            Temukan arah hidup, lingkungan yang tepat, dan peluang terbaik untuk masa depanmu.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {CHOICES.map(({ href, icon: Icon, title, text, action }) => (
            <Link
              key={href}
              href={href}
              className="surface-glass-dark group flex items-start gap-4 rounded-xl p-5 transition-[transform,border-color] duration-200 ease-out-expo hover:border-white/20 active:scale-[0.99]"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/10 text-fajar ring-1 ring-inset ring-white/10">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-[17px] font-semibold">{title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-white/65">{text}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-fajar-glow">
                  {action}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2.5 pt-10">
          <Link
            href="/login"
            className="inline-flex h-13 items-center justify-center rounded-lg bg-fajar font-display text-[15px] font-semibold text-laut-950 shadow-glow-fajar transition-transform active:scale-[0.98]"
          >
            Masuk
          </Link>
          <Link
            href="/register"
            className="inline-flex h-13 items-center justify-center rounded-lg border border-white/15 bg-white/[0.06] font-display text-[15px] font-semibold text-white backdrop-blur transition-colors hover:bg-white/[0.12]"
          >
            Daftar
          </Link>
          <Link href="/home" className="py-2 text-center text-sm font-medium text-white/60 hover:text-white">
            Lewati dulu
          </Link>
        </div>
      </div>
    </div>
  );
}
