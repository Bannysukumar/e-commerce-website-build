"use client"

import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore"
import { db } from "./firebase"
import { updateProfile } from "firebase/auth"
import { auth } from "./firebase"

export type Address = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  default: boolean
}

// Update user profile
export async function updateUserProfile(userId: string, name: string): Promise<void> {
  try {
    // Update in Firestore
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      name,
      updatedAt: new Date(),
    })

    // Update Firebase Auth display name
    const currentUser = auth.currentUser
    if (currentUser && currentUser.uid === userId) {
      await updateProfile(currentUser, { displayName: name })
    }
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Get user addresses
export async function getUserAddresses(userId: string): Promise<Address[]> {
  try {
    const userRef = doc(db, "users", userId)
    const snapshot = await getDoc(userRef)
    
    if (!snapshot.exists()) {
      return []
    }

    const userData = snapshot.data()
    return userData.addresses || []
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return []
  }
}

// Subscribe to user addresses (real-time)
export function subscribeToUserAddresses(userId: string, callback: (addresses: Address[]) => void): () => void {
  const userRef = doc(db, "users", userId)
  
  return onSnapshot(userRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const userData = docSnapshot.data()
      callback(userData.addresses || [])
    } else {
      callback([])
    }
  })
}

// Add address
export async function addAddress(userId: string, address: Omit<Address, "id">): Promise<string> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    let addresses: Address[] = []
    if (userDoc.exists()) {
      addresses = userDoc.data().addresses || []
    }

    // If this is the first address or marked as default, set it as default
    if (address.default || addresses.length === 0) {
      addresses = addresses.map((addr) => ({ ...addr, default: false }))
    }

    const newAddress: Address = {
      id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...address,
      default: address.default || addresses.length === 0,
    }

    addresses.push(newAddress)

    await setDoc(userRef, { addresses }, { merge: true })
    return newAddress.id
  } catch (error) {
    console.error("Error adding address:", error)
    throw error
  }
}

// Update address
export async function updateAddress(userId: string, addressId: string, address: Partial<Address>): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    let addresses: Address[] = userDoc.data().addresses || []
    
    // If setting as default, unset others
    if (address.default) {
      addresses = addresses.map((addr) => 
        addr.id === addressId ? { ...addr, ...address } : { ...addr, default: false }
      )
    } else {
      addresses = addresses.map((addr) => 
        addr.id === addressId ? { ...addr, ...address } : addr
      )
    }

    await setDoc(userRef, { addresses }, { merge: true })
  } catch (error) {
    console.error("Error updating address:", error)
    throw error
  }
}

// Delete address
export async function deleteAddress(userId: string, addressId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      throw new Error("User not found")
    }

    const addresses: Address[] = (userDoc.data().addresses || []).filter(
      (addr: Address) => addr.id !== addressId
    )

    await setDoc(userRef, { addresses }, { merge: true })
  } catch (error) {
    console.error("Error deleting address:", error)
    throw error
  }
}
