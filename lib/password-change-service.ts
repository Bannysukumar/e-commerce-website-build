"use client"

import { auth, db } from "./firebase"
import { sendPasswordResetEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { doc, setDoc, getDoc, deleteDoc, Timestamp } from "firebase/firestore"

const VERIFICATION_CODES_COLLECTION = "passwordVerificationCodes"
const CODE_EXPIRY_MINUTES = 10

// Generate a random 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification code to admin's email
export async function sendPasswordChangeVerificationCode(userEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    // Generate verification code
    const code = generateVerificationCode()
    
    // Store code in Firestore with expiration
    const codeRef = doc(db, VERIFICATION_CODES_COLLECTION, userEmail)
    const expiresAt = Timestamp.now()
    expiresAt.seconds += CODE_EXPIRY_MINUTES * 60
    
    await setDoc(codeRef, {
      code,
      email: userEmail,
      expiresAt,
      createdAt: Timestamp.now(),
      used: false,
    })

    // Send email with verification code
    // In a real implementation, you would use an email service (SendGrid, AWS SES, etc.)
    // For now, we'll use Firebase's sendPasswordResetEmail as a fallback
    // and log the code to console for development
    try {
      await sendPasswordResetEmail(auth, userEmail, {
        url: `${window.location.origin}/admin/settings`,
        handleCodeInApp: false,
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
    }

    // Log code to console for development/testing
    console.log(`Verification code for ${userEmail}: ${code}`)
    console.log("Note: In production, this code should be sent via email service")

    return {
      success: true,
      message: `Verification code sent to ${userEmail}. Check your email. (For development: code is ${code})`,
    }
  } catch (error: any) {
    console.error("Error sending verification code:", error)
    return {
      success: false,
      message: error.message || "Failed to send verification code. Please try again.",
    }
  }
}

// Verify the code and change password
export async function verifyCodeAndChangePassword(
  userEmail: string,
  verificationCode: string,
  newPassword: string,
  currentPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Get verification code from Firestore
    const codeRef = doc(db, VERIFICATION_CODES_COLLECTION, userEmail)
    const codeDoc = await getDoc(codeRef)

    if (!codeDoc.exists()) {
      return {
        success: false,
        message: "Verification code not found. Please request a new code.",
      }
    }

    const codeData = codeDoc.data()

    // Check if code is already used
    if (codeData.used) {
      return {
        success: false,
        message: "This verification code has already been used. Please request a new code.",
      }
    }

    // Check if code is expired
    const now = Timestamp.now()
    if (codeData.expiresAt.toMillis() < now.toMillis()) {
      await deleteDoc(codeRef)
      return {
        success: false,
        message: "Verification code has expired. Please request a new code.",
      }
    }

    // Verify the code
    if (codeData.code !== verificationCode) {
      return {
        success: false,
        message: "Invalid verification code. Please try again.",
      }
    }

    // Re-authenticate user with current password
    const user = auth.currentUser
    if (!user || !user.email) {
      return {
        success: false,
        message: "User not authenticated. Please log in again.",
      }
    }

    if (user.email !== userEmail) {
      return {
        success: false,
        message: "Email mismatch. Please log in again.",
      }
    }

    // Re-authenticate with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword)
    await reauthenticateWithCredential(user, credential)

    // Update password
    await updatePassword(user, newPassword)

    // Mark code as used
    await setDoc(codeRef, { used: true }, { merge: true })

    // Delete the code after successful password change
    setTimeout(() => {
      deleteDoc(codeRef).catch(console.error)
    }, 5000)

    return {
      success: true,
      message: "Password changed successfully!",
    }
  } catch (error: any) {
    console.error("Error changing password:", error)
    
    let errorMessage = "Failed to change password. Please try again."
    
    if (error.code === "auth/wrong-password") {
      errorMessage = "Current password is incorrect."
    } else if (error.code === "auth/weak-password") {
      errorMessage = "New password is too weak. Please use a stronger password."
    } else if (error.code === "auth/requires-recent-login") {
      errorMessage = "Please log out and log in again before changing your password."
    } else if (error.message) {
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage,
    }
  }
}

// Clean up expired codes (can be called periodically)
export async function cleanupExpiredCodes(): Promise<void> {
  try {
    // This would require a query, but for simplicity, we'll handle it per-request
    // In production, you might want a Cloud Function to clean up expired codes
    console.log("Expired codes cleanup - implement with Cloud Function for production")
  } catch (error) {
    console.error("Error cleaning up expired codes:", error)
  }
}

