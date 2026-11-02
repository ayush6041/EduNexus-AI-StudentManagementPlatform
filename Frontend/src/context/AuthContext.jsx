import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authStore } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStore.get())

  const login = useCallback((response) => {
    authStore.set(response)
    setUser(response)
  }, [])

  const logout = useCallback(() => {
    authStore.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    const onUnauthorized = () => logout()
    const onMustChange = () =>
      setUser((u) => {
        if (!u) return u
        const next = { ...u, mustChangePassword: true }
        authStore.set(next)
        return next
      })
    window.addEventListener('sms:unauthorized', onUnauthorized)
    window.addEventListener('sms:must-change', onMustChange)
    return () => {
      window.removeEventListener('sms:unauthorized', onUnauthorized)
      window.removeEventListener('sms:must-change', onMustChange)
    }
  }, [logout])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)
