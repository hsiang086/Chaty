import React, { useState, createContext, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import { API_URL } from '@/constants'

export type UserInfo = {
  username: string
  id: string
}

type AuthContextType = {
  authenticated: boolean
  setAuthenticated: (auth: boolean) => void
  user: UserInfo
  setUser: (user: UserInfo) => void
  signup: (username: string, email: string, password: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  setAuthenticated: () => {},
  user: { username: '', id: '' },
  setUser: () => {},
  signup: async () => {},
  login: async () => {},
  logout: () => {},
})

const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false)
  const [user, setUser] = useState<UserInfo>({ username: '', id: '' })
  const router = useRouter()

  const safeLocalStorageGet = (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch (e) {
      console.error('Error accessing localStorage:', e)
      return null
    }
  }

  const safeLocalStorageSet = (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch (e) {
      console.error('Error setting localStorage:', e)
    }
  }

  const safeLocalStorageRemove = (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error('Error removing from localStorage:', e)
    }
  }

  useEffect(() => {
    const userInfo = safeLocalStorageGet('user_info')
    if (!userInfo) {
      if (router.pathname !== '/signup' && router.pathname !== '/login') {
        router.push('/login')
      }
    } else {
      try {
        const user: UserInfo = JSON.parse(userInfo)
        setUser(user)
        setAuthenticated(true)
      } catch (e) {
        console.error('Error parsing user info:', e)
        safeLocalStorageRemove('user_info')
        if (router.pathname !== '/signup' && router.pathname !== '/login') {
          router.push('/login')
        }
      }
    }
  }, [router])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // This is important for cookies if your API uses them
        mode: 'cors', // Explicitly state that we're using CORS
      })
  
      if (response.ok) {
        const userData: UserInfo = await response.json()
        setUser(userData)
        setAuthenticated(true)
        safeLocalStorageSet('user_info', JSON.stringify(userData))
        router.push('/') // Redirect to home page or dashboard after successful login
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }, [router])

  const logout = useCallback(() => {
    setUser({ username: '', id: '' })
    setAuthenticated(false)
    safeLocalStorageRemove('user_info')
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        setAuthenticated,
        user,
        setUser,
        signup: async () => {},
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContextProvider