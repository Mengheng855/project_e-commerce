import { useEffect, useState } from 'react'
import { getCurrentUser, logout as logoutRequest } from '../../features/auth/api/authApi'
import { storage } from '../utils/storage'

export function useAuth() {
  const [token, setTokenState] = useState(() => storage.getToken())
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(token))

  useEffect(() => {
    let active = true

    async function loadUser() {
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await getCurrentUser()
        if (active) {
          setUser(currentUser)
        }
      } catch {
        storage.clearToken()
        if (active) {
          setTokenState(null)
          setUser(null)
        }
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    loadUser()

    return () => {
      active = false
    }
  }, [token])

  function setSession(authData) {
    storage.setToken(authData.token)
    storage.setAdminSession(false)
    setTokenState(authData.token)
    setUser(authData.user)
  }

  async function logout() {
    try {
      await logoutRequest()
    } finally {
      storage.clearToken()
      setTokenState(null)
      setUser(null)
    }
  }

  return {
    isAuthenticated: Boolean(token),
    isLoading,
    logout,
    setSession,
    token,
    user,
  }
}
