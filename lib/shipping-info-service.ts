"use client"

import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export type ShippingInfo = {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
}

// Save shipping information for a user
export async function saveShippingInfo(userId: string, shippingInfo: ShippingInfo): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await setDoc(
      userRef,
      {
        lastShippingInfo: shippingInfo,
        lastShippingInfoUpdated: Timestamp.now(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error("Error saving shipping info:", error)
    throw error
  }
}

// Get saved shipping information for a user
export async function getShippingInfo(userId: string): Promise<ShippingInfo | null> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      const userData = userDoc.data()
      return userData.lastShippingInfo || null
    }
    
    return null
  } catch (error) {
    console.error("Error fetching shipping info:", error)
    return null
  }
}

