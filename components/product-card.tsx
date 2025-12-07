"use client"

import Link from "next/link"
import { Star, Heart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useWishlist } from "@/lib/wishlist-context"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const inWishlist = isInWishlist(product.id)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group cursor-pointer">
        <div className="relative mb-6 overflow-hidden rounded-lg bg-muted border border-border">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {discount > 0 && (
            <div className="absolute top-4 right-4 bg-accent text-accent-foreground text-xs font-light px-4 py-2 rounded-full uppercase tracking-widest">
              -{discount}%
            </div>
          )}
          <button
            className={`absolute top-4 left-4 p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 ${
              inWishlist
                ? "bg-accent text-accent-foreground"
                : "bg-background border border-border text-foreground hover:border-accent"
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
        </div>

        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-light uppercase tracking-widest">{product.category}</p>
          <h3 className="font-light text-lg line-clamp-2 group-hover:text-accent transition-colors duration-300 text-foreground">
            {product.name}
          </h3>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-light">{product.rating}</span>
            </div>
            <span className="text-xs text-muted-foreground font-light">({product.reviews})</span>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-border">
            <span className="font-light text-lg text-foreground">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through font-light">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 pt-2">
            {product.inStock ? (
              <span className="text-xs text-green-700 font-light uppercase tracking-widest">In Stock</span>
            ) : (
              <span className="text-xs text-destructive font-light uppercase tracking-widest">Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
