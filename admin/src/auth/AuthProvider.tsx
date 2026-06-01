import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext } from './context'

const STORAGE_KEY = 'incircle_admin_demo_session'

function readStored(): boolean {
  if (typeof window === 'undefined') return false
  return window.sessionStorage.getItem(STORAGE_KEY) === '1'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStored)

  const login = useCallback((email: string, password: string) => {
    void email
    void password
    // TODO: replace with real auth (NestJS / OIDC / etc.)
    window.sessionStorage.setItem(STORAGE_KEY, '1')
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(STORAGE_KEY)
    setIsAuthenticated(false)
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
