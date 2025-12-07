"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"
import { useAuth } from "./auth-context"
import type { CartItem } from "./types"

type CartContextType = {
  items: CartItem[]
  addToCart: (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)
  const { user, isLoggedIn } = useAuth()

  // Get or create guest cart ID
  const getGuestCartId = () => {
    let guestCartId = localStorage.getItem("guestCartId")
    if (!guestCartId) {
      guestCartId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("guestCartId", guestCartId)
    }
    return guestCartId
  }

  // Load cart from Firestore
  useEffect(() => {
    const cartId = isLoggedIn && user ? user.id : getGuestCartId()
    const cartRef = doc(db, "carts", cartId)
    const unsubscribe = onSnapshot(cartRef, (docSnapshot) => {
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

  // Save cart to Firestore
  useEffect(() => {
    if (mounted) {
      const cartId = isLoggedIn && user ? user.id : getGuestCartId()
      const cartRef = doc(db, "carts", cartId)
      
      // Filter out undefined values from cart items
      const sanitizedItems = items.map((item) => {
        const sanitized: any = {
          productId: item.productId,
          quantity: item.quantity,
        }
        if (item.selectedSize !== undefined && item.selectedSize !== null) {
          sanitized.selectedSize = item.selectedSize
        }
        if (item.selectedColor !== undefined && item.selectedColor !== null) {
          sanitized.selectedColor = item.selectedColor
        }
        return sanitized
      })
      
      const cartData: any = {
        items: sanitizedItems,
      }
      if (user?.id) {
        cartData.userId = user.id
      }
      
      setDoc(cartRef, cartData, { merge: true }).catch((error) => {
        console.error("Error saving cart to Firestore:", error)
      })
    }
  }, [items, mounted, isLoggedIn, user])

  const addToCart = (productId: string, quantity: number, selectedSize?: string, selectedColor?: string) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => 
          item.productId === productId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
      )
      if (existingItem) {
        return prevItems.map((item) =>
          item.productId === productId && 
          item.selectedSize === selectedSize && 
          item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...prevItems, { productId, quantity, selectedSize, selectedColor }]
    })
  }

  const removeFromCart = (productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
    } else {
      setItems((prevItems) => prevItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const cartCount = items.reduce((total, item) => total + item.quantity, 0)
  const cartTotal = 0 // Will be calculated by components

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
