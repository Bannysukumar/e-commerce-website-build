"use client"

import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export type Testimonial = {
  id: string
  name: string
  role: string
  image: string
  rating: number
  review: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const TESTIMONIALS_COLLECTION = "testimonials"

// Get all testimonials
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const testimonialsRef = collection(db, TESTIMONIALS_COLLECTION)
    const q = query(testimonialsRef, orderBy("order", "asc"))
    const snapshot = await getDocs(q)
    return snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          rating: data.rating || 5,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Testimonial
      })
      .filter((item) => item.isActive)
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return []
  }
}

// Create or update a testimonial
export async function saveTestimonial(
  testimonial: Omit<Testimonial, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<string> {
  try {
    const now = Timestamp.now()
    const testimonialData: any = {
      name: testimonial.name,
      role: testimonial.role,
      image: testimonial.image,
      rating: testimonial.rating || 5,
      review: testimonial.review,
      order: testimonial.order,
      isActive: testimonial.isActive,
      updatedAt: now,
    }

    if (testimonial.id) {
      // Update existing
      const testimonialRef = doc(db, TESTIMONIALS_COLLECTION, testimonial.id)
      const existing = await getDoc(testimonialRef)
      if (existing.exists()) {
        testimonialData.createdAt = existing.data().createdAt
      } else {
        testimonialData.createdAt = now
      }
      await setDoc(testimonialRef, testimonialData, { merge: true })
      return testimonial.id
    } else {
      // Create new
      testimonialData.createdAt = now
      const newRef = doc(collection(db, TESTIMONIALS_COLLECTION))
      await setDoc(newRef, testimonialData)
      return newRef.id
    }
  } catch (error) {
    console.error("Error saving testimonial:", error)
    throw error
  }
}

// Delete a testimonial
export async function deleteTestimonial(id: string): Promise<void> {
  try {
    const testimonialRef = doc(db, TESTIMONIALS_COLLECTION, id)
    await deleteDoc(testimonialRef)
  } catch (error) {
    console.error("Error deleting testimonial:", error)
    throw error
  }
}

// Subscribe to testimonials changes (real-time)
export function subscribeToTestimonials(callback: (testimonials: Testimonial[]) => void): () => void {
  const testimonialsRef = collection(db, TESTIMONIALS_COLLECTION)
  const q = query(testimonialsRef, orderBy("order", "asc"))

  return onSnapshot(q, (snapshot) => {
    const testimonials = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          rating: data.rating || 5,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Testimonial
      })
      .filter((item) => item.isActive)
    callback(testimonials)
  })
}
