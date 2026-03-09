import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import NavBar from './components/NavBar'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import LessonScreen from './pages/LessonScreen'
import ResultsScreen from './pages/ResultsScreen'
import ProfilePage from './pages/ProfilePage'
import Leaderboard from './pages/Leaderboard'
import LessonLibrary from './pages/LessonLibrary'
import { getUser } from './api'

export const AppContext = createContext(null)

export function useApp() {
  return useContext(AppContext)
}

function ProtectedRoute({ children }) {
  const username = localStorage.getItem('typespeed_username')
  if (!username) return <Navigate to="/" replace />
  return children
}

export default function App() {
  const [username, setUsername] = useState(localStorage.getItem('typespeed_username') || null)
  const [userProfile, setUserProfile] = useState(null)
  const [sessionResult, setSessionResult] = useState(null)
  const [muted, setMuted] = useState(false)

  const refreshProfile = async () => {
    if (!username) return
    try {
      const res = await getUser(username)
      setUserProfile(res.data)
    } catch (e) {
      console.error('Failed to refresh profile', e)
    }
  }

  useEffect(() => {
    if (username) refreshProfile()
  }, [username])

  const login = (name) => {
    setUsername(name)
    localStorage.setItem('typespeed_username', name)
  }

  const logout = () => {
    setUsername(null)
    setUserProfile(null)
    localStorage.removeItem('typespeed_username')
  }

  return (
    <AppContext.Provider value={{ username, userProfile, setUserProfile, refreshProfile, sessionResult, setSessionResult, muted, setMuted, login, logout }}>
      <BrowserRouter>
        <div className="min-h-screen bg-bg text-slate-200 font-sans">
          {username && <NavBar />}
          <Routes>
            <Route path="/" element={username ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/lesson" element={<ProtectedRoute><LessonScreen /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsScreen /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
            <Route path="/library" element={<ProtectedRoute><LessonLibrary /></ProtectedRoute>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  )
}
