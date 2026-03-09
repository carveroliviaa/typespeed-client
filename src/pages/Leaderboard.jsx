import { useEffect, useState } from 'react'
import { useApp } from '../App'
import { getLeaderboard } from '../api'

const SORT_OPTIONS = [
  { key: 'bestWpm', label: '⚡ Best WPM' },
  { key: 'avgAccuracy', label: '🎯 Avg Accuracy' },
  { key: 'level', label: '🏆 Level' },
]

const BADGE_DEFS = {
  speed_demon: '🏃', sharpshooter: '🎯', on_fire: '🔥',
  bookworm: '📚', ice_cold: '🧊', hyperspeed: '🚀',
}

export default function Leaderboard() {
  const { username } = useApp()
  const [data, setData] = useState([])
  const [sortKey, setSortKey] = useState('bestWpm')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  const sorted = [...data].sort((a, b) => b[sortKey] - a[sortKey])

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-5xl animate-spin">⌨️</div>
    </div>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-100 mb-2">🏆 Leaderboard</h1>
      <p className="text-slate-400 mb-6">Compete with your group — see who's fastest!</p>

      {/* Sort buttons */}
      <div className="flex gap-2 mb-6">
        {SORT_OPTIONS.map(o => (
          <button
            key={o.key}
            onClick={() => setSortKey(o.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${sortKey === o.key ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-bg-card border border-bg-border text-slate-400 hover:text-slate-200'}`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border">
                <th className="text-left px-4 py-3 text-slate-500 font-semibold w-12">Rank</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold">Player</th>
                <th className="text-right px-4 py-3 text-slate-500 font-semibold">Best WPM</th>
                <th className="text-right px-4 py-3 text-slate-500 font-semibold hidden sm:table-cell">Avg Acc</th>
                <th className="text-right px-4 py-3 text-slate-500 font-semibold hidden md:table-cell">Level</th>
                <th className="text-left px-4 py-3 text-slate-500 font-semibold hidden lg:table-cell">Badges</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((player, i) => {
                const isMe = player.username === username
                const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
                return (
                  <tr
                    key={player.username}
                    className={`border-b border-bg-border last:border-0 transition-colors ${isMe ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-bg-hover'}`}
                  >
                    <td className="px-4 py-3 text-center">
                      {rankEmoji ? (
                        <span className="text-xl">{rankEmoji}</span>
                      ) : (
                        <span className="text-slate-500 font-mono">{i + 1}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {player.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className={`font-semibold ${isMe ? 'text-primary-light' : 'text-slate-200'}`}>
                            {player.username} {isMe && <span className="text-xs text-primary/70">(you)</span>}
                          </div>
                          <div className="text-xs text-slate-500">🔥 {player.streak}d streak · {player.totalSessions} sessions</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-yellow-400 font-bold">{player.bestWpm}</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="text-accent-green">{player.avgAccuracy}%</span>
                    </td>
                    <td className="px-4 py-3 text-right hidden md:table-cell">
                      <span className="text-primary-light font-bold px-2 py-0.5 rounded-full bg-primary/10 text-xs">Lv {player.level}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex gap-0.5">
                        {(player.badges || []).map(b => (
                          <span key={b} title={b} className="text-lg">{BADGE_DEFS[b]}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <div className="text-4xl mb-3">🏆</div>
            <p>No players yet. Be the first!</p>
          </div>
        )}
      </div>
    </main>
  )
}
