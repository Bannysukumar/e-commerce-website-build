import { collection, doc, getDocs, setDoc, query, where, onSnapshot, Timestamp, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface NewsletterSubscriber {
  id: string
  email: string
  subscribedAt: Timestamp
  isActive: boolean
  unsubscribedAt?: Timestamp
}

export interface Notification {
  id: string
  type: "new_product" | "new_offer" | "general"
  title: string
  message: string
  link?: string
  sentAt: Timestamp
  sentTo: number // Number of subscribers who received it
}

const SUBSCRIBERS_COLLECTION = "newsletterSubscribers"
const NOTIFICATIONS_COLLECTION = "notifications"

// Subscribe a user to the newsletter
export async function subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    // Validate email
    if (!email || !email.includes("@")) {
      return { success: false, message: "Please enter a valid email address" }
    }

    // Check if email already exists
    const q = query(collection(db, SUBSCRIBERS_COLLECTION), where("email", "==", email.toLowerCase().trim()))
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      const existingDoc = snapshot.docs[0]
      const existingData = existingDoc.data() as NewsletterSubscriber

      // If already subscribed and active, return success
      if (existingData.isActive) {
        return { success: true, message: "You are already subscribed!" }
      }

      // If unsubscribed, reactivate
      await setDoc(
        doc(db, SUBSCRIBERS_COLLECTION, existingDoc.id),
        {
          isActive: true,
          subscribedAt: Timestamp.now(),
          unsubscribedAt: null,
        },
        { merge: true }
      )
      return { success: true, message: "Successfully resubscribed to our newsletter!" }
    }

    // Create new subscription
    const docRef = doc(collection(db, SUBSCRIBERS_COLLECTION))
    await setDoc(docRef, {
      email: email.toLowerCase().trim(),
      subscribedAt: Timestamp.now(),
      isActive: true,
    })

    return { success: true, message: "Successfully subscribed to our newsletter!" }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return { success: false, message: "Failed to subscribe. Please try again later." }
  }
}

// Get all active subscribers
export async function getActiveSubscribers(): Promise<NewsletterSubscriber[]> {
  try {
    const q = query(collection(db, SUBSCRIBERS_COLLECTION), where("isActive", "==", true))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as NewsletterSubscriber[]
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return []
  }
}

// Subscribe to active subscribers (real-time)
export function subscribeToSubscribers(callback: (subscribers: NewsletterSubscriber[]) => void) {
  const q = query(collection(db, SUBSCRIBERS_COLLECTION), where("isActive", "==", true))
  return onSnapshot(q, (snapshot) => {
    const subscribers = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as NewsletterSubscriber[]
    callback(subscribers)
  })
}

// Unsubscribe a user
export async function unsubscribeFromNewsletter(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const q = query(collection(db, SUBSCRIBERS_COLLECTION), where("email", "==", email.toLowerCase().trim()))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return { success: false, message: "Email not found in our subscription list" }
    }

    const docRef = doc(db, SUBSCRIBERS_COLLECTION, snapshot.docs[0].id)
    await setDoc(
      docRef,
      {
        isActive: false,
        unsubscribedAt: Timestamp.now(),
      },
      { merge: true }
    )

    return { success: true, message: "Successfully unsubscribed from our newsletter" }
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error)
    return { success: false, message: "Failed to unsubscribe. Please try again later." }
  }
}

// Create a notification record (for tracking sent notifications)
export async function createNotification(
  notification: Omit<Notification, "id" | "sentAt" | "sentTo">
): Promise<string> {
  try {
    const subscribers = await getActiveSubscribers()
    const docRef = doc(collection(db, NOTIFICATIONS_COLLECTION))
    await setDoc(docRef, {
      ...notification,
      sentAt: Timestamp.now(),
      sentTo: subscribers.length,
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Get all notifications
export async function getNotifications(): Promise<Notification[]> {
  try {
    const snapshot = await getDocs(collection(db, NOTIFICATIONS_COLLECTION))
    return snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => b.sentAt.toMillis() - a.sentAt.toMillis()) as Notification[]
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
}

// Subscribe to notifications (real-time)
export function subscribeToNotifications(callback: (notifications: Notification[]) => void) {
  return onSnapshot(collection(db, NOTIFICATIONS_COLLECTION), (snapshot) => {
    const notifications = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .sort((a, b) => b.sentAt.toMillis() - a.sentAt.toMillis()) as Notification[]
    callback(notifications)
  })
}
