"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem("wishlist")
    if (savedWishlist) {
      setItems(JSON.parse(savedWishlist))
    }
    setMounted(true)
  }, [])

  // Save wishlist to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("wishlist", JSON.stringify(items))
    }
  }, [items, mounted])

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
