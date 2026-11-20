import { ChapterLabel } from "./ChapterLabel"
import { JourneyPath } from "./JourneyPath"

export function ChapterTumbuh() {
  return (
    <section aria-labelledby="tumbuh-title" className="relative bg-embun px-5 pb-24 pt-10 md:px-10 md:pb-32 md:pt-16">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
        <div className="md:order-2">
          <ChapterLabel tone="light">Tumbuh tiap hari</ChapterLabel>
          <h2 id="tumbuh-title" className="mt-4 font-display text-[clamp(2rem,5vw,3.25rem)] font-bold leading-[1.08] tracking-[-0.025em] text-tinta">
            Mimpi besar, langkah yang bisa dijalani hari ini.
          </h2>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-kabut">
            Journey memecah Mimpi jadi Big Win, Big Win jadi Small Win, lalu Small Win jadi enam aktivitas harian.
            Kamu cukup fokus pada langkah berikutnya.
          </p>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-kabut">
            Setiap langkah bisa kamu catat di Cerita, timeline pribadi untuk melihat sejauh apa kamu sudah berjalan.
          </p>
        </div>
        <div className="md:order-1">
          <JourneyPath />
        </div>
      </div>
    </section>
  )
}
