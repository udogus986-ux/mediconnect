import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { authAPI } from '../api'

interface User {
  id: string
  name: string
  email: string
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  avatar?: string
  isOnline?: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, role: string) => Promise<void>
  logout: () => void
  loading: boolean
  updateUser: (data: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('medi_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const savedToken = localStorage.getItem('medi_token')
      if (savedToken) {
        try {
          const res = await authAPI.getMe()
          const u = res.data.user
          setUser({
            id: u._id || u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar,
            isOnline: u.isOnline,
          })
        } catch {
          localStorage.removeItem('medi_token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password })
    const { token, user } = res.data
    localStorage.setItem('medi_token', token)
    setToken(token)
    // Login sonrası getMe çağır — avatar dahil tüm bilgileri al
    try {
      const meRes = await authAPI.getMe()
      const u = meRes.data.user
      setUser({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        avatar: u.avatar,
        isOnline: u.isOnline,
      })
    } catch {
      setUser(user)
    }
  }

  const register = async (name: string, email: string, password: string, role: string) => {
    const res = await authAPI.register({ name, email, password, role })
    const { token, user } = res.data
    localStorage.setItem('medi_token', token)
    setToken(token)
    setUser(user)
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('medi_token')
    setToken(null)
    setUser(null)
  }

  // Profil güncellenince user'ı güncelle
  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}