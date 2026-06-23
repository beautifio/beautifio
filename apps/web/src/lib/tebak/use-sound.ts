"use client"

import { useCallback, useRef, useEffect } from "react"

type SoundName = 'tap' | 'submit' | 'correct' | 'wrong' | 'timeout' | 'tick' | 'winner' | 'lose'

const SOUND_FREQ: Record<SoundName, { freq: number; duration: number; type: OscillatorType }> = {
  tap:      { freq: 660,  duration: 0.06, type: 'sine' },
  submit:   { freq: 520,  duration: 0.15, type: 'sine' },
  correct:  { freq: 880,  duration: 0.18, type: 'sine' },
  wrong:    { freq: 220,  duration: 0.3,  type: 'sawtooth' },
  timeout:  { freq: 150,  duration: 0.4,  type: 'square' },
  tick:     { freq: 660,  duration: 0.05, type: 'sine' },
  winner:   { freq: 1047, duration: 0.8,  type: 'sine' },
  lose:     { freq: 262,  duration: 0.6,  type: 'sine' },
}

// Winner = ascending arpeggio
const WINNER_NOTES = [523, 659, 784, 1047]
const LOSE_NOTES   = [392, 349, 330, 262]

function playBeep(freq: number, duration: number, type: OscillatorType) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available
  }
}

function playSequence(notes: number[], duration: number, type: OscillatorType) {
  notes.forEach((freq, i) => {
    setTimeout(() => playBeep(freq, duration, type), i * 120)
  })
}

export function useSound() {
  const mutedRef = useRef(false)

  useEffect(() => {
    const stored = localStorage.getItem('tebak_sound_muted')
    if (stored === 'true') mutedRef.current = true
  }, [])

  const play = useCallback((name: SoundName) => {
    if (mutedRef.current) return
    if (name === 'winner') {
      playSequence(WINNER_NOTES, 0.3, 'sine')
      return
    }
    if (name === 'lose') {
      playSequence(LOSE_NOTES, 0.3, 'sine')
      return
    }
    const s = SOUND_FREQ[name]
    if (!s) return
    playBeep(s.freq, s.duration, s.type)
  }, [])

  const isMuted = useCallback(() => mutedRef.current, [])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    localStorage.setItem('tebak_sound_muted', String(mutedRef.current))
  }, [])

  return { play, isMuted, toggleMute }
}
