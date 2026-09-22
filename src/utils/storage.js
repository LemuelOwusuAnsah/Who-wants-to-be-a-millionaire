const PROFILE_KEY = 'lemsy-millionaire-profiles-v1'
const SESSION_KEY = 'lemsy-millionaire-sessions-v1'
const LEADERBOARD_KEY = 'lemsy-millionaire-leaderboard-v1'

function read(key, fallback) {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function write(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getProfiles() {
  return read(PROFILE_KEY, [])
}

export function saveProfile(profile) {
  const profiles = getProfiles().filter((item) => item.name.toLowerCase() !== profile.name.toLowerCase())
  const next = [profile, ...profiles].slice(0, 8)
  write(PROFILE_KEY, next)
  return next
}

export function getSession(name) {
  return read(SESSION_KEY, {})[name.toLowerCase()] || null
}

export function saveSession(name, session) {
  const sessions = read(SESSION_KEY, {})
  sessions[name.toLowerCase()] = session
  write(SESSION_KEY, sessions)
}

export function clearSession(name) {
  const sessions = read(SESSION_KEY, {})
  delete sessions[name.toLowerCase()]
  write(SESSION_KEY, sessions)
}

export function getLeaderboard() {
  return read(LEADERBOARD_KEY, []).sort((a, b) => b.score - a.score || b.levelIndex - a.levelIndex || a.completedAt - b.completedAt)
}

export function recordLeaderboard(entry) {
  const leaderboard = getLeaderboard()
  const existing = leaderboard.find((item) => item.name.toLowerCase() === entry.name.toLowerCase())
  if (existing) {
    existing.score = Math.max(existing.score, entry.score)
    existing.levelIndex = Math.max(existing.levelIndex, entry.levelIndex)
    existing.completedAt = entry.completedAt
  } else {
    leaderboard.push(entry)
  }
  const next = leaderboard.sort((a, b) => b.score - a.score || b.levelIndex - a.levelIndex).slice(0, 10)
  write(LEADERBOARD_KEY, next)
  return next
}
