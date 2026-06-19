"use client"

import { useState } from "react"
import { MessageSquare, Briefcase, Users, Heart, BookOpen, Brain, UserCheck, Wallet } from "lucide-react"

const CATEGORIES = [
  { id: 'karir', label: 'Karir', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
  { id: 'keluarga', label: 'Keluarga', icon: Users, color: 'bg-green-100 text-green-700' },
  { id: 'percintaan', label: 'Percintaan', icon: Heart, color: 'bg-red-100 text-red-700' },
  { id: 'pendidikan', label: 'Pendidikan', icon: BookOpen, color: 'bg-purple-100 text-purple-700' },
  { id: 'kesehatan_mental', label: 'Kesehatan Mental', icon: Brain, color: 'bg-amber-100 text-amber-700' },
  { id: 'pertemanan', label: 'Pertemanan', icon: UserCheck, color: 'bg-teal-100 text-teal-700' },
  { id: 'keuangan', label: 'Keuangan', icon: Wallet, color: 'bg-emerald-100 text-emerald-700' },
] as const

type Props = {
  onSelect: (category: string) => void
}

export function CategoryPicker({ onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary text-center">Pilih topik yang ingin kamu bicarakan</p>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          const isActive = selected === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => { setSelected(cat.id); onSelect(cat.id) }}
              className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface hover:border-primary/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cat.color}`}>
                <Icon size={18} />
              </div>
              <span className="text-sm font-medium text-text-primary">{cat.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
