"use client"

import { ReactNode } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right"
  duration?: number
}

export function ScrollAnimation({
  children,
  className = "",
  delay = 0,
  direction = "fade",
  duration = 600,
}: ScrollAnimationProps) {
  const { elementRef, isVisible } = useScrollAnimation({ triggerOnce: true })

  const getAnimationClasses = () => {
    const baseClasses = "transition-all ease-out will-change-transform"
    
    if (!isVisible) {
      switch (direction) {
        case "fade":
          return `${baseClasses} opacity-0`
        case "slide-up":
          return `${baseClasses} opacity-0 translate-y-8`
        case "slide-down":
          return `${baseClasses} opacity-0 -translate-y-8`
        case "slide-left":
          return `${baseClasses} opacity-0 translate-x-8`
        case "slide-right":
          return `${baseClasses} opacity-0 -translate-x-8`
        default:
          return `${baseClasses} opacity-0`
      }
    } else {
      return `${baseClasses} opacity-100 translate-x-0 translate-y-0`
    }
  }

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
