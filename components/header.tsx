"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Search, ShoppingCart, User, Heart, ChevronDown, ChevronRight } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { getProducts, type Product } from "@/lib/products-service"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [categoryDropdowns, setCategoryDropdowns] = useState<{ [key: string]: boolean }>({})
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchModalRef = useRef<HTMLDivElement>(null)
  const { cartCount } = useCart()
  const { items: wishlistItems } = useWishlist()
  const router = useRouter()

  const categories = [
    { id: "gifts", name: "GIFTS", hasDropdown: false },
    { id: "new", name: "NEW", hasDropdown: false },
    { id: "shades", name: "SHADES", hasDropdown: true },
    { id: "scarves", name: "SCARVES", hasDropdown: false },
    { id: "hats", name: "HATS", hasDropdown: false },
    { id: "watches", name: "WATCHES", hasDropdown: true },
    { id: "belts", name: "BELTS", hasDropdown: false },
    { id: "hairwear", name: "HAIRWEAR", hasDropdown: false },
    { id: "curated-combos", name: "CURATED COMBOS", hasDropdown: false },
  ]

  const additionalCategories = [
    { id: "bags", name: "BAGS & BAG ACCESSORIES", hasDropdown: true },
    { id: "girls", name: "GIRLS", hasDropdown: false },
    { id: "boys", name: "BOYS", hasDropdown: false },
  ]

  // Load products for search
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingSearch(true)
      const products = await getProducts()
      setAllProducts(products)
      setLoadingSearch(false)
    }
    loadProducts()
  }, [])

  // Filter products based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setSearchResults(filtered.slice(0, 8)) // Limit to 8 results
    } else {
      setSearchResults([])
    }
  }, [searchQuery, allProducts])

  // Handle search modal open
  const handleSearchClick = () => {
    setSearchOpen(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // Handle search modal close
  const handleSearchClose = () => {
    setSearchOpen(false)
    setSearchQuery("")
    setSearchResults([])
  }

  // Handle clicking outside search modal and Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchModalRef.current && !searchModalRef.current.contains(event.target as Node)) {
        handleSearchClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && searchOpen) {
        handleSearchClose()
      }
    }

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [searchOpen])

  // Handle Enter key to navigate to products page
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`)
      handleSearchClose()
    }
  }

  // Handle product click
  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`)
    handleSearchClose()
  }

  const toggleCategoryDropdown = (categoryId: string) => {
    setCategoryDropdowns((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  return (
    <header className="sticky top-0 z-50 bg-[#8347A8]">
      {/* Top Promotional Bar - Auto Scrolling */}
      <div className="bg-black text-white py-2 px-4 overflow-hidden relative text-sm font-medium">
        <div className="flex items-center whitespace-nowrap">
          <div className="flex items-center gap-8 min-w-max animate-scroll">
            <span className="text-sm font-medium">GET 10% OFF ON YOUR FIRST ORDER. USE CODE SWEBIRD10.</span>
            <span className="text-sm font-medium">FREE STANDARD DELIVERY ABOVE RS. 44!</span>
            <span className="text-sm font-medium">NEW COLLECTION NOW AVAILABLE - SHOP NOW!</span>
            <span className="text-sm font-medium">UP TO 50% OFF ON SELECTED ITEMS - LIMITED TIME!</span>
            <span className="text-sm font-medium">GET 10% OFF ON YOUR FIRST ORDER. USE CODE SWEBIRD10.</span>
            <span className="text-sm font-medium">FREE STANDARD DELIVERY ABOVE RS. 44!</span>
            <span className="text-sm font-medium">NEW COLLECTION NOW AVAILABLE - SHOP NOW!</span>
            <span className="text-sm font-medium">UP TO 50% OFF ON SELECTED ITEMS - LIMITED TIME!</span>
          </div>
          <div className="flex items-center gap-8 min-w-max animate-scroll" aria-hidden="true">
            <span className="text-sm font-medium">GET 10% OFF ON YOUR FIRST ORDER. USE CODE SWEBIRD10.</span>
            <span className="text-sm font-medium">FREE STANDARD DELIVERY ABOVE RS. 44!</span>
            <span className="text-sm font-medium">NEW COLLECTION NOW AVAILABLE - SHOP NOW!</span>
            <span className="text-sm font-medium">UP TO 50% OFF ON SELECTED ITEMS - LIMITED TIME!</span>
            <span className="text-sm font-medium">GET 10% OFF ON YOUR FIRST ORDER. USE CODE SWEBIRD10.</span>
            <span className="text-sm font-medium">FREE STANDARD DELIVERY ABOVE RS. 44!</span>
            <span className="text-sm font-medium">NEW COLLECTION NOW AVAILABLE - SHOP NOW!</span>
            <span className="text-sm font-medium">UP TO 50% OFF ON SELECTED ITEMS - LIMITED TIME!</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="bg-[#8347A8] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Brand Name (Center), Utility Icons (Right) */}
          <div className="flex items-center justify-between py-4">
            {/* Brand Name - Centered */}
            <Link href="/" className="flex-1 flex justify-center items-center gap-3" style={{ marginLeft: '28px' }}>
              <img 
                src="/logo.jpg" 
                alt="swebirdshop" 
                className="h-12 md:h-16 w-auto object-contain hidden"
              />
              <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white" style={{ fontFamily: 'sans-serif', letterSpacing: '0.05em' }}>swebirdshop</h1>
            </Link>
            {/* Utility Icons - Right */}
            <div className="flex-1 flex items-center justify-end gap-4">
              <button
                onClick={handleSearchClick}
                className="hover:opacity-80 transition-all duration-300 hover:scale-110 active:scale-95 text-white"
                aria-label="Search"
              >
                <Search className="w-5 h-5 transition-transform duration-300" />
              </button>
              <Link
                href="/account?tab=wishlist"
                className="relative hover:opacity-80 transition-all duration-300 hover:scale-110 active:scale-95 text-white"
              >
                <Heart className="w-5 h-5 transition-transform duration-300" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold transition-all duration-300">
                  {wishlistItems.length || 0}
                </span>
              </Link>
              <Link href="/account" className="hover:opacity-80 transition-all duration-300 hover:scale-110 active:scale-95 text-white">
                <User className="w-5 h-5 transition-transform duration-300" />
              </Link>
              <Link href="/cart" className="relative hover:opacity-80 transition-all duration-300 hover:scale-110 active:scale-95 text-white">
                <ShoppingCart className="w-5 h-5 transition-transform duration-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold transition-all duration-300 animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Main Navigation Categories Row - Centered */}
          <nav className="hidden md:flex items-center justify-center gap-6 pb-3 border-t border-white/20 pt-3">
            {categories.map((category) => (
              <div key={category.id} className="relative group">
                <Link
                  href={`/products?category=${category.id}`}
                  className="text-sm font-normal uppercase tracking-wider hover:opacity-80 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1 text-white"
                  style={{ fontFamily: 'sans-serif' }}
                  onMouseEnter={() => category.hasDropdown && setCategoryDropdowns((prev) => ({ ...prev, [category.id]: true }))}
                  onMouseLeave={() => category.hasDropdown && setCategoryDropdowns((prev) => ({ ...prev, [category.id]: false }))}
                >
                  {category.name}
                  {category.hasDropdown && <ChevronDown className="w-4 h-4 transition-transform duration-300" />}
          </Link>
                {category.hasDropdown && categoryDropdowns[category.id] && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded shadow-lg py-3 px-0 min-w-[220px] z-50"
                    onMouseEnter={() => setCategoryDropdowns((prev) => ({ ...prev, [category.id]: true }))}
                    onMouseLeave={() => setCategoryDropdowns((prev) => ({ ...prev, [category.id]: false }))}
                  >
            <Link
                      href={`/products?category=${category.id}&subcategory=all`}
                      className="block px-6 py-3 hover:bg-gray-100 transition-colors text-sm text-gray-900"
            >
                      All {category.name}
            </Link>
            <Link
                      href={`/products?category=${category.id}&subcategory=featured`}
                      className="block px-6 py-3 hover:bg-gray-100 transition-colors text-sm text-gray-900"
            >
                      Featured
            </Link>
            <Link
                      href={`/products?category=${category.id}&subcategory=new`}
                      className="block px-6 py-3 hover:bg-gray-100 transition-colors text-sm text-gray-900"
            >
                      New Arrivals
            </Link>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* BAGS & BAG ACCESSORIES Row - Centered */}
          <nav className="hidden md:flex items-center justify-center gap-6 pb-3">
            {additionalCategories.filter((cat) => cat.id === "bags").map((category) => (
              <div key={category.id} className="relative group">
            <Link
                  href={`/products?category=${category.id}`}
                  className="text-sm font-normal uppercase tracking-wider hover:opacity-80 transition-opacity flex items-center gap-1 text-white"
                  style={{ fontFamily: 'sans-serif' }}
                  onMouseEnter={() => category.hasDropdown && setCategoryDropdowns((prev) => ({ ...prev, [category.id]: true }))}
                  onMouseLeave={() => category.hasDropdown && setCategoryDropdowns((prev) => ({ ...prev, [category.id]: false }))}
                >
                  {category.name}
                  {category.hasDropdown && <ChevronDown className="w-4 h-4" />}
            </Link>
                {category.hasDropdown && categoryDropdowns[category.id] && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded shadow-lg py-3 px-0 min-w-[220px] z-50"
                    onMouseEnter={() => setCategoryDropdowns((prev) => ({ ...prev, [category.id]: true }))}
                    onMouseLeave={() => setCategoryDropdowns((prev) => ({ ...prev, [category.id]: false }))}
                  >
            <Link
                      href={`/products?category=${category.id}&subcategory=all`}
                      className="block px-6 py-3 hover:bg-gray-100 transition-colors text-sm text-gray-900"
                    >
                      All {category.name}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* GIRLS | BOYS Row - Centered */}
          <nav className="hidden md:flex items-center justify-center gap-4 pb-4">
            <Link
              href="/products?category=girls"
              className="text-sm font-normal uppercase tracking-wider hover:opacity-80 transition-opacity text-white"
              style={{ fontFamily: 'sans-serif' }}
            >
              GIRLS
            </Link>
            <span className="text-white text-sm">|</span>
            <Link
              href="/products?category=boys"
              className="text-sm font-normal uppercase tracking-wider hover:opacity-80 transition-opacity text-white"
              style={{ fontFamily: 'sans-serif' }}
            >
              BOYS
            </Link>
          </nav>

            {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center justify-start pb-4 border-t border-white/20 pt-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:opacity-80 transition-opacity text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2 border-t border-white/20 pt-4">
            {categories.map((category) => (
            <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="px-4 py-2 hover:bg-white/10 rounded transition-colors text-sm uppercase tracking-widest font-medium text-white"
            >
                {category.name}
            </Link>
            ))}
            {additionalCategories.map((category) => (
            <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="px-4 py-2 hover:bg-white/10 rounded transition-colors text-sm uppercase tracking-widest font-medium text-white"
            >
                {category.name}
            </Link>
            ))}
          </nav>
        )}

        {/* Search Modal */}
        {searchOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20 px-4">
            <div
              ref={searchModalRef}
              className="w-full max-w-4xl bg-white rounded-lg shadow-2xl relative"
            >

              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="p-6 border-b border-gray-200">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search For Brace"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-4 py-4 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent transition-all"
                    autoFocus
                  />
                </div>
              </form>

              {/* Content */}
              <div className="max-h-[600px] overflow-y-auto">
                {loadingSearch ? (
                  <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : searchQuery.trim() ? (
                  searchResults.length > 0 ? (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {searchResults.slice(0, 8).map((product) => (
                          <button
                            key={product.id}
                            onClick={() => handleProductClick(product.id)}
                            className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left"
                          >
                            <div className="relative">
                              <img
                                src={product.image || "/placeholder.svg"}
                                alt={product.name}
                                className="w-full h-48 object-cover"
                              />
                              <div className="absolute top-2 left-2 bg-[#6B46C1] text-white text-xs font-medium px-2 py-1 rounded">
                                Sale
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="text-sm font-normal text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                              <div className="flex items-center gap-2">
                                {product.originalPrice && (
                                  <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toFixed(0)}</span>
                                )}
                                <span className="text-sm font-semibold text-gray-900">₹{product.price.toFixed(0)}</span>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      {searchResults.length >= 8 && (
                        <div className="mt-6 text-center">
                          <button
                            onClick={handleSearchSubmit}
                            className="text-[#6B46C1] font-medium hover:underline"
                          >
                            View All Results ({searchResults.length})
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-gray-500 font-normal">No products found</p>
                      <p className="text-sm text-gray-400 mt-2">Try a different search term</p>
                    </div>
                  )
                ) : (
                  <div className="p-6">
                    {/* Popular Choices Section */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <h3 className="text-base font-medium text-gray-700">Popular Choices</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {["Bracelets", "Rings", "Necklaces", "Earrings", "Watches", "Sunglasses"].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSearchQuery(tag)
                              setSearchOpen(true)
                            }}
                            className="bg-[#6B46C1] text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Recommended Products Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-base font-medium text-gray-700">Recommended Products</h3>
                      </div>
                      <div className="overflow-x-auto pb-4">
                        <div className="flex gap-4 min-w-max">
                          {allProducts.slice(0, 4).map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleProductClick(product.id)}
                              className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow text-left flex-shrink-0 w-48"
                            >
                              <div className="relative">
                                <img
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name}
                                  className="w-full h-48 object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-[#6B46C1] text-white text-xs font-medium px-2 py-1 rounded">
                                  Sale
                                </div>
                              </div>
                              <div className="p-4">
                                <h3 className="text-sm font-normal text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
                                <div className="flex items-center gap-2">
                                  {product.originalPrice && (
                                    <span className="text-xs text-gray-400 line-through">₹{product.originalPrice.toFixed(0)}</span>
                                  )}
                                  <span className="text-sm font-semibold text-gray-900">₹{product.price.toFixed(0)}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                          {allProducts.length > 4 && (
                            <div className="flex items-center justify-center w-12">
                              <ChevronRight className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
