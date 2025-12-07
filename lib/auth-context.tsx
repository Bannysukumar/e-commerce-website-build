"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "./firebase"
import type { User } from "./types"

type AuthContextType = {
  user: User | null
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: userData.name || firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
              createdAt: userData.createdAt?.toDate() || new Date(),
            })
          } else {
            // If user document doesn't exist, create it
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
              createdAt: new Date(),
            }
            await setDoc(doc(db, "users", firebaseUser.uid), {
              email: newUser.email,
              name: newUser.name,
              createdAt: new Date(),
            })
            setUser(newUser)
          }
        } catch (error: any) {
          // Only log non-offline errors
          if (error?.code !== "unavailable" && error?.message?.includes("offline") === false) {
            console.error("Error fetching user data:", error)
          }
          // Fallback to basic user info from Firebase Auth
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "",
            createdAt: new Date(),
          })
        }
      } else {
        setUser(null)
    }
    setMounted(true)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
    // User state will be updated by onAuthStateChanged
  }

  const signup = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    // Update display name
    await updateProfile(firebaseUser, { displayName: name })

    // Create user document in Firestore
    await setDoc(doc(db, "users", firebaseUser.uid), {
      email,
      name,
      createdAt: new Date(),
    })

    // User state will be updated by onAuthStateChanged
  }

  const logout = async () => {
    await signOut(auth)
    // User state will be updated by onAuthStateChanged
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
      logout: async () => {},
    }
  }
  return context
}
