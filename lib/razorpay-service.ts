// Razorpay service configuration - Server-side only
// Using live keys from rzp-key.csv
import { RAZORPAY_KEY_ID } from "./razorpay-config"

export const RAZORPAY_KEY_SECRET = "sN8ke5Kuu5ae3vBoMNZWTIMs"

// Re-export for server-side use
export { RAZORPAY_KEY_ID }

// Razorpay instance (server-side only)
export function getRazorpayInstance() {
  if (typeof window !== "undefined") {
    throw new Error("Razorpay instance can only be created on the server")
  }
  
  const Razorpay = require("razorpay")
  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  })
}

