"use client"

import { useState, useEffect } from "react"
import { Loader2, Sparkles, Check, Wrench } from "lucide-react"

const PROVIDERS = [
  {
    id: "openai",
    name: "ChatGPT (OpenAI)",
    desc: "gpt-4o, gpt-4o-mini, o1",
    models: ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "gpt-4-turbo"],
  },
  {
    id: "gemini",
    name: "Gemini (Google)",
    desc: "gemini-2.5-pro, gemini-2.0-flash",
    models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"],
  },
]

export default function AiSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [provider, setProvider] = useState("openai")
  const [model, setModel] = useState("gpt-4o")

  useEffect(() => {
    fetch("/api/admin/settings/ai")
      .then(r => r.json())
      .then(data => {
        if (!data.error) {
          setProvider(data.ai_provider || "openai")
          setModel(data.ai_model || "gpt-4o")
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleProviderChange = (p: string) => {
    setProvider(p)
    const defModel = PROVIDERS.find(pr => pr.id === p)?.models[0] || "gpt-4o"
    setModel(defModel)
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/settings/ai", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ai_provider: provider, ai_model: model }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan")
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-content mx-auto px-6 pb-24 flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )
  }

  const currentModels = PROVIDERS.find(p => p.id === provider)?.models || PROVIDERS[0].models

  return (
    <div className="max-w-content mx-auto px-6 pb-24">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-saffron" />
        <h1 className="text-lg font-bold text-text-primary">AI Settings</h1>
      </div>

      {/* Provider Toggle Cards */}
      <p className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-1.5">
        <Wrench className="w-4 h-4" /> Provider
      </p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {PROVIDERS.map(p => (
          <button
            key={p.id}
            onClick={() => handleProviderChange(p.id)}
            className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
              provider === p.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-surface hover:border-primary/30"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-text-primary">{p.name}</span>
              {provider === p.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
            </div>
            <p className="text-xs text-text-secondary">{p.desc}</p>
          </button>
        ))}
      </div>

      {/* Model Dropdown */}
      <p className="text-sm font-semibold text-text-secondary mb-3 flex items-center gap-1.5">
        <Sparkles className="w-4 h-4" /> Model
      </p>
      <div className="relative mb-6">
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border-2 border-border bg-surface text-text-primary text-sm font-medium cursor-pointer appearance-none pr-10 focus:outline-none focus:border-primary transition-colors"
        >
          {currentModels.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <Chevron className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary" />
      </div>

      {/* Env Status */}
      <div className="bg-surface border border-border rounded-2xl p-4 mb-6 space-y-2">
        <p className="text-sm font-semibold text-text-primary mb-2">Status API Key</p>
        <EnvStatusRow label="OPENAI_API_KEY" />
        <EnvStatusRow label="GEMINI_API_KEY" />
      </div>

      {/* Save */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
        {success && <p className="text-sm text-success text-center">Tersimpan!</p>}
        {error && <p className="text-sm text-danger text-center">{error}</p>}
      </div>
    </div>
  )
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EnvStatusRow({ label }: { label: string }) {
  const [status, setStatus] = useState<"loading" | "set" | "missing">("loading")
  
  useEffect(() => {
    fetch("/api/admin/settings/ai")
      .then(r => r.json())
      .then(data => {
        if (label === "OPENAI_API_KEY") {
          setStatus(data?.openai_available ? "set" : "missing")
        } else {
          setStatus(data?.gemini_available ? "set" : "missing")
        }
      })
      .catch(() => setStatus("missing"))
  }, [label])

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary font-mono text-xs">{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        status === "loading" ? "bg-muted text-text-secondary" :
        status === "set" ? "bg-success/15 text-success" :
        "bg-danger/15 text-danger"
      }`}>
        {status === "loading" ? "..." : status === "set" ? "Ready" : "Missing"}
      </span>
    </div>
  )
}
