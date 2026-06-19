import Link from "next/link"
import { Search, ArrowLeft } from "lucide-react"

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-content mx-auto px-5 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/home" className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:bg-muted transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-lg font-bold text-text-primary">Cari</h1>
        </div>
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            placeholder="Cari artikel, circle, mentor..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary placeholder:text-text-secondary/50 outline-none focus:border-primary transition-colors"
          />
        </div>
        <p className="text-center text-sm text-text-secondary py-12">
          Mulai ketik untuk mencari
        </p>
      </div>
    </div>
  )
}
