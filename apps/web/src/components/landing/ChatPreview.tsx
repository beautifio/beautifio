"use client"

import { Lock } from "lucide-react"
import { useInView } from "./useInView"
import styles from "./landing.module.css"

const MESSAGES = [
  { me: true, text: "Lagi bingung pilih jurusan. Takut salah." },
  { me: false, text: "Sama, aku dulu juga gitu. Kamu paling suka ngapain?" },
  { me: true, text: "Gambar sih. Tapi katanya susah cari kerja." },
  { me: false, text: "Coba Tes Arah Hidup dulu. Aku jadi lebih yakin setelah itu." },
]

/** A phone showing a sample Bisik conversation; bubbles arrive once it scrolls into view. */
export function ChatPreview() {
  const { ref, seen } = useInView<HTMLDivElement>()
  return (
    <figure className="mx-auto w-full max-w-[320px]">
      <div className="rounded-[40px] bg-laut-950 p-2.5 shadow-2xl ring-1 ring-laut-950/10">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-b from-laut-50 to-embun">
          <div className="flex items-center gap-3 border-b border-garis bg-white/80 px-4 pb-3 pt-5 backdrop-blur">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-langit to-laut-500 font-display text-sm font-semibold text-white">
              ?
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-tinta">Teman Bisik</p>
              <p className="flex items-center gap-1 text-[11px] text-kabut">
                <Lock className="h-3 w-3" aria-hidden /> Identitas kalian tetap tersembunyi
              </p>
            </div>
          </div>
          <div ref={ref} className={`${styles.chat} ${seen ? styles.chatOn : ""} flex min-h-[300px] flex-col gap-2.5 px-3.5 py-5`}>
            {MESSAGES.map((m, i) => (
              <p
                key={i}
                className={`${styles.bubble} max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-snug shadow-xs ${
                  m.me
                    ? "self-end rounded-br-md bg-laut-700 text-white"
                    : "self-start rounded-bl-md bg-white text-tinta ring-1 ring-garis"
                }`}
              >
                {m.text}
              </p>
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-xs text-kabut">Contoh percakapan di Bisik</figcaption>
    </figure>
  )
}
