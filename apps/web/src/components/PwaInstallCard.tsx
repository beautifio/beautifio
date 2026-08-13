"use client"

import { useState, useEffect } from "react"
import { Download, Share2, X } from "lucide-react"

export function PwaInstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showCard, setShowCard] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return
    if (sessionStorage.getItem("pwa_dismissed")) return

    const isIOSDevice = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
    setIsIOS(isIOSDevice)

    // Always show immediately
    setShowCard(true)

    // Listen for install prompt on Android/Desktop
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener("beforeinstallprompt", handler)
    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      if (result.outcome === "accepted") setShowCard(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShowCard(false)
    sessionStorage.setItem("pwa_dismissed", "1")
  }

  if (!showCard) return null

  return (
    <div className="relative p-4 rounded-2xl mb-5 border border-white/10 overflow-hidden" style={{ background: "linear-gradient(135deg, #084463 0%, #0E7490 100%)", color: "#FFFFFF" }}>
      <button onClick={handleDismiss} className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer bg-white/10 hover:bg-white/20 transition-colors">
        <X size={12} />
      </button>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
          <Download size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold mb-1 font-display">Install Beautifio</p>
          {isIOS ? (
            <p className="text-xs text-white/70 leading-relaxed mb-3 pr-6">
              Tap <Share2 size={12} className="inline" /> lalu <strong>Add to Home Screen</strong> biar akses lebih cepat.
            </p>
          ) : (
            <p className="text-xs text-white/70 leading-relaxed mb-3 pr-6">
              Pasang di homescreen biar lebih cepat diakses. Gak perlu buka browser lagi.
            </p>
          )}
          {deferredPrompt && (
            <button onClick={handleInstall} className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors" style={{ background: "#FFC64F", color: "#084463" }}>
              Pasang Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

