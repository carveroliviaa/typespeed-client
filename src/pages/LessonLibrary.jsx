import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App'
import { getLessons } from '../api'

const DIFFICULTY_COLORS = {
  easy: 'text-accent-green border-accent-green/30 bg-accent-green/10',
  medium: 'text-primary-light border-primary/30 bg-primary/10',
  hard: 'text-accent-red border-accent-red/30 bg-accent-red/10',
  sentences: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
}

const DIFFICULTY_LABELS = {
  easy: '🟢 Easy',
  medium: '🔵 Medium',
  hard: '🔴 Hard',
  sentences: '🟣 Sentences',
}

export default function LessonLibrary() {
  const { username } = useApp()
  const [lessons, setLessons] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getLessons()
      .then(r => setLessons(r.data))
      .finally(() => setLoading(false))
  }, [])

  const filters = ['all', 'easy', 'medium', 'hard', 'sentences']
  const filtered = filter === 'all' ? lessons : lessons.filter(l => l.difficulty === filter)

  const startLesson = (lesson) => {
    navigate('/lesson', {
      state: {
        mode: lesson.mode,
        duration: lesson.duration || null,
        difficulty: lesson.difficulty,
        targetWords: lesson.targetWords,
        username,
      },
    })
  }

  if (loading) return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-5xl animate-spin">⌨️</div>
    </div>
  )

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-100 mb-2">📚 Lesson Library</h1>
      <p className="text-slate-400 mb-6">Choose any lesson to practice. Adaptive lessons automatically focus on your weak keys.</p>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-bg-card border border-bg-border text-slate-400 hover:text-slate-200'}`}
          >
            {f === 'all' ? '🌍 All' : DIFFICULTY_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Lesson grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(lesson => (
          <div
            key={lesson.id}
            className="glass-card p-5 flex flex-col gap-3 hover:border-primary/40 hover:bg-bg-hover transition-all duration-200 hover:scale-[1.02] cursor-pointer group"
            onClick={() => startLesson(lesson)}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-bold text-slate-100 group-hover:text-primary-light transition-colors">{lesson.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${DIFFICULTY_COLORS[lesson.difficulty] || ''}`}>
                    {DIFFICULTY_LABELS[lesson.difficulty]}
                  </span>
                  <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full border border-bg-border capitalize">
                    {lesson.mode === 'timed' ? `⏱️ ${lesson.duration}s` : '📝 Fixed'}
                  </span>
                </div>
              </div>
              <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">
                {lesson.mode === 'timed' ? '⏱️' : '📝'}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              {lesson.mode === 'fixed'
                ? `~${lesson.targetWords} words`
                : `${lesson.duration} second time limit`}
            </div>

            <button className="mt-auto w-full py-2 rounded-lg bg-primary/0 border border-bg-border group-hover:bg-primary group-hover:border-primary text-slate-400 group-hover:text-white text-sm font-medium transition-all">
              Start →
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <div className="text-4xl mb-3">📚</div>
          <p>No lessons found for this filter.</p>
        </div>
      )}
    </main>
  )
}
