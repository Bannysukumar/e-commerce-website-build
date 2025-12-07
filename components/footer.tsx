import Link from "next/link"
import { Mail, Phone, MapPin } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4">About swebirdshop</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Your trusted destination for premium products. We believe in quality, affordability, and exceptional
              customer service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:opacity-80 transition-opacity">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:opacity-80 transition-opacity">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:opacity-80 transition-opacity">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:opacity-80 transition-opacity">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="hover:opacity-80 transition-opacity">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:opacity-80 transition-opacity">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:opacity-80 transition-opacity">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:opacity-80 transition-opacity">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@swebirdshop.com" className="hover:opacity-80 transition-opacity">
                  support@swebirdshop.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:+1234567890" className="hover:opacity-80 transition-opacity">
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>123 Shopping St, Commerce City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground border-opacity-20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm opacity-75">&copy; {currentYear} swebirdshop. All rights reserved.</p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:opacity-80 transition-opacity">
                Facebook
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                Twitter
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
