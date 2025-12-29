"use client"

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export type TrendingProduct = {
  id: string
  productId: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TRENDING_PRODUCTS_COLLECTION = "trendingProducts"

// Get all trending products
export async function getTrendingProducts(): Promise<TrendingProduct[]> {
  try {
    const trendingRef = collection(db, TRENDING_PRODUCTS_COLLECTION)
    const q = query(trendingRef, orderBy("order", "asc"))
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as TrendingProduct
      })
      .filter((item) => item.isActive)
  } catch (error) {
    console.error("Error fetching trending products:", error)
    return []
  }
}

// Create or update a trending product
export async function saveTrendingProduct(
  trending: Omit<TrendingProduct, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<string> {
  try {
    const now = Timestamp.now()
    const trendingData: any = {
      productId: trending.productId,
      order: trending.order,
      isActive: trending.isActive,
      updatedAt: now,
    }

    if (trending.id) {
      // Update existing
      const trendingRef = doc(db, TRENDING_PRODUCTS_COLLECTION, trending.id)
      const existing = await getDoc(trendingRef)
      if (existing.exists()) {
        trendingData.createdAt = existing.data().createdAt
      } else {
        trendingData.createdAt = now
      }
      await setDoc(trendingRef, trendingData, { merge: true })
      return trending.id
    } else {
      // Create new
      trendingData.createdAt = now
      const newRef = doc(collection(db, TRENDING_PRODUCTS_COLLECTION))
      await setDoc(newRef, trendingData)
      return newRef.id
    }
  } catch (error) {
    console.error("Error saving trending product:", error)
    throw error
  }
}

// Delete a trending product
export async function deleteTrendingProduct(id: string): Promise<void> {
  try {
    const trendingRef = doc(db, TRENDING_PRODUCTS_COLLECTION, id)
    await deleteDoc(trendingRef)
  } catch (error) {
    console.error("Error deleting trending product:", error)
    throw error
  }
}

// Subscribe to trending products changes (real-time)
export function subscribeToTrendingProducts(callback: (products: TrendingProduct[]) => void): () => void {
  const trendingRef = collection(db, TRENDING_PRODUCTS_COLLECTION)
  const q = query(trendingRef, orderBy("order", "asc"))

  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as TrendingProduct
      })
      .filter((item) => item.isActive)
    callback(products)
  })
}

