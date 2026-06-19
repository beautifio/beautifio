"use client"

import Link from "next/link"
import { Map } from "lucide-react"

interface JourneySnapshotProps {
  activity: {
    title: string
    completed: number
    total: number
    href: string
  } | null
}

export function JourneySnapshot({ activity }: JourneySnapshotProps) {
  if (!activity) {
    return (
      <Link href="/journey" className="block rounded-xl p-3 bg-surface border border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
            <Map className="w-4 h-4 text-pink-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-text-primary">Mulai journey hari ini</p>
            <p className="text-xs text-text-secondary">Belum ada aktivitas aktif</p>
          </div>
        </div>
      </Link>
    )
  }

  const pct = (activity.completed / activity.total) * 100

  return (
    <Link href={activity.href} className="block rounded-xl p-3 bg-surface border border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center flex-shrink-0">
          <Map className="w-4 h-4 text-pink-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-text-primary truncate">{activity.title}</p>
          <div className="h-1 bg-pink-100 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-pink-400 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <span className="text-xs text-text-secondary flex-shrink-0">
          {activity.completed}/{activity.total}
        </span>
      </div>
    </Link>
  )
}
