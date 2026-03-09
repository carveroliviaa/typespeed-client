import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { getUser, getSessions } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const BADGE_DEFS = {
  speed_demon: { emoji: '🏃', name: 'Speed Demon', desc: 'Reach 80 WPM in a session' },
  sharpshooter: { emoji: '🎯', name: 'Sharpshooter', desc: '99%+ accuracy in a session' },
  on_fire: { emoji: '🔥', name: 'On Fire', desc: '7-day practice streak' },
  bookworm: { emoji: '📚', name: 'Bookworm', desc: 'Complete 50 sessions' },
  ice_cold: { emoji: '🧊', name: 'Ice Cold', desc: '0 errors in a session' },
  hyperspeed: { emoji: '🚀', name: 'Hyperspeed', desc: 'Reach 100 WPM in a session' },
}

const ALL_BADGES = Object.keys(BADGE_DEFS)

function KeyHeatmap({ keyStats }) {
  if (!keyStats || keyStats.length === 0) return <p className="text-slate-500 text-sm">No key data yet.</p>
  const rows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['z','x','c','v','b','n','m'],
  ]
  const statsMap = {}
  for (const s of keyStats) {
    statsMap[s.key.toLowerCase()] = s
  }
  return (
    <div className="space-y-1">
      {rows.map((row, ri) => (
        <div key={ri} className={`flex gap-1 ${ri === 1 ? 'ml-3' : ri === 2 ? 'ml-6' : ''}`}>
          {row.map(k => {
            const s = statsMap[k]
            const rate = s && s.total_count > 0 ? s.error_count / s.total_count : 0
            const bg = !s ? 'bg-bg-border text-slate-600'
              : rate > 0.3 ? 'bg-accent-red/70 text-white'
              : rate > 0.15 ? 'bg-yellow-500/60 text-white'
              : rate > 0 ? 'bg-accent-green/50 text-white'
              : 'bg-accent-green/20 text-accent-green'
            return (
              <div
                key={k}
                className={`${bg} w-9 h-9 rounded flex items-center justify-center text-xs font-mono font-bold transition-all hover:scale-110 cursor-default`}
                title={s ? `${k}: ${s.error_count} errors / ${s.total_count} total (${Math.round(rate * 100)}% error rate)` : k}
              >
                {k}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const { username } = useApp()
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      getUser(username),
      getSessions(username),
    ]).then(([p, s]) => {
      setProfile(p.data)
      setSessions(s.data.slice(0, 50).reverse())
    }).finally(() => setLoading(false))
  }, [username])

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-5xl animate-spin">⌨️</div>
    </div>
  )

  if (!profile) return null
  const p = profile

  const chartData = sessions.map((s, i) => ({
    n: i + 1,
    WPM: Math.round(s.wpm),
    Accuracy: Math.round(s.accuracy),
  }))

  const totalHours = Math.round((p.totalTimePracticed || 0) / 3600 * 10) / 10

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-8 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl font-extrabold text-white shrink-0">
          {username[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-slate-100">{username}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-400">
            <span>🏆 Level {p.level}</span>
            <span>⚡ {Math.round(p.bestWpm || 0)} best WPM</span>
            <span>🎯 {Math.round(p.avgAccuracy || 0)}% avg accuracy</span>
            <span>📚 {p.totalSessions} sessions</span>
            <span>🕐 {totalHours}h practiced</span>
          </div>
          {/* XP bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-2 bg-bg-border rounded-full overflow-hidden">
              <div className="xp-bar-fill h-full rounded-full" style={{ width: `${Math.min(100, (p.currentLevelXP / p.xpForNextLevel) * 100)}%` }} />
            </div>
            <span className="text-xs text-slate-400 shrink-0">{p.currentLevelXP}/{p.xpForNextLevel} XP to Lv {p.level + 1}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-3xl">🔥</span>
          <div>
            <div className="text-2xl font-extrabold text-accent-orange">{p.streak}</div>
            <div className="text-xs text-slate-400">day streak</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* WPM Chart */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-100 mb-4">📈 WPM Over Time</h2>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
                <XAxis dataKey="n" tick={{ fill: '#64748b', fontSize: 10 }} label={{ value: 'Session', position: 'insideBottom', fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8 }} />
                <Line type="monotone" dataKey="WPM" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm">Complete more sessions to see a chart.</p>}
        </div>

        {/* Accuracy Chart */}
        <div className="glass-card p-6">
          <h2 className="font-bold text-slate-100 mb-4">🎯 Accuracy Over Time</h2>
          {chartData.length > 1 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
                <XAxis dataKey="n" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8 }} />
                <Line type="monotone" dataKey="Accuracy" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-sm">Complete more sessions to see a chart.</p>}
        </div>
      </div>

      {/* Key heatmap */}
      <div className="glass-card p-6 mb-8">
        <h2 className="font-bold text-slate-100 mb-4">⌨️ Key Error Heatmap</h2>
        <KeyHeatmap keyStats={p.keyStats} />
        <div className="flex gap-4 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-green/20 inline-block" />No errors</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-green/50 inline-block" />Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/60 inline-block" />Medium</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent-red/70 inline-block" />High</span>
        </div>
      </div>

      {/* Badges */}
      <div className="glass-card p-6">
        <h2 className="font-bold text-slate-100 mb-4">🎖️ Badges</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ALL_BADGES.map(id => {
            const earned = p.badges?.includes(id)
            const def = BADGE_DEFS[id]
            return (
              <div key={id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${earned ? 'border-accent-gold/40 bg-accent-gold/5' : 'border-bg-border opacity-40 grayscale'}`}>
                <span className="text-3xl">{def.emoji}</span>
                <div>
                  <div className={`text-sm font-bold ${earned ? 'text-accent-gold' : 'text-slate-400'}`}>{def.name}</div>
                  <div className="text-xs text-slate-500">{def.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
