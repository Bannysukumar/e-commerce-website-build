"use client"

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export type FeaturedProduct = {
  id: string
  productId: string
  tagline?: string
  videoUrl?: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const FEATURED_PRODUCTS_COLLECTION = "featuredProducts"

// Get all featured products
export async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const featuredRef = collection(db, FEATURED_PRODUCTS_COLLECTION)
    const q = query(featuredRef, orderBy("order", "asc"))
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as FeaturedProduct
      })
      .filter((item) => item.isActive)
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

// Create or update a featured product
export async function saveFeaturedProduct(
  featured: Omit<FeaturedProduct, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<string> {
  try {
    const now = Timestamp.now()
    const featuredData: any = {
      productId: featured.productId,
      tagline: featured.tagline || "",
      videoUrl: featured.videoUrl || "",
      order: featured.order,
      isActive: featured.isActive,
      updatedAt: now,
    }

    if (featured.id) {
      // Update existing
      const featuredRef = doc(db, FEATURED_PRODUCTS_COLLECTION, featured.id)
      const existing = await getDoc(featuredRef)
      if (existing.exists()) {
        featuredData.createdAt = existing.data().createdAt
      } else {
        featuredData.createdAt = now
      }
      await setDoc(featuredRef, featuredData, { merge: true })
      return featured.id
    } else {
      // Create new
      featuredData.createdAt = now
      const newRef = doc(collection(db, FEATURED_PRODUCTS_COLLECTION))
      await setDoc(newRef, featuredData)
      return newRef.id
    }
  } catch (error) {
    console.error("Error saving featured product:", error)
    throw error
  }
}

// Delete a featured product
export async function deleteFeaturedProduct(id: string): Promise<void> {
  try {
    const featuredRef = doc(db, FEATURED_PRODUCTS_COLLECTION, id)
    await deleteDoc(featuredRef)
  } catch (error) {
    console.error("Error deleting featured product:", error)
    throw error
  }
}

// Subscribe to featured products changes (real-time)
export function subscribeToFeaturedProducts(callback: (products: FeaturedProduct[]) => void): () => void {
  const featuredRef = collection(db, FEATURED_PRODUCTS_COLLECTION)
  const q = query(featuredRef, orderBy("order", "asc"))

  return onSnapshot(q, (snapshot) => {
    const products = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as FeaturedProduct
      })
      .filter((item) => item.isActive)
    callback(products)
  })
}
