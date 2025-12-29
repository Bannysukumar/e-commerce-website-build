import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { CartProvider } from "@/lib/cart-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { AuthProvider } from "@/lib/auth-context"
import { WhatsAppButton } from "@/components/whatsapp-button"

// Force dynamic rendering to prevent static page caching
export const dynamic = 'force-dynamic'

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "swebirdshop - Your Premium Shopping Destination",
  description:
    "Discover premium products across fashion, electronics, and more. Fast shipping, secure checkout, and 100% satisfaction guaranteed.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/logo.jpg",
        type: "image/jpeg",
      },
    ],
    apple: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <WhatsAppButton />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
