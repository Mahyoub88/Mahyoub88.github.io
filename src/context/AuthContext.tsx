import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

const PASSWORD_KEY = 'portfolio-admin-password'
const SESSION_KEY = 'portfolio-admin-session'
const DEFAULT_PASSWORD = 'admin123'

function getStoredPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) || DEFAULT_PASSWORD
}

interface AuthContextValue {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  changePassword: (current: string, next: string) => boolean
  isDefaultPassword: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true',
  )
  const [isDefaultPassword, setIsDefaultPassword] = useState(
    () => !localStorage.getItem(PASSWORD_KEY),
  )

  const login = useCallback((password: string) => {
    if (password === getStoredPassword()) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setIsAuthenticated(true)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setIsAuthenticated(false)
  }, [])

  const changePassword = useCallback((current: string, next: string) => {
    if (current !== getStoredPassword()) return false
    localStorage.setItem(PASSWORD_KEY, next)
    setIsDefaultPassword(false)
    return true
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout, changePassword, isDefaultPassword }),
    [isAuthenticated, login, logout, changePassword, isDefaultPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
