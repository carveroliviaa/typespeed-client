import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useApp } from '../App'
import { getSessions } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ icon, label, value, color = 'text-primary-light' }) {
  return (
    <div className="glass-card p-4 flex flex-col gap-1">
      <div className="text-2xl">{icon}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  )
}

function QuickStart({ navigate, username }) {
  const modes = [
    { label: '🕐 15s Sprint', mode: 'timed', duration: 15, difficulty: 'medium', targetWords: 999 },
    { label: '⏱️ 60s Race', mode: 'timed', duration: 60, difficulty: 'medium', targetWords: 999 },
    { label: '📝 Short (25w)', mode: 'fixed', duration: null, difficulty: 'medium', targetWords: 25 },
    { label: '📄 Medium (50w)', mode: 'fixed', duration: null, difficulty: 'medium', targetWords: 50 },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {modes.map((m) => (
        <button
          key={m.label}
          onClick={() => navigate('/lesson', { state: { ...m, username } })}
          className="glass-card p-4 text-center hover:border-primary/50 hover:bg-bg-hover transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <div className="text-2xl mb-1">{m.label.split(' ')[0]}</div>
          <div className="text-sm font-semibold text-slate-200">{m.label.replace(/^\S+\s/, '')}</div>
        </button>
      ))}
    </div>
  )
}

const BADGE_DEFS = {
  speed_demon: { emoji: '🏃', name: 'Speed Demon' },
  sharpshooter: { emoji: '🎯', name: 'Sharpshooter' },
  on_fire: { emoji: '🔥', name: 'On Fire' },
  bookworm: { emoji: '📚', name: 'Bookworm' },
  ice_cold: { emoji: '🧊', name: 'Ice Cold' },
  hyperspeed: { emoji: '🚀', name: 'Hyperspeed' },
}

export default function Dashboard() {
  const { username, userProfile, refreshProfile } = useApp()
  const [sessions, setSessions] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    refreshProfile()
    getSessions(username).then(r => setSessions(r.data.slice(0, 10))).catch(() => {})
  }, [username])

  const p = userProfile
  const chartData = [...sessions].reverse().map((s, i) => ({
    name: `#${i + 1}`,
    WPM: Math.round(s.wpm),
    Accuracy: Math.round(s.accuracy),
  }))

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-100">
          Welcome back, <span className="gradient-text">{username}</span>! 👋
        </h1>
        <p className="text-slate-400 mt-1">Ready to improve your typing today?</p>
      </div>

      {/* Stats row */}
      {p && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard icon="⚡" label="Best WPM" value={Math.round(p.bestWpm || 0)} color="text-yellow-400" />
          <StatCard icon="🎯" label="Avg Accuracy" value={`${Math.round(p.avgAccuracy || 0)}%`} color="text-accent-green" />
          <StatCard icon="🔥" label="Streak" value={`${p.streak}d`} color="text-accent-orange" />
          <StatCard icon="📚" label="Sessions" value={p.totalSessions} color="text-purple-400" />
        </div>
      )}

      {/* XP / Level card */}
      {p && (
        <div className="glass-card p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center text-2xl font-extrabold text-primary-light">
              {p.level}
            </div>
            <div>
              <div className="text-sm text-slate-400">Level {p.level}</div>
              <div className="text-lg font-bold text-slate-100">
                {p.currentLevelXP} / {p.xpForNextLevel} XP
              </div>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="w-full h-3 bg-bg-border rounded-full overflow-hidden">
              <div
                className="xp-bar-fill h-full rounded-full"
                style={{ width: `${Math.min(100, (p.currentLevelXP / p.xpForNextLevel) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>Level {p.level}</span>
              <span>Level {p.level + 1}</span>
            </div>
          </div>
          {/* Badges preview */}
          {p.badges && p.badges.length > 0 && (
            <div className="flex gap-1">
              {p.badges.slice(0, 4).map(id => (
                <span key={id} title={BADGE_DEFS[id]?.name} className="text-2xl">{BADGE_DEFS[id]?.emoji}</span>
              ))}
              {p.badges.length > 4 && <span className="text-xs text-slate-400 self-center">+{p.badges.length - 4}</span>}
            </div>
          )}
        </div>
      )}

      {/* Quick Start */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-slate-100 mb-3">⚡ Quick Start</h2>
        <QuickStart navigate={navigate} username={username} />
        <div className="mt-3 flex gap-3">
          <Link
            to="/library"
            className="flex-1 text-center py-3 rounded-xl border border-bg-border text-slate-300 hover:border-primary/40 hover:text-primary-light transition-colors text-sm font-medium"
          >
            📚 Browse Lesson Library
          </Link>
          <button
            onClick={() => navigate('/lesson', { state: { mode: 'timed', duration: 60, difficulty: 'medium', targetWords: 999, adaptive: true, username } })}
            className="flex-1 py-3 rounded-xl bg-primary/10 border border-primary/30 text-primary-light hover:bg-primary/20 transition-colors text-sm font-medium"
          >
            🤖 Adaptive Lesson
          </button>
        </div>
      </div>

      {/* Recent WPM chart */}
      {chartData.length > 1 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-bold text-slate-100 mb-4">📈 Recent WPM</h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3148" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid #2d3148', borderRadius: 8 }} />
              <Line type="monotone" dataKey="WPM" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-100 mb-4">🕐 Recent Sessions</h2>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s, i) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b border-bg-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 text-sm w-5">#{i + 1}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-bg-border text-slate-400">{s.mode}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-yellow-400 font-bold">{Math.round(s.wpm)} WPM</span>
                  <span className="text-accent-green">{Math.round(s.accuracy)}%</span>
                  <span className="text-slate-500 hidden sm:block">{new Date(s.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
