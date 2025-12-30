"use client"

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export type PromotionalBanner = {
  id: string
  text: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BANNERS_COLLECTION = "promotionalBanners"

// Get all promotional banners
export async function getPromotionalBanners(): Promise<PromotionalBanner[]> {
  try {
    const bannersRef = collection(db, BANNERS_COLLECTION)
    const q = query(bannersRef, orderBy("order", "asc"))
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as PromotionalBanner
      })
      .filter((banner) => banner.isActive)
  } catch (error) {
    console.error("Error fetching promotional banners:", error)
    return []
  }
}

// Get all banners including inactive (for admin)
export async function getAllPromotionalBanners(): Promise<PromotionalBanner[]> {
  try {
    const bannersRef = collection(db, BANNERS_COLLECTION)
    const q = query(bannersRef, orderBy("order", "asc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as PromotionalBanner
    })
  } catch (error) {
    console.error("Error fetching all promotional banners:", error)
    return []
  }
}

// Get a single banner by ID
export async function getPromotionalBannerById(id: string): Promise<PromotionalBanner | null> {
  try {
    const bannerRef = doc(db, BANNERS_COLLECTION, id)
    const bannerSnap = await getDoc(bannerRef)
    if (bannerSnap.exists()) {
      const data = bannerSnap.data()
      return {
        id: bannerSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as PromotionalBanner
    }
    return null
  } catch (error) {
    console.error("Error fetching promotional banner:", error)
    return null
  }
}

// Create or update a promotional banner
export async function savePromotionalBanner(
  banner: Omit<PromotionalBanner, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<string> {
  try {
    const now = Timestamp.now()
    const bannerData: any = {
      text: banner.text,
      order: banner.order,
      isActive: banner.isActive,
      updatedAt: now,
    }

    if (banner.id) {
      // Update existing banner
      const bannerRef = doc(db, BANNERS_COLLECTION, banner.id)
      const existingBanner = await getDoc(bannerRef)
      if (existingBanner.exists()) {
        bannerData.createdAt = existingBanner.data().createdAt
      } else {
        bannerData.createdAt = now
      }
      await setDoc(bannerRef, bannerData, { merge: true })
      return banner.id
    } else {
      // Create new banner
      bannerData.createdAt = now
      const newBannerRef = doc(collection(db, BANNERS_COLLECTION))
      await setDoc(newBannerRef, bannerData)
      return newBannerRef.id
    }
  } catch (error) {
    console.error("Error saving promotional banner:", error)
    throw error
  }
}

// Delete a promotional banner
export async function deletePromotionalBanner(id: string): Promise<void> {
  try {
    const bannerRef = doc(db, BANNERS_COLLECTION, id)
    await deleteDoc(bannerRef)
  } catch (error) {
    console.error("Error deleting promotional banner:", error)
    throw error
  }
}

// Subscribe to promotional banners changes (real-time)
export function subscribeToPromotionalBanners(callback: (banners: PromotionalBanner[]) => void): () => void {
  const bannersRef = collection(db, BANNERS_COLLECTION)
  const q = query(bannersRef, orderBy("order", "asc"))

  return onSnapshot(q, (snapshot) => {
    const banners = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as PromotionalBanner
      })
      .filter((banner) => banner.isActive)
    callback(banners)
  })
}

// Subscribe to all banners including inactive (for admin)
export function subscribeToAllPromotionalBanners(callback: (banners: PromotionalBanner[]) => void): () => void {
  const bannersRef = collection(db, BANNERS_COLLECTION)
  const q = query(bannersRef, orderBy("order", "asc"))

  return onSnapshot(q, (snapshot) => {
    const banners = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as PromotionalBanner
    })
    callback(banners)
  })
}

