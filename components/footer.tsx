"use client"

import Link from "next/link"
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, MessageCircle } from "lucide-react"
import { useState } from "react"
import { subscribeToNewsletter } from "@/lib/newsletter-service"

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [email, setEmail] = useState("")
  const [subscriptionStatus, setSubscriptionStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  return (
    <footer className="bg-[#A78BFA] text-white mt-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-10">
          {/* Shop Now */}
          <div>
            <h3 className="font-bold text-base mb-5 uppercase tracking-wider text-white">SHOP NOW</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products?category=necklace" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Necklace
                </Link>
              </li>
              <li>
                <Link href="/products?category=rings" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Rings
                </Link>
              </li>
              <li>
                <Link href="/products?category=bracelets" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Bracelets
                </Link>
              </li>
              <li>
                <Link href="/products?category=earrings" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Earrings
                </Link>
              </li>
              <li>
                <Link href="/products?category=watches" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Watches
                </Link>
              </li>
              <li>
                <Link href="/gift-cards" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Gift Cards
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="font-bold text-base mb-5 uppercase tracking-wider text-white">INFORMATION</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/orders" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-base mb-5 uppercase tracking-wider text-white">CUSTOMER SERVICE</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  Shipping
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-white/90 hover:text-white transition-colors inline-block">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect With Us */}
          <div>
            <h3 className="font-bold text-base mb-5 uppercase tracking-wider text-white">CONNECT WITH US</h3>
            <div className="space-y-4 text-sm mb-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/80" />
                <span className="text-white/90 leading-relaxed">Vijayawada</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white/80" />
                <a href="tel:+919032221646" className="text-white/90 hover:text-white transition-colors">
                  +91 9032221646
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-white/80" />
                <a
                  href="https://whatsapp.com/channel/0029VbBOUYDC1Fu9dkfvMp1S"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  WhatsApp Channel
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white/80" />
                <a href="mailto:support@swebirdshop.com" className="text-white/90 hover:text-white transition-colors">
                  support@swebirdshop.com
                </a>
              </div>
            </div>
            {/* Social Media Icons */}
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.instagram.com/swebird_shop?igsh=OWtzNmg3MzdnMzlm"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.facebook.com/share/1BZH9yDUJy/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com/@swebirdshop?si=kMQvNoCnBAtall7p"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://whatsapp.com/channel/0029VbBOUYDC1Fu9dkfvMp1S"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-white/20 pt-8 pb-8">
          <div className="max-w-lg mx-auto">
            <h3 className="font-bold text-lg mb-2 uppercase tracking-wide text-center text-white">JOIN OUR NEWSLETTER</h3>
            <p className="text-sm mb-6 text-white/80 text-center">Subscribe to get updates on new products and exclusive offers</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!email.trim()) {
                  setSubscriptionStatus({ type: "error", message: "Please enter your email address" })
                  return
                }

                setIsSubmitting(true)
                setSubscriptionStatus({ type: null, message: "" })

                const result = await subscribeToNewsletter(email.trim())

                if (result.success) {
                  setSubscriptionStatus({ type: "success", message: result.message })
                  setEmail("")
                  // Clear success message after 5 seconds
                  setTimeout(() => {
                    setSubscriptionStatus({ type: null, message: "" })
                  }, 5000)
                } else {
                  setSubscriptionStatus({ type: "error", message: result.message })
                }

                setIsSubmitting(false)
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (subscriptionStatus.type) {
                    setSubscriptionStatus({ type: null, message: "" })
                  }
                }}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 text-sm border border-transparent"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-[#6B46C1] px-8 py-3 rounded-lg uppercase tracking-wider text-sm font-semibold hover:bg-white/90 transition-all border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "SUBSCRIBING..." : "SUBSCRIBE"}
              </button>
            </form>
            {subscriptionStatus.type && (
              <div
                className={`mt-4 text-center text-sm px-4 py-2 rounded-lg ${
                  subscriptionStatus.type === "success"
                    ? "bg-green-500/20 text-green-200 border border-green-500/30"
                    : "bg-red-500/20 text-red-200 border border-red-500/30"
                }`}
              >
                {subscriptionStatus.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Footer - Darker Purple */}
      <div className="border-t border-white/20 bg-[#8347A8] py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-white/90 text-center md:text-left">
              &copy; {currentYear} swebirdshop. All Rights Reserved.
            </p>
            
            {/* Payment Icons */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs text-white/70 mr-2">We Accept:</span>
              <div className="flex gap-2">
                {/* Visa */}
                <div className="w-14 h-9 bg-white rounded-md flex items-center justify-center shadow-sm overflow-hidden p-1.5">
                  <svg viewBox="0 0 100 32" className="w-full h-full">
                    <rect width="100" height="32" fill="#1434CB" rx="4" />
                    <text x="50" y="22" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
                      VISA
                    </text>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="w-14 h-9 bg-white rounded-md flex items-center justify-center shadow-sm overflow-hidden p-1">
                  <svg viewBox="0 0 100 32" className="w-full h-full">
                    <circle cx="35" cy="16" r="10" fill="#EB001B" />
                    <circle cx="65" cy="16" r="10" fill="#F79E1B" />
                  </svg>
                </div>
                {/* Amex */}
                <div className="w-14 h-9 bg-white rounded-md flex items-center justify-center shadow-sm overflow-hidden p-1.5">
                  <svg viewBox="0 0 100 32" className="w-full h-full">
                    <rect width="100" height="32" fill="#006FCF" rx="4" />
                    <text x="50" y="20" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
                      AMEX
                    </text>
                  </svg>
                </div>
                {/* PayPal */}
                <div className="w-14 h-9 bg-white rounded-md flex items-center justify-center shadow-sm overflow-hidden p-1.5">
                  <svg viewBox="0 0 100 32" className="w-full h-full">
                    <rect width="100" height="32" fill="#003087" rx="4" />
                    <text x="50" y="20" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
                      PayPal
                    </text>
                  </svg>
                </div>
                {/* RuPay */}
                <div className="w-14 h-9 bg-white rounded-md flex items-center justify-center shadow-sm overflow-hidden p-1.5">
                  <svg viewBox="0 0 100 32" className="w-full h-full">
                    <rect width="100" height="32" fill="#003087" rx="4" />
                    <text x="50" y="20" fontSize="10" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
                      RuPay
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Icon - Fixed Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button 
          className="w-14 h-14 bg-[#6B46C1] text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:shadow-2xl transition-all"
          aria-label="Chat with us"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    </footer>
  )
}
