"use client"

import Link from "next/link"
import { ChevronRight, Truck, Shield, RotateCcw, Sparkles } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { products, categories } from "@/lib/products-data"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { WishlistProvider } from "@/lib/wishlist-context"

function HomeContent() {
  const featuredProducts = products.slice(0, 6)
  const newArrivals = products.slice(2, 5)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Banner - Premium Design */}
      <section className="bg-gradient-to-br from-background via-background to-secondary py-24 px-4 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">Welcome to Excellence</p>
                <h1 className="text-5xl md:text-6xl font-serif font-light leading-tight text-foreground text-pretty">
                  Curated Luxury for Every Moment
                </h1>
              </div>
              <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-md">
                Discover our collection of premium products handpicked for quality, style, and sophistication. From
                fashion to electronics, every item reflects our commitment to excellence.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/products"
                  className="bg-accent text-accent-foreground px-8 py-4 rounded text-sm font-light tracking-widest uppercase hover:opacity-90 transition-all duration-300"
                >
                  Explore Collection
                </Link>
                <Link
                  href="/about"
                  className="border border-foreground text-foreground px-8 py-4 rounded text-sm font-light tracking-widest uppercase hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-gradient-to-br from-muted to-secondary rounded-lg aspect-square flex items-center justify-center border border-border">
                <Sparkles className="w-24 h-24 text-muted-foreground opacity-30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges - Premium */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex gap-6 p-6 border border-border rounded-lg hover:border-accent transition-colors duration-300">
              <Truck className="w-8 h-8 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-light text-lg text-foreground mb-1">Premium Shipping</h3>
                <p className="text-sm text-muted-foreground">Free on orders over $100</p>
              </div>
            </div>
            <div className="flex gap-6 p-6 border border-border rounded-lg hover:border-accent transition-colors duration-300">
              <Shield className="w-8 h-8 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-light text-lg text-foreground mb-1">Secure Checkout</h3>
                <p className="text-sm text-muted-foreground">100% secure transactions</p>
              </div>
            </div>
            <div className="flex gap-6 p-6 border border-border rounded-lg hover:border-accent transition-colors duration-300">
              <RotateCcw className="w-8 h-8 text-accent flex-shrink-0" />
              <div>
                <h3 className="font-light text-lg text-foreground mb-1">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">30-day money-back guarantee</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">Collections</p>
            <h2 className="text-4xl font-serif font-light text-foreground">Shop by Category</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/products?category=${category.id}`}>
                <div className="bg-card border border-border rounded-lg p-12 text-center hover:border-accent hover:shadow-lg transition-all duration-300 cursor-pointer group">
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="font-light text-lg text-foreground">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4 bg-secondary border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">Handpicked Selection</p>
              <h2 className="text-4xl font-serif font-light text-foreground">Featured Products</h2>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-3 text-accent hover:gap-4 transition-all duration-300 font-light uppercase text-sm tracking-widest"
            >
              View All <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">Latest Items</p>
            <h2 className="text-4xl font-serif font-light text-foreground">New Arrivals</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Premium */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-accent/10 to-transparent border border-accent rounded-lg p-12 md:p-16">
            <div className="max-w-2xl">
              <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">Join Our Circle</p>
              <h2 className="text-4xl font-serif font-light text-foreground mb-4">Exclusive Access & Offers</h2>
              <p className="text-lg text-muted-foreground font-light mb-8">
                Be the first to discover new collections and enjoy 10% off your next purchase.
              </p>
              <div className="flex gap-3 max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-4 bg-background border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button className="bg-accent text-accent-foreground px-8 py-4 rounded font-light uppercase text-sm tracking-widest hover:opacity-90 transition-all duration-300">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <HomeContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
