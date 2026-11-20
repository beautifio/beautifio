"use client"

import { useState } from "react"
import { Compass, Check } from "lucide-react"
import { ChapterLabel } from "./ChapterLabel"
import { StartButton } from "./StartButton"

const OPTIONS = [
  { id: "R", text: "Membongkar dan merakit sesuatu", type: "Pembangun", code: "Realistic" },
  { id: "I", text: "Mencari tahu kenapa sesuatu bisa terjadi", type: "Penyelidik", code: "Investigative" },
  { id: "A", text: "Menggambar, menulis, atau bikin konten", type: "Pencipta", code: "Artistic" },
  { id: "S", text: "Mendengarkan dan membantu teman", type: "Penolong", code: "Social" },
] as const

export function ChapterArah() {
  const [picked, setPicked] = useState<(typeof OPTIONS)[number] | null>(null)

  return (
    <section
      aria-labelledby="arah-title"
      className="on-dark relative bg-gradient-to-b from-laut-950 to-laut-900 px-5 pb-24 pt-20 text-white md:px-10 md:pb-32 md:pt-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
        <div>
          <ChapterLabel>Temukan arah</ChapterLabel>
          <h2 id="arah-title" className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.025em]">
            Belum tahu mau ke mana? Itu wajar.
          </h2>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-white/70">
            Tes Arah Hidup membantumu mengenali kepribadian, minat karier, dan nilai hidupmu. Tiga tes singkat,
            sekitar tiga menit per tes, gratis.
          </p>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-white/70">
            Dari hasilnya, kamu memilih satu Mimpi untuk dituju. Satu arah dulu, sisanya menyusul.
          </p>
        </div>

        {/* Try one question, right here */}
        <div className="surface-glass-dark relative rounded-2xl p-5 md:p-7">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-fajar ring-1 ring-inset ring-white/10">
              <Compass className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">Coba satu pertanyaan</p>
              <p className="text-xs text-white/55">Dari tes minat karier</p>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="font-display text-lg font-semibold leading-snug md:text-xl">
              Kegiatan mana yang paling bikin kamu lupa waktu?
            </legend>
            <div className="mt-4 grid gap-2">
              {OPTIONS.map((o) => {
                const on = picked?.id === o.id
                return (
                  <button
                    key={o.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked(o)}
                    className={`group flex min-h-12 items-center gap-3 rounded-lg border px-4 py-3 text-left text-[15px] transition-[background-color,border-color,transform] duration-200 active:scale-[0.99] cursor-pointer ${
                      on
                        ? "border-fajar/70 bg-fajar/[0.14] text-white"
                        : "border-white/10 bg-white/[0.04] text-white/80 hover:border-white/25 hover:bg-white/[0.08]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        on ? "border-fajar bg-fajar text-laut-950" : "border-white/30"
                      }`}
                    >
                      {on && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    {o.text}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <div aria-live="polite" className="mt-5 min-h-[7.5rem]">
            {picked ? (
              <div key={picked.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500 rounded-lg bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10">
                <p className="text-[15px] leading-relaxed text-white/85">
                  Kamu mungkin condong ke tipe <strong className="font-semibold text-fajar-glow">{picked.type}</strong>{" "}
                  ({picked.code}). Satu jawaban belum cukup. Tes lengkapnya 20 soal untuk memastikannya.
                </p>
                <StartButton size="md" next="/tes-arah-hidup/interest" className="mt-4">
                  Lanjutkan tesnya
                </StartButton>
              </div>
            ) : (
              <p className="pt-2 text-sm text-white/45">Pilih satu. Tidak ada jawaban yang salah.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
