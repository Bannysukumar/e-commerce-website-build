"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { doc, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "./auth-context"

type WishlistContextType = {
  items: string[]
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const { user, isLoggedIn } = useAuth()

  // Get or create guest wishlist ID
  const getGuestWishlistId = () => {
    let guestWishlistId = localStorage.getItem("guestWishlistId")
    if (!guestWishlistId) {
      guestWishlistId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("guestWishlistId", guestWishlistId)
    }
    return guestWishlistId
  }

  // Load wishlist from Firestore
  useEffect(() => {
    const wishlistId = isLoggedIn && user ? user.id : getGuestWishlistId()
    const wishlistRef = doc(db, "wishlists", wishlistId)
    const unsubscribe = onSnapshot(wishlistRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data()
        setItems(data.items || [])
      } else {
        setItems([])
    }
    setMounted(true)
    })
    return () => unsubscribe()
  }, [isLoggedIn, user])

  // Save wishlist to Firestore
  useEffect(() => {
    if (mounted) {
      const wishlistId = isLoggedIn && user ? user.id : getGuestWishlistId()
      const wishlistRef = doc(db, "wishlists", wishlistId)
      setDoc(wishlistRef, { items, userId: user?.id || null }, { merge: true }).catch((error) => {
        console.error("Error saving wishlist to Firestore:", error)
      })
    }
  }, [items, mounted, isLoggedIn, user])

  const addToWishlist = (productId: string) => {
    setItems((prev) => (prev.includes(productId) ? prev : [...prev, productId]))
  }

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((id) => id !== productId))
  }

  const isInWishlist = (productId: string) => {
    return items.includes(productId)
  }

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
