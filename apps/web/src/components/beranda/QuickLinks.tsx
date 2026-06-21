"use client"

import Link from "next/link"
import { Newspaper, Briefcase, Gift, Heart } from "lucide-react"

const QUICK_LINKS = [
  { href: "/inspirasi", label: "Inspirasi", icon: Newspaper },
  { href: "/connect",   label: "Connect",   icon: Heart },
  { href: "/opportunity", label: "Peluang", icon: Briefcase },
  { href: "/voucher",   label: "Familia",   icon: Gift },
]

export function QuickLinks() {
  return (
    <div>
      <p className="text-xs font-medium text-text-secondary mb-2">Jelajahi</p>
      <div className="grid grid-cols-2 gap-2">
        {QUICK_LINKS.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg p-2.5 bg-surface border border-border text-xs text-text-primary hover:bg-muted transition-colors"
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0 text-text-secondary" />
              {item.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
