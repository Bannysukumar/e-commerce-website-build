"use client"

import Link from "next/link"
import { useRef, useEffect, useState } from "react"
import type { Product } from "@/lib/types"

type StoryProductCardProps = {
  product: Product
  tagline?: string
  videoUrl?: string
}

export function StoryProductCard({ product, tagline, videoUrl }: StoryProductCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (!videoUrl || !videoRef.current || !containerRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Video is in viewport - play it
            videoRef.current?.play().catch((err) => {
              console.log("Auto-play prevented:", err)
            })
            setIsPlaying(true)
          } else {
            // Video is out of viewport - pause it
            videoRef.current?.pause()
            setIsPlaying(false)
          }
        })
      },
      {
        threshold: 0.5, // Play when 50% of video is visible
      }
    )

    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
    }
  }, [videoUrl])

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0

  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="group cursor-pointer flex-shrink-0 w-[280px]">
        {/* Main Image/Video Container */}
        <div
          ref={containerRef}
          className="relative w-full aspect-[9/16] rounded-lg overflow-hidden bg-gray-100 mb-3"
        >
          {videoUrl ? (
            <video
              ref={videoRef}
              src={videoUrl}
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          ) : (
            <img
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          {/* Tagline Overlay - Centered or Top */}
          {tagline && (
            <div className="absolute top-4 left-4 right-4 z-10">
              <p className="text-white text-sm font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] leading-relaxed">{tagline}</p>
            </div>
          )}

          {/* Small Product Thumbnail at Bottom Right */}
          <div className="absolute bottom-3 right-3 z-10">
            <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-white shadow-lg bg-white">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Video Play Indicator */}
          {videoUrl && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
              <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-1 mt-2">
          <h3 className="font-normal text-sm text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">₹{product.price.toFixed(0)}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through">
                ₹{product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
