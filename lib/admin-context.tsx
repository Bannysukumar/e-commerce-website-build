"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type AdminContextType = {
  isAdmin: boolean
  setIsAdmin: (value: boolean) => void
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  // In a real app, this would check if user is authenticated as admin
  const [isAdmin, setIsAdmin] = useState(true)

  return <AdminContext.Provider value={{ isAdmin, setIsAdmin }}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider")
  }
  return context
}
