"use client"

import { useState, useEffect, use } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getProductById, getProducts, type Product } from "@/lib/products-service"
import { useCart } from "@/lib/cart-context"
import { useWishlist } from "@/lib/wishlist-context"
import { Star, Heart, ShoppingCart, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { CartProvider } from "@/lib/cart-context"
import Link from "next/link"

function ProductPageContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])

  useEffect(() => {
    if (resolvedParams.id) {
      getProductById(resolvedParams.id).then((p) => {
        setProduct(p)
        setLoading(false)
        // Load related products
        if (p) {
          getProducts().then((allProducts) => {
            const related = allProducts.filter(
              (prod) => prod.category === p.category && prod.id !== p.id
            )
            setRelatedProducts(related)
          })
        }
      })
    }
  }, [resolvedParams.id])
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [addedToCart, setAddedToCart] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const inWishlist = product ? isInWishlist(product.id) : false

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-serif font-light text-foreground mb-4">Product not found</h1>
          <Link
            href="/products"
            className="text-accent hover:opacity-80 transition-opacity font-light uppercase tracking-widest text-sm"
          >
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product.id, quantity, selectedSize, selectedColor)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="mb-12 flex items-center gap-2 text-sm font-light text-muted-foreground">
          <Link href="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <span>/</span>
          <Link href={`/products?category=${product.category}`} className="hover:text-foreground transition-colors">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        <div className="grid md:grid-cols-2 gap-16 mb-20">
          {/* Images */}
          <div className="space-y-6">
            <div className="bg-muted rounded border border-border overflow-hidden">
              <img
                src={product.images?.[imageIndex] || product.image}
                alt={product.name}
                className="w-full h-96 md:h-full max-h-96 object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImageIndex(idx)}
                    className={`flex-shrink-0 w-24 h-24 rounded border-2 overflow-hidden transition-all duration-300 ${
                      idx === imageIndex ? "border-accent shadow-lg" : "border-border hover:border-accent"
                    }`}
                  >
                    <img src={img || "/placeholder.svg"} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-6">{product.name}</h1>

              {/* Ratings */}
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
                    />
                  ))}
                </div>
                <span className="font-light text-foreground">{product.rating}</span>
                <span className="text-muted-foreground font-light">({product.reviews} reviews)</span>
              </div>

              {/* Pricing */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-light text-foreground">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice && (
                    <>
                      <span className="text-xl text-muted-foreground line-through font-light">
                        ₹{product.originalPrice.toFixed(2)}
                      </span>
                      <span className="bg-accent text-accent-foreground px-4 py-2 rounded text-sm font-light uppercase tracking-widest">
                        Save {discount}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <p className="text-lg text-muted-foreground font-light leading-relaxed">{product.description}</p>

            {/* Options */}
            {product.colors && (
              <div>
                <label className="block text-sm font-light text-foreground uppercase tracking-widest mb-4">Color</label>
                <div className="flex gap-3 flex-wrap">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 rounded border transition-all duration-300 text-sm font-light uppercase tracking-widest ${
                        selectedColor === color
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.size && (
              <div>
                <label className="block text-sm font-light text-foreground uppercase tracking-widest mb-4">Size</label>
                <div className="flex gap-3 flex-wrap">
                  {product.size.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-6 py-3 rounded border transition-all duration-300 text-sm font-light uppercase tracking-widest ${
                        selectedSize === size
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border hover:border-accent"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-light text-foreground uppercase tracking-widest mb-4">
                Quantity
              </label>
              <div className="flex items-center gap-4 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 border border-border rounded hover:bg-muted hover:border-accent transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-2xl font-light w-12 text-center text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 border border-border rounded hover:bg-muted hover:border-accent transition-all duration-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-accent text-accent-foreground py-4 rounded font-light uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all duration-300 group"
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={() => (inWishlist ? removeFromWishlist(product.id) : addToWishlist(product.id))}
                className={`px-6 py-4 rounded border transition-all duration-300 ${
                  inWishlist
                    ? "bg-accent text-accent-foreground border-accent"
                    : "border-border hover:border-accent hover:text-accent"
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
              </button>
            </div>

            {/* Stock Status */}
            <div className="pt-6 border-t border-border">
              {product.inStock ? (
                <div className="flex items-center gap-3 text-green-700 font-light text-sm uppercase tracking-widest">
                  <Check className="w-5 h-5" />
                  In Stock • Ships in 2-3 business days
                </div>
              ) : (
                <p className="text-destructive font-light uppercase tracking-widest text-sm">Out of Stock</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border pt-20">
            <div className="mb-16">
              <p className="text-accent text-sm font-light tracking-widest uppercase mb-4">You May Also Like</p>
              <h2 className="text-4xl font-serif font-light text-foreground">Related Products</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProducts.slice(0, 3).map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group">
                  <div className="rounded border border-border overflow-hidden mb-6 hover:border-accent transition-all">
                    <img
                      src={p.image || "/placeholder.svg"}
                      alt={p.name}
                      className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground font-light uppercase tracking-widest mb-2">
                    {p.category}
                  </p>
                  <h3 className="font-light text-lg text-foreground group-hover:text-accent transition-colors mb-3 line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-accent font-light text-lg">₹{p.price.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <CartProvider>
      <ProductPageContent params={params} />
    </CartProvider>
  )
}
