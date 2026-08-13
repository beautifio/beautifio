"use client"

import { useState, useEffect } from "react"
import { Loader2, Check } from "lucide-react"

const PROVIDERS = [
  { id: "openai", name: "ChatGPT (OpenAI)", desc: "gpt-4o, gpt-4o-mini, o1", models: ["gpt-4o", "gpt-4o-mini", "o1", "o1-mini", "gpt-4-turbo"] },
  { id: "gemini", name: "Gemini (Google)", desc: "gemini-2.5-pro, gemini-2.0-flash", models: ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash", "gemini-2.0-flash-lite", "gemini-1.5-pro"] },
]

export default function AiSettingsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [provider, setProvider] = useState("openai")
  const [model, setModel] = useState("gpt-4o")

  useEffect(() => {
    fetch("/api/admin/settings/ai").then(r=>r.json()).then(d=>{if(!d.error){setProvider(d.ai_provider||"openai");setModel(d.ai_model||"gpt-4o")}}).finally(()=>setLoading(false))
  }, [])

  const handleProviderChange = (p: string) => { setProvider(p); setModel(PROVIDERS.find(pr=>pr.id===p)?.models[0]||"gpt-4o") }
  const currentModels = PROVIDERS.find(p=>p.id===provider)?.models||PROVIDERS[0].models

  const handleSave = async () => {
    setSaving(true); setError(""); setSuccess(false)
    try {
      const res = await fetch("/api/admin/settings/ai", {method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({ai_provider:provider,ai_model:model})})
      if (!res.ok) throw new Error((await res.json()).error||"Gagal")
      setSuccess(true); setTimeout(()=>setSuccess(false),2000)
    } catch (e: any) { setError(e.message) } finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">🤖 AI Settings</h1>
      <div className="grid grid-cols-2 gap-3">
        {PROVIDERS.map(p=>(
          <button key={p.id} onClick={()=>handleProviderChange(p.id)} className={`text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${provider===p.id?"border-primary bg-primary/5 shadow-sm":"border-gray-200 bg-white hover:border-primary/30"}`}>
            <div className="flex items-center justify-between mb-1"><span className="font-semibold text-sm text-gray-900">{p.name}</span>{provider===p.id&&<Check className="w-4 h-4 text-primary"/>}</div>
            <p className="text-xs text-gray-500">{p.desc}</p>
          </button>
        ))}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-500 mb-2">Model</p>
        <select value={model} onChange={e=>setModel(e.target.value)} className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 bg-white text-sm font-medium cursor-pointer focus:border-primary transition-colors">
          {currentModels.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2">
        <p className="text-sm font-semibold text-gray-900">Status API Key</p>
        <EnvRow label="OPENAI_API_KEY"/><EnvRow label="GEMINI_API_KEY"/>
      </div>
      <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
        {saving?<Loader2 className="w-4 h-4 animate-spin"/>:<Check className="w-4 h-4"/>}{saving?"Menyimpan...":"Simpan"}
      </button>
      {success && <p className="text-sm text-green-500 text-center">Tersimpan!</p>}
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  )
}

function EnvRow({ label }: { label: string }) {
  const [status, setStatus] = useState<"loading"|"set"|"missing">("loading")
  useEffect(() => {
    fetch("/api/admin/settings/ai").then(r=>r.json()).then(d=>setStatus(label==="OPENAI_API_KEY"?(d?.openai_available?"set":"missing"):(d?.gemini_available?"set":"missing"))).catch(()=>setStatus("missing"))
  }, [label])
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 font-mono text-xs">{label}</span>
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status==="loading"?"bg-gray-100 text-gray-500":status==="set"?"bg-green-100 text-green-600":"bg-red-100 text-red-700"}`}>{status==="loading"?"...":status==="set"?"Ready":"Missing"}</span>
    </div>
  )
}
