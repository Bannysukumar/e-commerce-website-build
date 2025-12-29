"use client"

// Only load Vercel Analytics on Vercel deployments
// This prevents 404 errors on non-Vercel deployments
export function ConditionalAnalytics() {
  // Return null - Analytics will only work on Vercel anyway
  // If you deploy to Vercel, uncomment the code below
  return null
  
  // Uncomment below for Vercel deployments:
  // const { Analytics } = require("@vercel/analytics/next")
  // return <Analytics />
}

