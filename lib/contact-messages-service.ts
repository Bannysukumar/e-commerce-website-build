import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy, onSnapshot, Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: "unread" | "read" | "replied"
  createdAt: Timestamp
  updatedAt: Timestamp
}

const COLLECTION_NAME = "contactMessages"

export async function saveContactMessage(
  message: Omit<ContactMessage, "id" | "status" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const now = Timestamp.now()
    const messageData = {
      name: message.name,
      email: message.email,
      phone: message.phone || "",
      subject: message.subject,
      message: message.message,
      status: "unread" as const,
      createdAt: now,
      updatedAt: now,
    }

    const docRef = doc(collection(db, COLLECTION_NAME))
    await setDoc(docRef, messageData)
    return docRef.id
  } catch (error) {
    console.error("Error saving contact message:", error)
    throw error
  }
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ContactMessage[]
  } catch (error) {
    console.error("Error fetching contact messages:", error)
    return []
  }
}

export function subscribeToContactMessages(callback: (messages: ContactMessage[]) => void) {
  const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ContactMessage[]
    callback(messages)
  })
}

export async function updateMessageStatus(id: string, status: "unread" | "read" | "replied"): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await setDoc(
      docRef,
      {
        status,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    )
  } catch (error) {
    console.error("Error updating message status:", error)
    throw error
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION_NAME, id)
    await deleteDoc(docRef)
  } catch (error) {
    console.error("Error deleting contact message:", error)
    throw error
  }
}
