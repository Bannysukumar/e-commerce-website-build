"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { subscribeToProducts, initializeProducts, type Product } from "@/lib/products-service"
import { Search, Filter, ChevronDown } from "lucide-react"
import { StaggeredGrid } from "@/components/staggered-grid"
import { ScrollAnimation } from "@/components/scroll-animation"

const categories = [
  { id: "electronics", name: "Electronics", icon: "📱" },
  { id: "fashion", name: "Fashion", icon: "👕" },
  { id: "accessories", name: "Accessories", icon: "⌚" },
  { id: "sports", name: "Sports", icon: "⚽" },
]

function ProductsContent() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "")
  const [selectedPrice, setSelectedPrice] = useState<[number, number]>([0, 500])
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState("trending")
  const [filtersOpen, setFiltersOpen] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeProducts().then(() => {
      const unsubscribe = subscribeToProducts((productsList) => {
        setProducts(productsList)
        setLoading(false)
      })
      return () => unsubscribe()
    })
  }, [])

  // Sync category filter with URL parameter
  useEffect(() => {
    const categoryParam = searchParams.get("category")
    if (categoryParam) {
      setSelectedCategory(categoryParam)
    }
  }, [searchParams])

  // Sync search term with URL parameter
  useEffect(() => {
    const searchParam = searchParams.get("search")
    if (searchParam) {
      setSearchTerm(searchParam)
    }
  }, [searchParams])

  const filteredProducts = useMemo(() => {
    let result = products

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory) {
      // Special handling for "boys" and "girls" - filter by gender field
      if (selectedCategory.toLowerCase() === "boys") {
        result = result.filter((p) => p.gender?.toUpperCase() === "BOYS")
      } else if (selectedCategory.toLowerCase() === "girls") {
        result = result.filter((p) => p.gender?.toUpperCase() === "GIRLS")
      } else {
        // For other categories, filter by category field
        result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())
      }
    }
    // If no category selected, show all products (no filtering applied)

    // Price filter
    result = result.filter((p) => p.price >= selectedPrice[0] && p.price <= selectedPrice[1])

    // Rating filter
    if (selectedRating > 0) {
      result = result.filter((p) => p.rating >= selectedRating)
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        // Reverse order to show new items first
        result.reverse()
        break
      case "trending":
      default:
        result.sort((a, b) => b.reviews - a.reviews)
        break
    }

    return result
  }, [searchTerm, selectedCategory, selectedPrice, selectedRating, sortBy])

  const priceRanges = [
    { label: "Under ₹50", min: 0, max: 50 },
    { label: "₹50 - ₹100", min: 50, max: 100 },
    { label: "₹100 - ₹200", min: 100, max: 200 },
    { label: "Over ₹200", min: 200, max: 500 },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="border-b border-border py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4">
            <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">Complete Inventory</p>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-4">All Products</h1>
          </div>
          <p className="text-lg text-muted-foreground font-light max-w-2xl">
            Discover our complete collection of {filteredProducts.length} carefully curated items
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded p-6 space-y-6 sticky top-32">
              <div className="flex items-center justify-between lg:hidden">
                <h2 className="font-light text-lg text-foreground uppercase tracking-widest">Filters</h2>
                <button
                  onClick={() => setFiltersOpen(!filtersOpen)}
                  className="p-1 hover:bg-muted rounded transition-colors"
                >
                  <ChevronDown className={`w-5 h-5 transition-transform ${filtersOpen ? "" : "-rotate-90"}`} />
                </button>
              </div>

              {(filtersOpen || true) && (
                <>
                  {/* Category Filter */}
                  <div>
                    <h3 className="font-light text-sm text-foreground uppercase tracking-widest mb-4">Category</h3>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory("")}
                        className={`block w-full text-left px-4 py-2 rounded transition-all text-sm font-light ${
                          selectedCategory === ""
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted hover:border-accent"
                        }`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`block w-full text-left px-4 py-2 rounded transition-all text-sm font-light ${
                            selectedCategory === cat.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <h3 className="font-light text-sm text-foreground uppercase tracking-widest mb-4">Price Range</h3>
                    <div className="space-y-2">
                      {priceRanges.map((range, idx) => (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer text-sm font-light">
                          <input
                            type="radio"
                            name="price"
                            checked={selectedPrice[0] === range.min && selectedPrice[1] === range.max}
                            onChange={() => setSelectedPrice([range.min, range.max])}
                            className="w-4 h-4"
                          />
                          <span>{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <h3 className="font-light text-sm text-foreground uppercase tracking-widest mb-4">Rating</h3>
                    <div className="space-y-2">
                      {[0, 4, 4.5, 5].map((rating) => (
                        <label key={rating} className="flex items-center gap-3 cursor-pointer text-sm font-light">
                          <input
                            type="radio"
                            name="rating"
                            checked={selectedRating === rating}
                            onChange={() => setSelectedRating(rating)}
                            className="w-4 h-4"
                          />
                          <span>{rating === 0 ? "All Ratings" : `${rating}+ Stars`}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  {(searchTerm || selectedCategory || selectedRating > 0) && (
                    <button
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedCategory("")
                        setSelectedRating(0)
                        setSelectedPrice([0, 500])
                      }}
                      className="w-full px-4 py-3 border border-border rounded hover:bg-muted transition-colors text-sm font-light uppercase tracking-widest"
                    >
                      Clear Filters
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Sort Options */}
            <div className="mb-8 flex items-center justify-between pb-6 border-b border-border">
              <p className="text-sm text-muted-foreground font-light">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="text-sm font-light uppercase tracking-widest">
                  Sort:
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 bg-card border border-border rounded focus:outline-none focus:ring-2 focus:ring-accent text-sm font-light"
                >
                  <option value="trending">Trending</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {loading ? (
              <ScrollAnimation direction="fade">
                <div className="text-center py-20">
                  <p className="text-muted-foreground font-light">Loading products...</p>
                </div>
              </ScrollAnimation>
            ) : filteredProducts.length > 0 ? (
              <StaggeredGrid
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                staggerDelay={80}
                direction="slide-up"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </StaggeredGrid>
            ) : (
              <ScrollAnimation direction="fade">
                <div className="text-center py-20">
                  <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h2 className="text-2xl font-serif font-light mb-2 text-foreground">No products found</h2>
                  <p className="text-muted-foreground font-light">Try adjusting your filters or search terms</p>
                </div>
              </ScrollAnimation>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function ProductsPage() {
  return <ProductsContent />
}
