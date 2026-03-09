import axios from 'axios'

// In production (Vercel): set VITE_API_URL=https://your-app.up.railway.app
// In development: Vite proxy handles /api → http://localhost:3001
const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'

const API = axios.create({ baseURL: BASE_URL })


// Users
export const createUser = (username) => API.post('/users', { username })
export const getUser = (username) => API.get(`/users/${username}`)

// Sessions
export const submitSession = (data) => API.post('/sessions', data)
export const getSessions = (username) => API.get(`/sessions/${username}`)

// Leaderboard
export const getLeaderboard = () => API.get('/leaderboard')

// Lessons
export const getLessons = () => API.get('/lessons')
export const getAdaptiveLesson = (username, difficulty = 'medium', targetWords = 50) =>
  API.get(`/lessons/next/${username}`, { params: { difficulty, targetWords } })
export const generateLesson = (username, difficulty, targetWords) =>
  API.get('/lessons/generate', { params: { username, difficulty, targetWords } })
