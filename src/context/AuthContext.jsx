import { createContext, useContext, useState } from 'react'
import { mockCredentials } from '../data/mockUser'

const KEY = 'a2z_session'
const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => localStorage.getItem(KEY) || sessionStorage.getItem(KEY))

  // POST /api/auth/login – replace this mock check with a real request
  const login = async (clientId, password, remember) => {
    await new Promise((r) => setTimeout(r, 700))
    if (clientId.trim().toUpperCase() !== mockCredentials.clientId || password !== mockCredentials.password) {
      return { ok: false, error: 'Invalid Client ID or password.' }
    }
    ;(remember ? localStorage : sessionStorage).setItem(KEY, 'mock-session')
    setSession('mock-session')
    return { ok: true }
  }
  const logout = () => {
    localStorage.removeItem(KEY)
    sessionStorage.removeItem(KEY)
    setSession(null)
  }
  return <AuthContext.Provider value={{ isAuthenticated: !!session, login, logout }}>{children}</AuthContext.Provider>
}
