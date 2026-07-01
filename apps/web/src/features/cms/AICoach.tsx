"use client"

import { useState } from "react"
import { Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp, PenLine, RefreshCw, FileText, ListChecks, Lightbulb, Tag } from "lucide-react"
import { useCMS } from "./CMSContext"

const ACTIONS = [
  { icon: PenLine, label: "Improve", desc: "Perbaiki tone & engagement", action: "improve" },
  { icon: RefreshCw, label: "Rewrite", desc: "Tulis ulang dengan gaya berbeda", action: "rewrite" },
  { icon: FileText, label: "Expand", desc: "Kembangkan dengan detail", action: "expand" },
  { icon: Lightbulb, label: "Simplify", desc: "Sederhanakan agar mudah dipahami", action: "simplify" },
  { icon: Tag, label: "Keywords", desc: "Ekstrak kata kunci", action: "keywords" },
  { icon: ListChecks, label: "Suggest", desc: "Saran perbaikan konten", action: "suggest" },
]

export function AICoach() {
  const { title, content, keywords, aiCoachOpen } = useCMS()
  const [prompt, setPrompt] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(aiCoachOpen)  // open when toolbar button clicked
  const [activeAction, setActiveAction] = useState("")

  const executeAI = async (action: string, customPrompt?: string) => {
    setLoading(true)
    setActiveAction(action)
    try {
      const res = await fetch("/api/admin/konten/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, content, title, keywords, context: customPrompt }),
      })
      const { result: aiResult } = await res.json()
      setResult(aiResult)
      setExpanded(true)
    } catch {
      setResult("Gagal menghubungi AI. Coba lagi nanti.")
    } finally {
      setLoading(false)
    }
  }

  const executeCustom = () => {
    if (!prompt.trim()) return
    executeAI("improve", prompt)
  }

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "#FFFFFF", borderColor: "#E2E8F0" }}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
          <Sparkles size={14} style={{ color: "#FFC64F" }} />
          <span className="text-xs font-semibold" style={{ color: "#1E2938" }}>🤖 AI Content Coach</span>
        </div>
        {expanded ? <ChevronUp size={14} style={{ color: "#647488" }} /> : <ChevronDown size={14} style={{ color: "#647488" }} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {ACTIONS.map(({ icon: Icon, label, desc, action }) => (
              <button
                key={action}
                disabled={loading}
                onClick={() => executeAI(action)}
                className="flex items-start gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer disabled:opacity-50"
                style={{ background: activeAction === action ? "rgba(8,68,99,0.06)" : "transparent" }}
              >
                <Icon size={14} style={{ color: "#084463", marginTop: 1 }} />
                <div>
                  <p className="text-[11px] font-semibold" style={{ color: "#1E2938" }}>{label}</p>
                  <p className="text-[10px]" style={{ color: "#647488" }}>{desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Generate Meta Description */}
          <button
            disabled={loading}
            onClick={() => executeAI("meta")}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer disabled:opacity-50"
            style={{ background: "rgba(255,198,79,0.06)", border: "1px solid rgba(255,198,79,0.15)" }}
          >
            <Sparkles size={14} style={{ color: "#FFC64F" }} />
            <span className="text-[11px] font-semibold" style={{ color: "#1E2938" }}>Generate Meta Description</span>
          </button>

          {/* Generate FAQ */}
          <button
            disabled={loading}
            onClick={() => executeAI("faq")}
            className="w-full flex items-center gap-2 p-2 rounded-lg text-left transition-colors cursor-pointer disabled:opacity-50"
            style={{ background: "rgba(107,185,212,0.06)", border: "1px solid rgba(107,185,212,0.15)" }}
          >
            <Sparkles size={14} style={{ color: "#6BB9D4" }} />
            <span className="text-[11px] font-semibold" style={{ color: "#1E2938" }}>Generate FAQ Schema</span>
          </button>

          {/* Custom Prompt */}
          <div className="flex gap-1.5">
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && executeCustom()}
              placeholder="Atau ketik perintah khusus..."
              className="flex-1 px-3 py-1.5 rounded-lg border text-[11px] outline-none"
              style={{ borderColor: "#E2E8F0", color: "#1E2938" }}
            />
            <button
              onClick={executeCustom}
              disabled={loading || !prompt.trim()}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white cursor-pointer disabled:opacity-50"
              style={{ background: "#084463" }}
            >
              Kirim
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 py-3" style={{ color: "#647488" }}>
              <Loader2 size={14} className="animate-spin" />
              <span className="text-[11px]">AI sedang berpikir...</span>
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="p-3 rounded-lg relative" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <button
                onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                className="absolute top-2 right-2 p-1 rounded cursor-pointer transition-colors hover:bg-gray-100"
                style={{ color: copied ? "#22C55E" : "#647488" }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
              <p className="text-[11px] leading-relaxed whitespace-pre-wrap pr-6" style={{ color: "#1E2938" }}>{result}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
