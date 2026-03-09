import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../App'
import { useState } from 'react'

function XPBar({ current, max, level }) {
  const pct = Math.min(100, Math.round((current / max) * 100))
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold text-primary-light bg-primary/20 px-2 py-0.5 rounded-full">Lv {level}</span>
      <div className="w-24 h-2 bg-bg-border rounded-full overflow-hidden">
        <div className="xp-bar-fill h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-400">{current}/{max} XP</span>
    </div>
  )
}

export default function NavBar() {
  const { username, userProfile, logout, muted, setMuted } = useApp()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/library', label: 'Lessons' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/profile', label: 'Profile' },
  ]

  const p = userProfile

  return (
    <nav className="sticky top-0 z-50 border-b border-bg-border bg-bg-card/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">⌨️</span>
          <span className="font-bold text-lg gradient-text hidden sm:block">TypeSpeed</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? 'bg-primary/20 text-primary-light'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-bg-hover'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Streak */}
          {p && (
            <div className="hidden sm:flex items-center gap-1 text-accent-orange font-bold text-sm">
              <span>🔥</span>
              <span>{p.streak}</span>
            </div>
          )}

          {/* XP Bar */}
          {p && (
            <div className="hidden md:block">
              <XPBar current={p.currentLevelXP} max={p.xpForNextLevel} level={p.level} />
            </div>
          )}

          {/* Username */}
          <span className="text-sm font-semibold text-slate-200 hidden sm:block">
            {username}
          </span>

          {/* Mute */}
          <button
            onClick={() => setMuted(m => !m)}
            className="p-2 rounded-lg hover:bg-bg-hover text-slate-400 hover:text-slate-200 transition-colors text-lg"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? '🔇' : '🔊'}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="hidden sm:block text-xs px-3 py-1.5 rounded-lg border border-bg-border text-slate-400 hover:text-red-400 hover:border-red-400/50 transition-colors"
          >
            Leave
          </button>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 text-slate-400"
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-bg-border bg-bg-card px-4 pb-3 animate-fade-in">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="block py-2 text-sm text-slate-300 hover:text-white"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <button onClick={logout} className="block py-2 text-sm text-red-400">Leave</button>
        </div>
      )}
    </nav>
  )
}
