"use client"

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export type CarouselSlide = {
  id: string
  imageUrl: string
  tagline: string
  title: string
  categoryLink: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const CAROUSEL_COLLECTION = "carouselSlides"

// Get all carousel slides
export async function getCarouselSlides(): Promise<CarouselSlide[]> {
  try {
    const slidesRef = collection(db, CAROUSEL_COLLECTION)
    const q = query(slidesRef, orderBy("order", "asc"))
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CarouselSlide
      })
      .filter((slide) => slide.isActive)
  } catch (error) {
    console.error("Error fetching carousel slides:", error)
    return []
  }
}

// Get a single slide by ID
export async function getCarouselSlideById(id: string): Promise<CarouselSlide | null> {
  try {
    const slideRef = doc(db, CAROUSEL_COLLECTION, id)
    const slideSnap = await getDoc(slideRef)
    if (slideSnap.exists()) {
      const data = slideSnap.data()
      return {
        id: slideSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as CarouselSlide
    }
    return null
  } catch (error) {
    console.error("Error fetching carousel slide:", error)
    return null
  }
}

// Create or update a carousel slide
export async function saveCarouselSlide(slide: Omit<CarouselSlide, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<string> {
  try {
    const now = Timestamp.now()
    const slideData: any = {
      imageUrl: slide.imageUrl,
      tagline: slide.tagline,
      title: slide.title,
      categoryLink: slide.categoryLink,
      order: slide.order,
      isActive: slide.isActive,
      updatedAt: now,
    }

    if (slide.id) {
      // Update existing slide
      const slideRef = doc(db, CAROUSEL_COLLECTION, slide.id)
      const existingSlide = await getDoc(slideRef)
      if (existingSlide.exists()) {
        slideData.createdAt = existingSlide.data().createdAt
      } else {
        slideData.createdAt = now
      }
      await setDoc(slideRef, slideData, { merge: true })
      return slide.id
    } else {
      // Create new slide
      slideData.createdAt = now
      const newSlideRef = doc(collection(db, CAROUSEL_COLLECTION))
      await setDoc(newSlideRef, slideData)
      return newSlideRef.id
    }
  } catch (error) {
    console.error("Error saving carousel slide:", error)
    throw error
  }
}

// Delete a carousel slide
export async function deleteCarouselSlide(id: string): Promise<void> {
  try {
    const slideRef = doc(db, CAROUSEL_COLLECTION, id)
    await deleteDoc(slideRef)
  } catch (error) {
    console.error("Error deleting carousel slide:", error)
    throw error
  }
}

// Subscribe to carousel slides changes (real-time)
export function subscribeToCarouselSlides(callback: (slides: CarouselSlide[]) => void): () => void {
  const slidesRef = collection(db, CAROUSEL_COLLECTION)
  const q = query(slidesRef, orderBy("order", "asc"))

  return onSnapshot(q, (snapshot) => {
    const slides = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as CarouselSlide
      })
      .filter((slide) => slide.isActive)
    callback(slides)
  })
}
