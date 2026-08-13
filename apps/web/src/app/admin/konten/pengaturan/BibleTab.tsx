"use client"

import { useState, useEffect } from "react"
import { Save, Lock, Eye, EyeOff, RotateCcw, Loader2 } from "lucide-react"

const DEFAULTS: Record<string, string> = {
  standard: `# STANDAR KONTEN BEAUTIFIO\n\n## Nada\nSantai, insightful, seperti kakak ngobrol ke adik. Pakai "kamu", bukan "Anda". Gak menggurui.\n\n## Struktur\n- Hook: 1-2 kalimat pembuka yang bikin penasaran\n- Body: 3-5 section dengan H2 subheading\n- Closing: 1 kalimat call-to-action positif\n\n## Format\n- Gunakan bullet points dan numbered list untuk poin penting\n- Maksimal 1200 kata`,
  cerpen: `# GAYA CERPEN BEAUTIFIO\n\n## Format\n- Naratif dengan sudut pandang orang pertama ("aku")\n- Alur: pembuka → konflik → klimaks → resolusi\n- 800-1200 kata\n\n## Nada\n- Puitis tapi gak lebay\n- Emosional, menyentuh, personal\n\n## Setting\n- Tokoh harus relatable (anak muda Indonesia)\n- Setting di Indonesia (kampus, kos, rumah, kafe)`,
}

const STYLES = [{ key: "standard", label: "Standar" }, { key: "cerpen", label: "Cerpen" }]

export default function BibleTab() {
  const [bibles, setBibles] = useState<Record<string, string>>({})
  const [storePin, setStorePin] = useState("")
  const [activeStyle, setActiveStyle] = useState("standard")
  const [editMode, setEditMode] = useState(false)
  const [showPinPopup, setShowPinPopup] = useState(false)
  const [pinInput, setPinInput] = useState("")
  const [pinError, setPinError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPinManager, setShowPinManager] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [role, setRole] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings/bible").then(r=>r.json()).then(d=>{setBibles({standard:d.standard||DEFAULTS.standard,cerpen:d.cerpen||DEFAULTS.cerpen});setStorePin(d.pin||"123456");setLoading(false)})
    fetch("/api/auth/me").then(r=>r.json()).then(d=>setRole(d?.data?.role||""))
  }, [])

  const bible = bibles[activeStyle] || ""
  const setBible = (v: string) => setBibles(prev=>({...prev,[activeStyle]:v}))
  const verifyPin = () => { if(pinInput===storePin){setShowPinPopup(false);setPinError("");setPinInput("");setEditMode(true)}else{setPinError("PIN salah");setPinInput("")} }
  const saveBible = async () => { setSaving(true); const res=await fetch("/api/admin/settings/bible",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({bible,style:activeStyle,current_pin:storePin})}); if(res.ok){setSaved(true);setEditMode(false);setTimeout(()=>setSaved(false),2000)}else{alert((await res.json()).error||"Gagal")}; setSaving(false) }
  const updatePin = async () => { if(!newPin||newPin.length<4)return; const res=await fetch("/api/admin/settings/bible",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({pin:newPin})}); if(res.ok){setStorePin(newPin);setNewPin("")} else alert("Gagal") }
  const resetBible = () => setBible(DEFAULTS[activeStyle]||"")

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-bold text-gray-900">Panduan Konten</h1><p className="text-xs text-gray-500 mt-0.5">Dipake AI buat generate artikel.</p></div>
        {saved && <span className="text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">Tersimpan</span>}
      </div>
      <div className="flex gap-1 p-1 rounded-xl bg-gray-50 border">
        {STYLES.map(s=>(<button key={s.key} onClick={()=>{setActiveStyle(s.key);setEditMode(false)}} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activeStyle===s.key?"bg-white shadow-sm text-gray-900":"text-gray-400 hover:text-gray-600"}`}>{s.label}</button>))}
      </div>
      {editMode ? (
        <div className="space-y-2">
          <textarea value={bible} onChange={e=>setBible(e.target.value)} className="w-full min-h-[400px] p-4 rounded-xl border border-gray-200 text-sm font-mono outline-none resize-y" autoFocus/>
          <div className="text-xs text-gray-400">{bible.length.toLocaleString("id-ID")} karakter</div>
          <div className="flex gap-2">
            <button onClick={()=>setEditMode(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm cursor-pointer text-gray-500 hover:bg-gray-50">Batal</button>
            <button onClick={saveBible} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2" style={{background:"#084463"}}>{saving?<Loader2 size={14} className="animate-spin"/>:<Save size={14}/>}Simpan</button>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-xl border bg-white border-gray-200">
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed text-gray-900">{bible||"Belum ada panduan."}</pre>
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
            <button onClick={resetBible} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm cursor-pointer text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2"><RotateCcw size={14}/>Reset Default</button>
            <button onClick={()=>{setShowPinPopup(true);setPinInput("");setPinError("")}} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer flex items-center justify-center gap-2" style={{background:"#084463"}}><Lock size={14}/>Edit Panduan</button>
          </div>
        </div>
      )}
      {showPinPopup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={()=>setShowPinPopup(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="text-center mb-4"><div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 bg-blue-50"><Lock size={24} color="#084463"/></div><h3 className="text-sm font-bold text-gray-900">Masukkan PIN</h3></div>
            <input type="text" value={pinInput} onChange={e=>{setPinInput(e.target.value.replace(/\D/g,""));setPinError("")}} onKeyDown={e=>e.key==="Enter"&&verifyPin()} maxLength={6} placeholder="••••••" className="w-full text-center text-2xl tracking-widest py-3 rounded-lg border outline-none mb-2" style={{borderColor:pinError?"#EF4444":"#E2E8F0"}} autoFocus/>
            {pinError&&<p className="text-xs text-center text-red-500 mb-2">{pinError}</p>}
            <div className="flex gap-2">
              <button onClick={()=>setShowPinPopup(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 cursor-pointer hover:bg-gray-50">Batal</button>
              <button onClick={verifyPin} disabled={pinInput.length<4} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-50" style={{background:"#084463"}}>Buka</button>
            </div>
            {role==="superadmin"&&(
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button onClick={()=>setShowPinManager(!showPinManager)} className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer mx-auto">{showPinManager?<EyeOff size={12}/>:<Eye size={12}/>}Ganti PIN</button>
                {showPinManager&&(<div className="mt-2 flex gap-2"><input value={newPin} onChange={e=>setNewPin(e.target.value.replace(/\D/g,""))} maxLength={6} placeholder="PIN baru" className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none border-gray-200"/><button onClick={updatePin} disabled={newPin.length<4} className="px-3 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer disabled:opacity-50 bg-blue-900">Ganti</button></div>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
