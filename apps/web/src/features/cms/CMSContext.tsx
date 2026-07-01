"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface CMSState {
  title: string
  subtitle: string
  slug: string
  content: string
  wordCount: number
  charCount: number
  headings: { level: number; text: string }[]
  keywords: string[]
  setTitle: (t: string) => void
  setSubtitle: (s: string) => void
  setContent: (c: string) => void
  setHeadings: (h: { level: number; text: string }[]) => void
  setKeywords: (k: string[]) => void
  setWordCount: (n: number) => void
  setCharCount: (n: number) => void
}

const CMSContext = createContext<CMSState | null>(null)

export function CMSProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Mengenal Diri Sendiri: Perjalanan Menuju Kesadaran Diri yang Lebih Dalam")
  const [subtitle, setSubtitle] = useState("Bagaimana memahami kepribadian, nilai hidup, dan potensi diri melalui refleksi harian")
  const [slug, setSlug] = useState("mengenal-diri-sendiri-kesadaran-diri")
  const [content, setContent] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [headings, setHeadings] = useState<{ level: number; text: string }[]>([])
  const [keywords, setKeywords] = useState(["kesadaran diri", "refleksi harian", "pengembangan diri", "psikologi"])

  // Auto-derive slug from title
  const handleSetTitle = useCallback((t: string) => {
    setTitle(t)
    setSlug(t.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 80))
  }, [])

  return (
    <CMSContext.Provider value={{
      title, subtitle, slug, content, wordCount, charCount, headings, keywords,
      setTitle: handleSetTitle, setSubtitle, setContent, setHeadings, setKeywords, setWordCount, setCharCount,
    }}>
      {children}
    </CMSContext.Provider>
  )
}

export function useCMS() {
  const ctx = useContext(CMSContext)
  if (!ctx) throw new Error("useCMS must be inside CMSProvider")
  return ctx
}
