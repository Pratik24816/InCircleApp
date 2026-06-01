import { createContext } from 'react'

export type AuthContextValue = {
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)
