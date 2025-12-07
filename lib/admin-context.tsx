"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type AdminContextType = {
  isAdmin: boolean
  setIsAdmin: (value: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Check if admin is authenticated from localStorage
    const adminAuthenticated = localStorage.getItem("adminAuthenticated")
    setIsAdmin(adminAuthenticated === "true")
  }, [])

  return <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
