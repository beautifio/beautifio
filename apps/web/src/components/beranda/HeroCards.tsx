"use client"

import Link from "next/link"
import { MessageCircle, Sparkles, ArrowRight } from "lucide-react"

export function HeroCards() {
  return (
    <div className="flex flex-col gap-3">
      <BisikHeroCard />
      <TebakHeroCard />
    </div>
  )
}

function BisikHeroCard() {
  return (
    <Link href="/bisik" className="block">
      <div
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{ background: "#FBEAF0" }}
      >
        <div
          className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-40"
          style={{ background: "#F4C0D1" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4" style={{ color: "#993556" }} />
            <span className="text-xs font-medium" style={{ color: "#72243E" }}>Bisik</span>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full"
              style={{ background: "#F4C0D1", color: "#72243E" }}
            >
              Anonim
            </span>
          </div>

          <h2 className="text-sm font-medium mb-1" style={{ color: "#4B1528" }}>
            Ada yang mau didengar?
          </h2>
          <p className="text-xs mb-3" style={{ color: "#72243E" }}>
            Curhat ke orang asing yang peduli, tanpa takut dihakimi.
          </p>

          <div
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-white"
            style={{ background: "#D4537E" }}
          >
            <MessageCircle className="w-3 h-3" />
            Mulai ngobrol
          </div>
        </div>
      </div>
    </Link>
  )
}

function TebakHeroCard() {
  return (
    <Link href="/tebak" className="block">
      <div className="rounded-2xl p-4" style={{ background: "#EEEDFE" }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: "#534AB7" }} />
            <span className="text-xs font-medium" style={{ color: "#3C3489" }}>Tebak Aku</span>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "#CECBF6", color: "#3C3489" }}
          >
            Live
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-medium" style={{ color: "#26215C" }}>
            Seberapa bisa kamu baca orang?
          </p>
          <div
            className="inline-flex items-center gap-1 text-xs text-white px-3 py-1.5 rounded-full flex-shrink-0 ml-3"
            style={{ background: "#7F77DD" }}
          >
            Main <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}
