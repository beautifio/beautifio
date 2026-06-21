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
        className="rounded-2xl p-4 relative overflow-hidden bg-muted"
      >
        <div
          className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-20"
          style={{ background: "#6BB9D4" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Bisik</span>
            <span
              className="ml-auto text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
            >
              Anonim
            </span>
          </div>

          <h2 className="text-sm font-medium mb-1 text-text-primary">
            Ada yang mau didengar?
          </h2>
          <p className="text-xs mb-3 text-text-secondary">
            Curhat ke orang asing yang peduli, tanpa takut dihakimi.
          </p>

          <div
            className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-white"
            style={{ background: "#084463" }}
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
      <div className="rounded-2xl p-4" style={{ background: "#F0F9FF" }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">Tebak Aku</span>
          </div>
          <span
            className="text-xs px-2 py-0.5 rounded-full bg-secondary/10 text-secondary"
          >
            Live
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs font-medium text-text-primary">
            Seberapa bisa kamu baca orang?
          </p>
          <div
            className="inline-flex items-center gap-1 text-xs text-white px-3 py-1.5 rounded-full flex-shrink-0 ml-3"
            style={{ background: "#6BB9D4" }}
          >
            Main <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </Link>
  )
}
