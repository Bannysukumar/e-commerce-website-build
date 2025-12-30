"use client"

import { collection, doc, getDoc, getDocs, setDoc, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"
import type { CartItem } from "./types"

export type Order = {
  id: string
  orderNumber: string // User-friendly order ID (e.g., ORD-2024-123456)
  userId: string | null
  items: CartItem[]
  shippingInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    address: string
    city: string
    state: string
    zipCode: string
  }
  paymentInfo: {
    razorpayOrderId?: string
    razorpayPaymentId?: string
    razorpaySignature?: string
    paymentMethod?: string
    paymentStatus?: string
    // Legacy fields for backward compatibility
    cardName?: string
    cardNumber?: string
    cardExpiry?: string
    cardCVC?: string
  }
  subtotal: number
  shipping: number
  tax: number
  total: number
  couponCode?: string | null
  discount?: number
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
  createdAt: Date
  updatedAt: Date
}

const ORDERS_COLLECTION = "orders"

// Generate unique order number
function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const randomNum = Math.floor(100000 + Math.random() * 900000) // 6-digit random number
  return `ORD-${year}-${randomNum}`
}

// Create a new order
export async function createOrder(order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">): Promise<{ id: string; orderNumber: string }> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION)
    const newOrderRef = doc(ordersRef)
    const orderNumber = generateOrderNumber()
    const orderData = {
      ...order,
      orderNumber,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }
    await setDoc(newOrderRef, orderData)
    return { id: newOrderRef.id, orderNumber }
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

// Get order by ID or Order Number
export async function getOrderById(idOrOrderNumber: string): Promise<Order | null> {
  try {
    // Try to get by document ID first
    const orderRef = doc(db, ORDERS_COLLECTION, idOrOrderNumber)
    const orderSnap = await getDoc(orderRef)
    if (orderSnap.exists()) {
      const data = orderSnap.data()
      return {
        id: orderSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order
    }
    
    // If not found by ID, try to find by orderNumber
    const ordersSnapshot = await getDocs(collection(db, ORDERS_COLLECTION))
    const orderDoc = ordersSnapshot.docs.find(
      (doc) => doc.data().orderNumber === idOrOrderNumber || doc.data().orderNumber?.toUpperCase() === idOrOrderNumber.toUpperCase()
    )
    
    if (orderDoc) {
      const data = orderDoc.data()
      return {
        id: orderDoc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order
    }
    
    return null
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}

// Get orders by user ID
export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION)
    // Query without orderBy to avoid index requirement, then sort in memory
    const q = query(ordersRef, where("userId", "==", userId))
    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order
    })
    // Sort by createdAt descending in memory
    return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  } catch (error) {
    console.error("Error fetching orders:", error)
    return []
  }
}

// Get all orders (for admin)
export async function getAllOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION)
    const q = query(ordersRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order
    })
  } catch (error) {
    console.error("Error fetching all orders:", error)
    return []
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    await setDoc(orderRef, { status, updatedAt: Timestamp.now() }, { merge: true })
  } catch (error) {
    console.error("Error updating order status:", error)
    throw error
  }
}

// Subscribe to orders by user ID (real-time)
export function subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION)
  // Query without orderBy to avoid index requirement, then sort in memory
  const q = query(ordersRef, where("userId", "==", userId))
  
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Order
      })
      // Sort by createdAt descending in memory
      orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      callback(orders)
    },
    (error) => {
      // Handle index error gracefully
      if (error.code === "failed-precondition") {
        console.warn("Firestore index required. Fetching without orderBy and sorting in memory.")
        // Fallback: fetch without orderBy
        getOrdersByUserId(userId).then(callback).catch(() => callback([]))
      } else {
        console.error("Error in orders subscription:", error)
        callback([])
      }
    }
  )
}

// Subscribe to all orders (for admin, real-time)
export function subscribeToAllOrders(callback: (orders: Order[]) => void): () => void {
  const ordersRef = collection(db, ORDERS_COLLECTION)
  const q = query(ordersRef, orderBy("createdAt", "desc"))
  
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Order
    })
    callback(orders)
  })
}
