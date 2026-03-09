import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Core typing hook — manages all typing state for a lesson session.
 *
 * Returns:
 *   typed         - string of what the user has typed
 *   charStates    - array of 'correct' | 'wrong' | 'pending'
 *   currentIndex  - position in the text
 *   wpm           - live WPM
 *   accuracy      - live accuracy %
 *   isStarted     - whether the user has started typing
 *   isFinished    - whether the session is complete
 *   timeLeft      - seconds remaining (timed mode) or null
 *   elapsed       - seconds elapsed
 *   errors        - total error count
 *   keyErrors     - { key -> count } per-key errors
 *   keyTotals     - { key -> count } per-key total presses
 *   handleKeyDown - event handler to attach to a hidden input or window
 *   reset         - reset all state for a new attempt
 */
export function useTyping({ text, mode, duration }) {
  const [typed, setTyped] = useState('')
  const [charStates, setCharStates] = useState(() => Array(text?.length || 0).fill('pending'))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [isStarted, setIsStarted] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(mode === 'timed' ? duration : null)
  const [elapsed, setElapsed] = useState(0)
  const [errors, setErrors] = useState(0)
  const [keyErrors, setKeyErrors] = useState({})
  const [keyTotals, setKeyTotals] = useState({})

  const startTimeRef = useRef(null)
  const totalKeysRef = useRef(0)
  const correctKeysRef = useRef(0)
  const timerRef = useRef(null)

  // Start/stop timer
  useEffect(() => {
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        const now = Date.now()
        const secs = (now - startTimeRef.current) / 1000
        setElapsed(secs)

        if (mode === 'timed') {
          const remaining = Math.max(0, duration - secs)
          setTimeLeft(remaining)
          if (remaining <= 0) {
            setIsFinished(true)
          }
        }

        // Update live WPM
        const mins = secs / 60
        if (mins > 0) {
          const chars = correctKeysRef.current
          setWpm(Math.round(chars / 5 / mins))
        }
      }, 200)
    }
    return () => clearInterval(timerRef.current)
  }, [isStarted, isFinished, mode, duration])

  const handleKeyDown = useCallback((e) => {
    if (isFinished) return

    // Ignore modifier keys
    if (e.ctrlKey || e.altKey || e.metaKey) return
    if (e.key === 'Tab') { e.preventDefault(); return }
    if (e.key === 'Shift') return
    if (e.key === 'CapsLock') return

    if (!isStarted) {
      setIsStarted(true)
      startTimeRef.current = Date.now()
    }

    if (e.key === 'Backspace') {
      if (currentIndex > 0) {
        const newIndex = currentIndex - 1
        setCurrentIndex(newIndex)
        setTyped(prev => prev.slice(0, -1))
        setCharStates(prev => {
          const next = [...prev]
          next[newIndex] = 'pending'
          return next
        })
      }
      return
    }

    if (e.key.length !== 1) return

    const expected = text[currentIndex]
    const isCorrect = e.key === expected

    // Track per-key stats
    const keyName = expected?.toLowerCase() || ''
    if (keyName) {
      setKeyTotals(prev => ({ ...prev, [keyName]: (prev[keyName] || 0) + 1 }))
      if (!isCorrect) {
        setKeyErrors(prev => ({ ...prev, [keyName]: (prev[keyName] || 0) + 1 }))
        setErrors(prev => prev + 1)
      }
    }

    totalKeysRef.current += 1
    if (isCorrect) correctKeysRef.current += 1

    // Update accuracy
    setAccuracy(Math.round((correctKeysRef.current / totalKeysRef.current) * 100))

    setCharStates(prev => {
      const next = [...prev]
      next[currentIndex] = isCorrect ? 'correct' : 'wrong'
      return next
    })

    setTyped(prev => prev + e.key)
    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)

    // Check completion for fixed mode
    if (mode === 'fixed' && newIndex >= text.length) {
      setIsFinished(true)
    }
  }, [isFinished, isStarted, currentIndex, text, mode])

  const reset = useCallback(() => {
    setTyped('')
    setCharStates(Array(text?.length || 0).fill('pending'))
    setCurrentIndex(0)
    setWpm(0)
    setAccuracy(100)
    setIsStarted(false)
    setIsFinished(false)
    setTimeLeft(mode === 'timed' ? duration : null)
    setElapsed(0)
    setErrors(0)
    setKeyErrors({})
    setKeyTotals({})
    totalKeysRef.current = 0
    correctKeysRef.current = 0
    startTimeRef.current = null
    clearInterval(timerRef.current)
  }, [text, mode, duration])

  return {
    typed, charStates, currentIndex, wpm, accuracy,
    isStarted, isFinished, timeLeft, elapsed, errors,
    keyErrors, keyTotals, handleKeyDown, reset,
    correctKeystrokes: correctKeysRef.current,
    totalKeystrokes: totalKeysRef.current,
  }
}
