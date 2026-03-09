import { useRef, useCallback } from 'react'

// Frequencies and durations for each sound type
const SOUNDS = {
  correct: { type: 'sine', freq: 880, duration: 0.06, gain: 0.08 },
  error:   { type: 'sawtooth', freq: 220, duration: 0.12, gain: 0.12 },
  complete:{ type: 'sine', freqs: [523, 659, 784, 1047], duration: 0.15, gain: 0.15 },
  badge:   { type: 'sine', freqs: [784, 988, 1175, 1568], duration: 0.18, gain: 0.15 },
  levelup: { type: 'sine', freqs: [523, 659, 784, 1047, 1319], duration: 0.2, gain: 0.18 },
}

export function useSound() {
  const mutedRef = useRef(false)
  const ctxRef = useRef(null)

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)()
    }
    return ctxRef.current
  }

  function playTone(freq, type, duration, gain, delay = 0) {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.type = type
    osc.frequency.setValueAtTime(freq, ctx.currentTime + delay)
    gainNode.gain.setValueAtTime(gain, ctx.currentTime + delay)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)
    osc.start(ctx.currentTime + delay)
    osc.stop(ctx.currentTime + delay + duration + 0.05)
  }

  const play = useCallback((soundName) => {
    if (mutedRef.current) return
    try {
      const s = SOUNDS[soundName]
      if (!s) return
      if (s.freqs) {
        s.freqs.forEach((freq, i) => playTone(freq, s.type, s.duration, s.gain, i * s.duration * 0.8))
      } else {
        playTone(s.freq, s.type, s.duration, s.gain)
      }
    } catch (e) {
      // Audio not available
    }
  }, [])

  const setMuted = useCallback((val) => {
    mutedRef.current = val
  }, [])

  const getMuted = useCallback(() => mutedRef.current, [])

  return { play, setMuted, getMuted }
}
