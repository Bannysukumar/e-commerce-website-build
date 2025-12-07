"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { subscribeToProducts, initializeProducts, type Product } from "@/lib/products-service"

const categories = [
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "fashion", name: "Fashion", icon: "👕" },
  { id: "accessories", name: "Accessories", icon: "⌚" },
  { id: "sports", name: "Sports", icon: "⚽" },
]

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    initializeProducts().then(() => {
      const unsubscribe = subscribeToProducts((productsList) => {
        setProducts(productsList)
      })
      return () => unsubscribe()
    })
  }, [])

  const categoryStats = categories.map((cat) => ({
    ...cat,
    count: products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase() || p.category.toLowerCase() === cat.id.toLowerCase()).length,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-border py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-accent text-sm font-light tracking-widest uppercase mb-6">Our Collections</p>
          <h1 className="text-5xl md:text-6xl font-serif font-light text-foreground mb-6 text-pretty">
            Explore Our Categories
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl leading-relaxed">
            Discover our carefully curated collections across multiple categories. Each selection represents our
            commitment to quality and excellence.
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoryStats.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="group relative overflow-hidden rounded border border-border bg-card hover:border-accent transition-all duration-300 hover:shadow-lg"
            >
              {/* Category Card */}
              <div className="p-10 flex flex-col items-center text-center">
                {/* Icon */}
                <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300 opacity-90">
                  {cat.icon}
                </div>

                {/* Category Name */}
                <h2 className="text-xl font-light text-foreground mb-3 uppercase tracking-widest font-serif">
                  {cat.name}
                </h2>

                {/* Product Count */}
                <p className="text-sm text-muted-foreground font-light mb-8">
                  {cat.count} {cat.count === 1 ? "item" : "items"}
                </p>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-accent font-light text-sm uppercase tracking-widest group-hover:gap-3 transition-all duration-300">
                  Shop
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Hover Background */}
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="bg-secondary border-y border-border py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">Why Choose Us</p>
            <h2 className="text-4xl font-serif font-light text-foreground mb-4">Premium Shopping Experience</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Curated Selection",
                description: "Carefully chosen products that meet our strict quality standards",
              },
              {
                title: "Premium Quality",
                description: "Every item is inspected to ensure excellence and value",
              },
              {
                title: "Expert Curation",
                description: "Thoughtfully selected to match your lifestyle and needs",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-background p-8 rounded border border-border hover:border-accent transition-all"
              >
                <h3 className="text-lg font-light text-foreground mb-3 uppercase tracking-widest">{feature.title}</h3>
                <p className="text-muted-foreground font-light leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-accent text-accent-foreground py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-light mb-6">Ready to Explore?</h2>
          <p className="text-lg font-light mb-10 opacity-90 max-w-2xl mx-auto">
            Browse through our extensive collection and discover products that match your style and needs.
          </p>
          <Link
            href="/products"
            className="inline-block border-2 border-accent-foreground text-accent-foreground font-light px-8 py-4 rounded uppercase tracking-widest text-sm hover:bg-accent-foreground hover:text-accent transition-all duration-300"
          >
            Start Shopping
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
