"use client"

import type React from "react"

export const metadata = {
  title: "Shipping Policy - swebirdshop",
  description: "Learn about swebirdshop shipping options, rates, and delivery times.",
}

export default function ShippingPolicyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">{children}</div>
    </main>
  )
}
