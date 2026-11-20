import { LandingMotion } from "@/components/landing/LandingMotion"
import { Hero } from "@/components/landing/Hero"
import { ChapterArah } from "@/components/landing/ChapterArah"
import { SunriseSeam } from "@/components/landing/SunriseSeam"
import { ChapterTumbuh } from "@/components/landing/ChapterTumbuh"
import { ChapterBersama } from "@/components/landing/ChapterBersama"
import { MoreFeatures, FinalCta, LandingFooter } from "@/components/landing/LandingClosing"

export default function LandingPage() {
  return (
    <main id="landing" className="relative overflow-x-clip bg-embun">
      <LandingMotion />
      <Hero />
      <ChapterArah />
      <SunriseSeam />
      <ChapterTumbuh />
      <ChapterBersama />
      <MoreFeatures />
      <FinalCta />
      <LandingFooter />
    </main>
  )
}
