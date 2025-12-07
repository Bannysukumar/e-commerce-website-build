"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const [isChecking, setIsChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const checkAdminAccess = async () => {
      // Allow access to login page
      if (pathname === "/admin/login") {
        setIsAuthorized(true)
        setIsChecking(false)
        return
      }

      // Check if admin is authenticated
      const adminAuthenticated = localStorage.getItem("adminAuthenticated")
      const adminUserId = localStorage.getItem("adminUserId")

      if (!adminAuthenticated || !adminUserId) {
        router.push("/admin/login")
        setIsChecking(false)
        return
      }

      // Verify user is still admin
      if (user && user.id === adminUserId) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.id))
          const userData = userDoc.data()

          if (userData?.role === "admin" || userData?.isAdmin === true) {
            setIsAuthorized(true)
          } else {
            // Clear admin session if user is no longer admin
            localStorage.removeItem("adminAuthenticated")
            localStorage.removeItem("adminUserId")
            router.push("/admin/login")
          }
        } catch (error) {
          console.error("Error checking admin status:", error)
          router.push("/admin/login")
        }
      } else if (!user) {
        // User not logged in, redirect to login
        router.push("/admin/login")
      } else {
        // User ID mismatch, clear session
        localStorage.removeItem("adminAuthenticated")
        localStorage.removeItem("adminUserId")
        router.push("/admin/login")
      }

      setIsChecking(false)
    }

    checkAdminAccess()
  }, [user, pathname, router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized && pathname !== "/admin/login") {
    return null // Will redirect
  }

  return <>{children}</>
}
