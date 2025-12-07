"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Search, ShoppingCart, User } from "lucide-react"
import { useCart } from "@/lib/cart-context"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { cartCount } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded flex items-center justify-center">
              <span className="text-accent-foreground font-serif font-bold text-xl">S</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-serif font-light text-lg text-foreground">swebirdshop</span>
              <span className="text-xs text-muted-foreground tracking-widest">PREMIUM SHOPPING</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-12">
            <Link
              href="/products"
              className="text-sm font-light text-foreground hover:text-accent transition-colors duration-300 uppercase tracking-widest"
            >
              Shop
            </Link>
            <Link
              href="/categories"
              className="text-sm font-light text-foreground hover:text-accent transition-colors duration-300 uppercase tracking-widest"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="text-sm font-light text-foreground hover:text-accent transition-colors duration-300 uppercase tracking-widest"
            >
              About
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-muted rounded transition-colors duration-300 hover:text-accent">
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/account"
              className="p-2 hover:bg-muted rounded transition-colors duration-300 hover:text-accent"
            >
              <User className="w-5 h-5" />
            </Link>
            <Link
              href="/cart"
              className="relative p-2 hover:bg-muted rounded transition-colors duration-300 hover:text-accent"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            <Link
              href="/products"
              className="px-4 py-2 hover:bg-muted rounded transition-colors text-sm uppercase tracking-widest font-light"
            >
              Shop
            </Link>
            <Link
              href="/categories"
              className="px-4 py-2 hover:bg-muted rounded transition-colors text-sm uppercase tracking-widest font-light"
            >
              Categories
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 hover:bg-muted rounded transition-colors text-sm uppercase tracking-widest font-light"
            >
              About
            </Link>
          </nav>
        )}
      </div>
    </header>
  )
}
