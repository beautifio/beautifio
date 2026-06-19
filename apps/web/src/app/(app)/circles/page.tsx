"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Users, UserCheck, ChevronRight, Search } from "lucide-react"

export default function CirclesPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"circle" | "mentor">("circle")

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24">
        <h1 className="text-xl font-bold text-text-primary mb-4">Circles</h1>

        {/* Tab */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
          <button
            onClick={() => setTab("circle")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              tab === "circle"
                ? "bg-bg text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <Users size={16} />
            Circle
          </button>
          <button
            onClick={() => setTab("mentor")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer ${
              tab === "mentor"
                ? "bg-bg text-text-primary shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            <UserCheck size={16} />
            Mentor
          </button>
        </div>

        {tab === "circle" ? (
          <div className="space-y-3">
            <button
              onClick={() => router.push("/circle")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:bg-muted transition-colors cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users size={20} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">Jelajahi Circle</p>
                <p className="text-xs text-text-secondary">Temukan dan gabung circle sesuai minat</p>
              </div>
              <ChevronRight size={18} className="text-text-secondary shrink-0" />
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={() => router.push("/mentors")}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-surface border border-border hover:bg-muted transition-colors cursor-pointer text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                <UserCheck size={20} className="text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">Cari Mentor</p>
                <p className="text-xs text-text-secondary">Temukan mentor yang sesuai dengan mimpimu</p>
              </div>
              <ChevronRight size={18} className="text-text-secondary shrink-0" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
