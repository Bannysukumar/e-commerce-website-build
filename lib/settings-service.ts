"use client"

import { doc, getDoc, setDoc } from "firebase/firestore"
import { db } from "./firebase"

const SETTINGS_DOC_ID = "admin_settings"

export type AdminSettings = {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  currency: string
  taxRate: string
  shippingCost: string
  freeShippingThreshold: string
  notificationsEmail: boolean
  notificationsSms: boolean
  notificationsOrders: boolean
  notificationsProducts: boolean
  twoFactorAuth: boolean
  passwordMinLength: string
  sessionTimeout: string
  razorpayKeyId: string
  razorpayKeySecret: string
  mailerServiceProvider: string
}

const defaultSettings: AdminSettings = {
  storeName: "swebirdshop",
  storeEmail: "admin@swebirdshop.com",
  storePhone: "+1 (555) 123-4567",
  storeAddress: "123 Main St, City, State 12345",
  currency: "USD",
  taxRate: "8.5",
  shippingCost: "9.99",
  freeShippingThreshold: "50",
  notificationsEmail: true,
  notificationsSms: false,
  notificationsOrders: true,
  notificationsProducts: true,
  twoFactorAuth: false,
  passwordMinLength: "8",
  sessionTimeout: "30",
  razorpayKeyId: "rzp_live_Rxsf6lkhhXIzQr",
  razorpayKeySecret: "sN8ke5Kuu5ae3vBoMNZWTIMs",
  mailerServiceProvider: "sendgrid",
}

// Get admin settings
export async function getAdminSettings(): Promise<AdminSettings> {
  try {
    const settingsRef = doc(db, "settings", SETTINGS_DOC_ID)
    const settingsSnap = await getDoc(settingsRef)
    if (settingsSnap.exists()) {
      return { ...defaultSettings, ...settingsSnap.data() } as AdminSettings
    }
    return defaultSettings
  } catch (error) {
    console.error("Error fetching settings:", error)
    return defaultSettings
  }
}

// Save admin settings
export async function saveAdminSettings(settings: AdminSettings): Promise<void> {
  try {
    const settingsRef = doc(db, "settings", SETTINGS_DOC_ID)
    await setDoc(settingsRef, settings, { merge: true })
  } catch (error) {
    console.error("Error saving settings:", error)
    throw error
  }
}
