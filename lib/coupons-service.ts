import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy, onSnapshot, Timestamp, updateDoc, increment } from "firebase/firestore"
import { db } from "./firebase"

export type DiscountType = "percentage" | "fixed"

export interface Coupon {
  id: string
  code: string // Coupon code (e.g., "SWEBIRD10")
  discountType: DiscountType // "percentage" or "fixed"
  discountValue: number // Percentage (0-100) or fixed amount
  minPurchaseAmount?: number // Minimum purchase amount to use coupon
  maxDiscountAmount?: number // Maximum discount for percentage coupons
  expiryDate: Timestamp
  usageLimit: number // Total number of times coupon can be used
  usedCount: number // Number of times coupon has been used
  isActive: boolean
  description?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

const COLLECTION_NAME = "coupons"

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Coupon[]
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return []
  }
}

export function subscribeToCoupons(callback: (coupons: Coupon[]) => void) {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snapshot) => {
    const coupons = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Coupon[]
    callback(coupons)
  })
}

export async function getCouponById(id: string): Promise<Coupon | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Coupon
    }
    return null
  } catch (error) {
    console.error("Error fetching coupon:", error)
    return null
  }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  try {
    const q = query(collection(db, COLLECTION_NAME), where("code", "==", code.toUpperCase()))
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    
    const couponDoc = snapshot.docs[0]
    return {
      id: couponDoc.id,
      ...couponDoc.data(),
    } as Coupon
  } catch (error) {
    console.error("Error fetching coupon by code:", error)
    return null
  }
}

export async function validateCoupon(code: string, cartTotal: number): Promise<{ valid: boolean; coupon?: Coupon; error?: string }> {
  try {
    const coupon = await getCouponByCode(code)
    
    if (!coupon) {
      return { valid: false, error: "Coupon code not found" }
    }
    
    if (!coupon.isActive) {
      return { valid: false, error: "Coupon is not active" }
    }
    
    const now = new Date()
    const expiryDate = coupon.expiryDate?.toDate?.() || new Date(coupon.expiryDate)
    if (expiryDate < now) {
      return { valid: false, error: "Coupon has expired" }
    }
    
    if (coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: "Coupon usage limit reached" }
    }
    
    if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
      return { valid: false, error: `Minimum purchase amount of ₹${coupon.minPurchaseAmount} required` }
    }
    
    return { valid: true, coupon }
  } catch (error) {
    console.error("Error validating coupon:", error)
    return { valid: false, error: "Error validating coupon" }
  }
}

export async function applyCoupon(code: string, cartTotal: number): Promise<{ success: boolean; discount: number; error?: string }> {
  try {
    const validation = await validateCoupon(code, cartTotal)
    
    if (!validation.valid || !validation.coupon) {
      return { success: false, discount: 0, error: validation.error }
    }
    
    const coupon = validation.coupon
    let discount = 0
    
    if (coupon.discountType === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100
      if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
        discount = coupon.maxDiscountAmount
      }
    } else {
      discount = coupon.discountValue
      if (discount > cartTotal) {
        discount = cartTotal
      }
    }
    
    return { success: true, discount }
  } catch (error) {
    console.error("Error applying coupon:", error)
    return { success: false, discount: 0, error: "Error applying coupon" }
  }
}

export async function useCoupon(code: string): Promise<void> {
  try {
    const coupon = await getCouponByCode(code)
    if (!coupon) throw new Error("Coupon not found")
    
    const docRef = doc(db, COLLECTION_NAME, coupon.id)
    await updateDoc(docRef, {
      usedCount: increment(1),
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error("Error using coupon:", error)
    throw error
  }
}

export async function saveCoupon(
  coupon: Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usedCount"> & { id?: string; usedCount?: number }
): Promise<string> {
  try {
    const now = Timestamp.now()
    const couponData: any = {
      code: coupon.code.toUpperCase(),
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      expiryDate: coupon.expiryDate,
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive,
      usedCount: coupon.usedCount || 0,
      updatedAt: now,
    }

    if (coupon.minPurchaseAmount !== undefined && coupon.minPurchaseAmount !== null) {
      couponData.minPurchaseAmount = coupon.minPurchaseAmount
    }
    if (coupon.maxDiscountAmount !== undefined && coupon.maxDiscountAmount !== null) {
      couponData.maxDiscountAmount = coupon.maxDiscountAmount
    }
    if (coupon.description !== undefined && coupon.description !== null && coupon.description !== "") {
      couponData.description = coupon.description
    }

    if (coupon.id) {
      // Update existing coupon
      const docRef = doc(db, COLLECTION_NAME, coupon.id)
      const existingDoc = await getDoc(docRef)
      if (existingDoc.exists()) {
        const existingData = existingDoc.data()
        couponData.createdAt = existingData.createdAt || now
        couponData.usedCount = existingData.usedCount || 0
      } else {
        couponData.createdAt = now
      }
      await setDoc(docRef, couponData)
      return coupon.id
    } else {
      // Create new coupon
      couponData.createdAt = now
      const docRef = doc(collection(db, COLLECTION_NAME))
      await setDoc(docRef, couponData)
      return docRef.id
    }
  } catch (error) {
    console.error("Error saving coupon:", error)
    throw error
  }
}

export async function deleteCoupon(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting coupon:", error)
    throw error
  }
}
