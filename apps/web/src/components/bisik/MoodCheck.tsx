"use client"

import { useState } from "react"
import { Headphones, Mic2, RefreshCw } from "lucide-react"

type Mood = 'didengar' | 'mendengarkan' | 'keduanya'

const MOODS: { id: Mood; label: string; desc: string; icon: typeof Headphones }[] = [
  { id: 'didengar', label: 'Didengar', desc: 'Aku ingin curhat', icon: Headphones },
  { id: 'mendengarkan', label: 'Mendengarkan', desc: 'Aku ingin mendengar', icon: Mic2 },
  { id: 'keduanya', label: 'Keduanya', desc: 'Saling bercerita', icon: RefreshCw },
]

type Props = {
  onSelect: (mood: Mood) => void
}

export function MoodCheck({ onSelect }: Props) {
  const [selected, setSelected] = useState<Mood | null>(null)

  return (
    <div className="space-y-3">
      <p className="text-sm text-text-secondary text-center">Saat ini kamu ingin?</p>
      <div className="flex gap-2.5">
        {MOODS.map((m) => {
          const Icon = m.icon
          const isActive = selected === m.id
          return (
            <button
              key={m.id}
              onClick={() => { setSelected(m.id); onSelect(m.id) }}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all cursor-pointer ${
                isActive
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-surface hover:border-primary/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isActive ? 'bg-primary text-white' : 'bg-muted text-text-secondary'
              }`}>
                <Icon size={20} />
              </div>
              <span className="text-sm font-semibold text-text-primary">{m.label}</span>
              <span className="text-[11px] text-text-secondary">{m.desc}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
