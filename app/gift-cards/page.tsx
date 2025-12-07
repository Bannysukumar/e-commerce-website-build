"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Gift } from "lucide-react"

export default function GiftCardsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-[#6B46C1] rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Gift Cards</h1>
          <p className="text-lg text-gray-600">Give the gift of style with swebirdshop gift cards</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            We're working on bringing you gift cards! Soon you'll be able to purchase digital and physical gift cards
            for your loved ones to shop at swebirdshop.
          </p>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What to expect:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Digital gift cards delivered instantly via email</li>
                <li>Physical gift cards for special occasions</li>
                <li>Flexible denominations</li>
                <li>No expiration date</li>
                <li>Can be used for any product on our website</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">Want to be notified when gift cards are available?</p>
          <a
            href="/contact"
            className="inline-block bg-[#6B46C1] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5B3FA8] transition-colors"
          >
            Contact Us
          </a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
