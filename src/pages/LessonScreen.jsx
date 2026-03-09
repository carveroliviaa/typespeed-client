import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../App'
import { useTyping } from '../hooks/useTyping'
import { useSound } from '../hooks/useSound'
import { getAdaptiveLesson, generateLesson, submitSession } from '../api'

// QWERTY layout
const ROWS = [
  ['`','1','2','3','4','5','6','7','8','9','0','-','='],
  ['q','w','e','r','t','y','u','i','o','p','[',']','\\'],
  ['a','s','d','f','g','h','j','k','l',';',"'"],
  ['z','x','c','v','b','n','m',',','.','/'],
]
const SPECIAL = { '`': '`', '-': '-', '=': '=', '[': '[', ']': ']', '\\': '\\', ';': ';', "'": "'", ',': ',', '.': '.', '/': '/' }

function VirtualKeyboard({ nextChar, show }) {
  if (!show) return null
  const next = nextChar?.toLowerCase()
  return (
    <div className="mt-4 p-4 glass-card select-none">
      {ROWS.map((row, ri) => (
        <div key={ri} className={`flex justify-center gap-1 mb-1 ${ri === 1 ? 'ml-4' : ri === 2 ? 'ml-8' : ri === 3 ? 'ml-14' : ''}`}>
          {row.map(k => {
            const isNext = k === next || (next === ' ' && k === 'space')
            return (
              <div
                key={k}
                className={`
                  flex items-center justify-center rounded-md text-xs font-mono font-semibold
                  min-w-[28px] h-8 px-1 transition-all duration-100
                  ${isNext
                    ? 'bg-primary text-white shadow-lg shadow-primary/50 scale-110 animate-pulse-glow'
                    : 'bg-bg-card border border-bg-border text-slate-400'
                  }
                `}
              >
                {k}
              </div>
            )
          })}
          {ri === ROWS.length - 1 && (
            <div className={`flex items-center justify-center rounded-md text-xs font-mono font-semibold h-8 px-1 transition-all duration-100 ${next === ' ' ? 'bg-primary text-white shadow-lg shadow-primary/50 scale-110 animate-pulse-glow' : 'bg-bg-card border border-bg-border text-slate-400'} w-40`}>
              SPACE
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function TypingArea({ text, charStates, currentIndex }) {
  const scrollRef = useRef(null)
  const cursorRef = useRef(null)

  useEffect(() => {
    if (!scrollRef.current || !cursorRef.current) return
    const container = scrollRef.current
    const cursor = cursorRef.current
    // getBoundingClientRect gives positions relative to viewport — reliable across all CSS
    const containerRect = container.getBoundingClientRect()
    const cursorRect = cursor.getBoundingClientRect()
    // How far is the cursor from the top of the container (in current scroll state)?
    const cursorOffsetInContainer = cursorRect.top - containerRect.top
    // Scroll so the cursor sits at 30% from the top of the visible area
    const desiredOffset = containerRect.height * 0.3
    container.scrollTop = Math.max(0, container.scrollTop + cursorOffsetInContainer - desiredOffset)
  }, [currentIndex])

  return (
    <div className="rounded-xl bg-bg border border-bg-border cursor-text w-full overflow-hidden" style={{ height: '9rem' }}>
      <div
        ref={scrollRef}
        className="font-mono text-lg leading-relaxed select-none p-6 h-full overflow-y-scroll relative"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {/* Hide webkit scrollbar */}
        <style>{`.typing-scroll::-webkit-scrollbar{display:none}`}</style>
        <p className="break-words whitespace-pre-wrap m-0">
          {text.split('').map((ch, i) => {
            const isCurrent = i === currentIndex
            let cls = 'text-slate-500'
            if (i < currentIndex) {
              cls = charStates[i] === 'correct' ? 'text-accent-green' : 'text-accent-red bg-accent-red/10 rounded'
            }
            return (
              <span
                key={i}
                ref={isCurrent ? cursorRef : null}
                className={`${cls} ${isCurrent ? 'border-l-2 border-primary-light typing-cursor' : ''}`}
              >
                {ch}
              </span>
            )
          })}
        </p>
      </div>
    </div>
  )
}


export default function LessonScreen() {
  const location = useLocation()
  const navigate = useNavigate()
  const { username, setSessionResult, muted } = useApp()
  const { play, setMuted: setSoundMuted } = useSound()

  const state = location.state || {}
  const mode = state.mode || 'fixed'
  const duration = state.duration || 60
  const difficulty = state.difficulty || 'medium'
  const targetWords = state.targetWords || 50
  const adaptive = state.adaptive || false

  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const [showKeyboard, setShowKeyboard] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => { setSoundMuted(muted) }, [muted])

  // Load lesson text
  useEffect(() => {
    setLoading(true)
    const fn = adaptive
      ? getAdaptiveLesson(username, difficulty, targetWords)
      : generateLesson(username, difficulty, targetWords)
    fn.then(r => {
      setText(r.data.text || '')
      setLoading(false)
    }).catch(() => {
      setText('The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.')
      setLoading(false)
    })
  }, [])

  const typing = useTyping({ text, mode, duration })
  const prevFinished = useRef(false)

  // Play sounds on state changes
  const prevIndex = useRef(0)
  useEffect(() => {
    if (typing.currentIndex > prevIndex.current) {
      const prevState = typing.charStates[typing.currentIndex - 1]
      if (prevState === 'correct') play('correct')
      else if (prevState === 'wrong') play('error')
    }
    prevIndex.current = typing.currentIndex
  }, [typing.currentIndex])

  // Submit on finish
  useEffect(() => {
    if (typing.isFinished && !prevFinished.current && text && !submitting) {
      prevFinished.current = true
      setSubmitting(true)
      play('complete')

      const payload = {
        username,
        wpm: typing.wpm,
        accuracy: typing.accuracy,
        duration_seconds: Math.round(typing.elapsed),
        mode,
        correct_keystrokes: typing.correctKeystrokes,
        total_keystrokes: typing.totalKeystrokes,
        errors: typing.errors,
        key_errors: typing.keyErrors,
        key_totals: typing.keyTotals,
      }

      submitSession(payload)
        .then(r => {
          setSessionResult({ ...payload, ...r.data, text })
          navigate('/results')
        })
        .catch(() => {
          setSessionResult({ ...payload, text })
          navigate('/results')
        })
        .finally(() => setSubmitting(false))
    }
  }, [typing.isFinished])

  // Focus hidden input on click — preventScroll stops the browser from scrolling the page to the input
  const focusInput = useCallback(() => inputRef.current?.focus({ preventScroll: true }), [])

  useEffect(() => { inputRef.current?.focus({ preventScroll: true }) }, [loading])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-spin">⌨️</div>
          <p className="text-slate-400">Loading lesson...</p>
        </div>
      </div>
    )
  }

  const nextChar = text[typing.currentIndex]
  const timerColor = typing.timeLeft !== null && typing.timeLeft <= 5 ? 'text-accent-red animate-pulse' : 'text-primary-light'

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 animate-fade-in" onClick={focusInput}>
      {/* Hidden input that captures keyboard events */}
      <input
        ref={inputRef}
        onKeyDown={typing.handleKeyDown}
        readOnly
        aria-label="Typing input"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        style={{ position: 'fixed', top: 0, left: 0, opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {mode === 'timed' ? `⏱️ ${duration}s Race` : '📝 Fixed Passage'}
            <span className="ml-2 text-sm text-slate-500 capitalize">· {difficulty}</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {typing.timeLeft !== null && (
            <div className={`text-3xl font-bold font-mono tabular-nums ${timerColor}`}>
              {Math.ceil(typing.timeLeft)}s
            </div>
          )}
          <button
            onClick={() => setShowKeyboard(s => !s)}
            className="text-xs px-3 py-1.5 rounded-lg border border-bg-border text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-colors"
          >
            {showKeyboard ? '🙈 Hide KB' : '⌨️ Show KB'}
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs px-3 py-1.5 rounded-lg border border-bg-border text-slate-400 hover:text-red-400 transition-colors"
          >
            ✕ Exit
          </button>
        </div>
      </div>

      {/* Live stats */}
      <div className="flex gap-6 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400 tabular-nums">{typing.wpm}</div>
          <div className="text-xs text-slate-500">WPM</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-green tabular-nums">{typing.accuracy}%</div>
          <div className="text-xs text-slate-500">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-red tabular-nums">{typing.errors}</div>
          <div className="text-xs text-slate-500">Errors</div>
        </div>
        {mode === 'fixed' && (
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400 tabular-nums">
              {Math.round((typing.currentIndex / text.length) * 100)}%
            </div>
            <div className="text-xs text-slate-500">Progress</div>
          </div>
        )}
      </div>

      {/* Progress bar (fixed mode) */}
      {mode === 'fixed' && (
        <div className="w-full h-1.5 bg-bg-border rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-200"
            style={{ width: `${(typing.currentIndex / text.length) * 100}%` }}
          />
        </div>
      )}

      {/* Typing area */}
      <TypingArea text={text} charStates={typing.charStates} currentIndex={typing.currentIndex} />

      {!typing.isStarted && (
        <p className="text-center text-slate-500 mt-3 text-sm animate-pulse">
          Click here and start typing to begin…
        </p>
      )}

      {/* Virtual keyboard */}
      <VirtualKeyboard nextChar={nextChar} show={showKeyboard} />

      {submitting && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur flex items-center justify-center z-50">
          <div className="text-center">
            <div className="text-5xl mb-3 animate-spin">⏳</div>
            <p className="text-slate-300 font-medium">Saving results…</p>
          </div>
        </div>
      )}
    </main>
  )
}
