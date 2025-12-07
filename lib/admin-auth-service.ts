import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "./firebase"

// Set a user as admin
export async function setUserAsAdmin(userId: string): Promise<void> {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, {
      role: "admin",
      isAdmin: true,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error("Error setting user as admin:", error)
    throw error
  }
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, "users", userId))
    if (!userDoc.exists()) return false
    
    const userData = userDoc.data()
    return userData?.role === "admin" || userData?.isAdmin === true
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// Create admin user (for initial setup)
export async function createAdminUser(email: string, password: string, name: string): Promise<string> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update display name
    await updateProfile(user, { displayName: name })

    // Create user document with admin role
    await setDoc(doc(db, "users", user.uid), {
      email,
      name,
      role: "admin",
      isAdmin: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return user.uid
  } catch (error) {
    console.error("Error creating admin user:", error)
    throw error
  }
}
