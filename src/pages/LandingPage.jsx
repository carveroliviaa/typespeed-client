import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUser } from '../api'
import { useApp } from '../App'

export default function LandingPage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!username.trim()) return setError('Please enter a username.')
    setLoading(true)
    try {
      const res = await createUser(username.trim())
      login(res.data.username)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center px-4 animate-slide-up max-w-lg w-full">
        {/* Logo */}
        <div className="text-8xl mb-6 animate-bounce-in">⌨️</div>
        <h1 className="text-5xl font-extrabold mb-3 gradient-text">TypeSpeed</h1>
        <p className="text-slate-400 text-lg mb-10">
          Master your typing speed and accuracy.<br />
          Adaptive lessons. Real-time feedback. Compete with friends.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['🎯 Adaptive Lessons', '🏆 Leaderboard', '🔥 Streaks', '🎖️ Badges', '📊 Analytics'].map(f => (
            <span key={f} className="text-xs px-3 py-1 rounded-full bg-bg-card border border-bg-border text-slate-300">{f}</span>
          ))}
        </div>

        {/* Username form */}
        <div className="glass-card p-8 mx-auto">
          <h2 className="text-xl font-bold mb-6 text-slate-100">Choose your username to begin</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError('') }}
              placeholder="e.g. speedtyper99"
              className="w-full px-4 py-3 rounded-xl bg-bg border border-bg-border text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors font-mono text-lg"
              maxLength={20}
              autoFocus
            />
            {error && (
              <div className="text-accent-red text-sm bg-accent-red/10 border border-accent-red/20 rounded-lg px-3 py-2 animate-fade-in">
                ⚠️ {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
            >
              {loading ? 'Loading...' : '🚀 Let\'s Go'}
            </button>
          </form>
          <p className="text-xs text-slate-500 mt-4">
            No password needed — your username is your identity.
          </p>
        </div>
      </div>
    </div>
  )
}
