"use client"

import { useEffect, useState, useRef } from "react"
import { getActiveBanner, recordAdImpression, recordAdClick } from "@/lib/tebak/ads"

type Props = {
  location: 'match_intro' | 'panduan' | 'jeda'
  sessionId: string
}

export function AdBanner({ location, sessionId }: Props) {
  const [banner, setBanner] = useState<{ id: string; image_url: string; click_url: string | null } | null>(null)
  const impressionRecorded = useRef(false)

  useEffect(() => {
    getActiveBanner(location).then(b => {
      if (b) setBanner(b)
    })
  }, [location])

  useEffect(() => {
    if (banner && !impressionRecorded.current) {
      impressionRecorded.current = true
      recordAdImpression(banner.id, sessionId)
    }
  }, [banner, sessionId])

  if (!banner) return null

  const handleClick = () => {
    recordAdClick(banner.id, sessionId)
    if (banner.click_url) window.open(banner.click_url, '_blank')
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <img
        src={banner.image_url}
        alt=""
        className="w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleClick}
      />
    </div>
  )
}
