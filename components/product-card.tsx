"use client"

import Link from "next/link"
import { Star, Heart, Plus } from "lucide-react"
import type { Product } from "@/lib/types"
import { useWishlist } from "@/lib/wishlist-context"
import { useCart } from "@/lib/cart-context"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const inWishlist = isInWishlist(product.id)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product.id, 1)
  }

  return (
    <div className="group">
    <Link href={`/product/${product.id}`}>
        <div className="relative mb-3 overflow-hidden rounded-lg bg-gray-100 aspect-square">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <button
            className={`absolute top-3 left-3 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              inWishlist ? "text-red-500" : "text-gray-700"
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (inWishlist) {
                removeFromWishlist(product.id)
              } else {
                addToWishlist(product.id)
              }
            }}
          >
            <Heart className={`w-5 h-5 ${inWishlist ? "fill-current" : ""}`} />
          </button>
          <button
            className="absolute bottom-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handleAddToCart}
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </Link>

      <div className="space-y-2">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900">₹{product.price.toFixed(0)}</span>
            {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>

        <button
          onClick={handleAddToCart}
          className="w-full bg-[#6B46C1] text-white px-4 py-2 rounded font-medium hover:opacity-90 transition-opacity text-sm"
        >
          ADD TO CART
        </button>
      </div>
    </div>
  )
}
