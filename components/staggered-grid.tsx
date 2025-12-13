"use client"

import { ReactNode } from "react"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

interface StaggeredGridProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
  direction?: "fade" | "slide-up"
}

export function StaggeredGrid({
  children,
  className = "",
  staggerDelay = 100,
  direction = "slide-up",
}: StaggeredGridProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <StaggeredItem
          key={index}
          delay={index * staggerDelay}
          direction={direction}
        >
          {child}
        </StaggeredItem>
      ))}
    </div>
  )
}

function StaggeredItem({
  children,
  delay,
  direction,
}: {
  children: ReactNode
  delay: number
  direction: "fade" | "slide-up"
}) {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
    triggerOnce: true,
  })

  const getAnimationClasses = () => {
    const baseClasses = "transition-all ease-out will-change-transform"
    if (!isVisible) {
      return direction === "fade"
        ? `${baseClasses} opacity-0`
        : `${baseClasses} opacity-0 translate-y-8`
    }
    return `${baseClasses} opacity-100 translate-y-0`
  }

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={getAnimationClasses()}
      style={{
        transitionDuration: "700ms",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}
