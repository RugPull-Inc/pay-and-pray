import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearAuthToken, getAuthToken, setAuthToken } from './tokenCookie'

type AuthContextValue = {
  isAuthenticated: boolean
  signIn: (token: string) => void
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState(() => getAuthToken())

  const signIn = useCallback((nextToken: string) => {
    setAuthToken(nextToken)
    setToken(nextToken)
  }, [])

  const signOut = useCallback(() => {
    clearAuthToken()
    setToken(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(token),
      signIn,
      signOut,
    }),
    [signIn, signOut, token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
