"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type User = {
  id: string
  email: string
  name: string
  createdAt: Date
}

type AuthContextType = {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setMounted(true)
  }, [])

  const login = async (email: string, password: string) => {
    // Simulate API call
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: email.split("@")[0],
      createdAt: new Date(),
    }
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  const signup = async (email: string, password: string, name: string) => {
    // Simulate API call
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      createdAt: new Date(),
    }
    setUser(newUser)
    localStorage.setItem("user", JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
  }

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, signup, logout }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return default values during SSR/prerendering
    return {
      user: null,
      isLoggedIn: false,
      login: async () => {},
      signup: async () => {},
      logout: () => {},
    }
  }
  return context
}
