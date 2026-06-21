"use client"

import Link from "next/link"
import { MessageCircle, Sparkles, ArrowRight, ShoppingBag } from "lucide-react"

const OPTIONS = [
  {
    href: "/bisik",
    icon: MessageCircle,
    label: "Bisik",
    desc: "Curhat anonim, didengar tanpa dihakimi",
    color: "#D4537E",
    bg: "#FBEAF0",
  },
  {
    href: "/tebak",
    icon: Sparkles,
    label: "Tebak Aku",
    desc: "Main tebak kepribadian lawan",
    color: "#7F77DD",
    bg: "#EEEDFE",
  },
  {
    href: "/belanja",
    icon: ShoppingBag,
    label: "Belanja",
    desc: "Deals & diskon spesial",
    color: "#2563EB",
    bg: "#EFF6FF",
  },
]

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-8 pb-24">
        <h1 className="text-xl font-bold text-text-primary mb-1">Mau apa hari ini?</h1>
        <p className="text-sm text-text-secondary mb-6">Pilih yang paling cocok dengan perasaanmu</p>

        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <Link
                key={opt.href}
                href={opt.href}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border hover:border-primary/20 transition-all"
                style={{ background: opt.bg }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${opt.color}20` }}
                >
                  <Icon size={24} style={{ color: opt.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-text-primary">{opt.label}</p>
                  <p className="text-sm text-text-secondary">{opt.desc}</p>
                </div>
                <ArrowRight size={18} className="text-text-secondary shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
