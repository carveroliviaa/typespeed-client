import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { useSound } from '../hooks/useSound'

const BADGE_DEFS = {
  speed_demon: { emoji: '🏃', name: 'Speed Demon', desc: 'Reach 80 WPM' },
  sharpshooter: { emoji: '🎯', name: 'Sharpshooter', desc: '99%+ accuracy' },
  on_fire: { emoji: '🔥', name: 'On Fire', desc: '7-day streak' },
  bookworm: { emoji: '📚', name: 'Bookworm', desc: '50 sessions' },
  ice_cold: { emoji: '🧊', name: 'Ice Cold', desc: '0 errors' },
  hyperspeed: { emoji: '🚀', name: 'Hyperspeed', desc: '100 WPM' },
}

function KeyHeatmapMini({ keyErrors, keyTotals }) {
  const keys = Object.keys(keyTotals || {})
  if (keys.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1.5">
      {keys.sort().map(k => {
        const rate = keyTotals[k] > 0 ? (keyErrors?.[k] || 0) / keyTotals[k] : 0
        const bg = rate > 0.3 ? 'bg-accent-red/60' : rate > 0.1 ? 'bg-yellow-500/60' : 'bg-accent-green/40'
        return (
          <div key={k} className={`${bg} rounded px-2 py-1 text-xs font-mono font-bold text-white min-w-[28px] text-center`} title={`${k}: ${Math.round(rate * 100)}% error rate`}>
            {k}
          </div>
        )
      })}
    </div>
  )
}

export default function ResultsScreen() {
  const { sessionResult, username, refreshProfile, setSessionResult, muted } = useApp()
  const navigate = useNavigate()
  const { play, setMuted } = useSound()
  const [showBadge, setShowBadge] = useState(false)
  const [badgeIndex, setBadgeIndex] = useState(0)

  useEffect(() => { setMuted(muted) }, [muted])

  useEffect(() => {
    if (!sessionResult) navigate('/dashboard')
  }, [])

  useEffect(() => {
    if (sessionResult?.newBadges?.length > 0) {
      const timer = setTimeout(() => {
        setShowBadge(true)
        play('badge')
      }, 800)
      return () => clearTimeout(timer)
    }
    if (sessionResult?.leveledUp) play('levelup')
  }, [sessionResult])

  if (!sessionResult) return null

  const r = sessionResult
  const xpPct = Math.min(100, (r.currentLevelXP / r.xpForNextLevel) * 100)

  const handleNextBadge = () => {
    if (badgeIndex < (r.newBadges?.length || 1) - 1) {
      setBadgeIndex(b => b + 1)
      play('badge')
    } else {
      setShowBadge(false)
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 animate-slide-up">
      {/* Badge notification overlay */}
      {showBadge && r.newBadges?.[badgeIndex] && (
        <div className="fixed inset-0 bg-bg/80 backdrop-blur z-50 flex items-center justify-center animate-fade-in" onClick={handleNextBadge}>
          <div className="glass-card p-10 text-center animate-bounce-in max-w-sm mx-4">
            <div className="text-8xl mb-4">{BADGE_DEFS[r.newBadges[badgeIndex]]?.emoji}</div>
            <div className="text-2xl font-extrabold text-accent-gold mb-2">Badge Unlocked!</div>
            <div className="text-xl font-bold text-slate-100 mb-1">{BADGE_DEFS[r.newBadges[badgeIndex]]?.name}</div>
            <div className="text-slate-400 mb-6">{BADGE_DEFS[r.newBadges[badgeIndex]]?.desc}</div>
            <div className="text-xs text-slate-500">Click anywhere to continue</div>
          </div>
        </div>
      )}

      <h1 className="text-3xl font-extrabold text-slate-100 mb-2">Session Complete! 🎉</h1>
      <p className="text-slate-400 mb-8">Here's how you did:</p>

      {/* Main stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-extrabold text-yellow-400 mb-1">{Math.round(r.wpm)}</div>
          <div className="text-sm text-slate-400">WPM</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-extrabold text-accent-green mb-1">{Math.round(r.accuracy)}%</div>
          <div className="text-sm text-slate-400">Accuracy</div>
        </div>
        <div className="glass-card p-6 text-center">
          <div className="text-4xl font-extrabold text-accent-red mb-1">{r.errors}</div>
          <div className="text-sm text-slate-400">Errors</div>
        </div>
      </div>

      {/* XP earned */}
      {r.xpEarned !== undefined && (
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-slate-400">XP Earned</div>
              <div className="text-2xl font-bold text-primary-light">+{r.xpEarned} XP</div>
            </div>
            {r.leveledUp && (
              <div className="animate-bounce-in text-center">
                <div className="text-3xl">🎊</div>
                <div className="text-sm font-bold text-accent-gold">Level Up!</div>
                <div className="text-lg font-extrabold text-slate-100">Level {r.newLevel}</div>
              </div>
            )}
            <div className="text-right">
              <div className="text-sm text-slate-400">Level {r.newLevel}</div>
              <div className="text-sm text-slate-500">{r.currentLevelXP}/{r.xpForNextLevel} XP</div>
            </div>
          </div>
          <div className="w-full h-3 bg-bg-border rounded-full overflow-hidden">
            <div className="xp-bar-fill h-full rounded-full" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      )}

      {/* New badges */}
      {r.newBadges?.length > 0 && (
        <div className="glass-card p-5 mb-6 border-accent-gold/30">
          <h3 className="font-bold text-accent-gold mb-3">🏅 New Badges Earned!</h3>
          <div className="flex flex-wrap gap-3">
            {r.newBadges.map(id => (
              <div key={id} className="flex items-center gap-2 bg-accent-gold/10 border border-accent-gold/30 rounded-lg px-3 py-2">
                <span className="text-2xl">{BADGE_DEFS[id]?.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-accent-gold">{BADGE_DEFS[id]?.name}</div>
                  <div className="text-xs text-slate-400">{BADGE_DEFS[id]?.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-key heatmap */}
      {r.key_totals && Object.keys(r.key_totals).length > 0 && (
        <div className="glass-card p-5 mb-6">
          <h3 className="font-bold text-slate-100 mb-3">⌨️ Key Performance</h3>
          <KeyHeatmapMini keyErrors={r.key_errors} keyTotals={r.key_totals} />
          <div className="flex gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-green/40 inline-block" />Good</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/60 inline-block" />Weak</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-red/60 inline-block" />Needs work</span>
          </div>
        </div>
      )}

      {/* Streak */}
      {r.newStreak > 0 && (
        <div className="glass-card p-5 mb-6 flex items-center gap-3">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="font-bold text-slate-100">{r.newStreak}-Day Streak!</div>
            <div className="text-sm text-slate-400">Keep it up — practice again tomorrow!</div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => { setSessionResult(null); navigate(-2) }}
          className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
        >
          🔄 Play Again
        </button>
        <button
          onClick={() => { refreshProfile(); navigate('/dashboard') }}
          className="flex-1 py-3 rounded-xl border border-bg-border text-slate-300 hover:border-slate-500 hover:text-white transition-colors font-medium"
        >
          🏠 Dashboard
        </button>
        <button
          onClick={() => { refreshProfile(); navigate('/leaderboard') }}
          className="flex-1 py-3 rounded-xl border border-bg-border text-slate-300 hover:border-slate-500 hover:text-white transition-colors font-medium hidden sm:block"
        >
          🏆 Leaderboard
        </button>
      </div>
    </main>
  )
}
