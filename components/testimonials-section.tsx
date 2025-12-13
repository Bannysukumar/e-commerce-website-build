"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { subscribeToTestimonials, type Testimonial } from "@/lib/testimonials-service"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { ScrollAnimation } from "@/components/scroll-animation"

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const unsubscribe = subscribeToTestimonials((testimonialsList) => {
      setTestimonials(testimonialsList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  if (loading || testimonials.length === 0) {
    return null
  }

  // Show 3 testimonials at a time, with middle one active
  const displayTestimonials = testimonials.slice(0, 7) // Show up to 7 for pagination

  return (
    <ScrollAnimation direction="slide-up" delay={0}>
      <section className="py-16 px-4 bg-[#E9DFFF]">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <ScrollAnimation direction="fade" delay={100}>
            <div className="text-center mb-12">
              <h2 className="text-sm font-normal text-gray-500 uppercase mb-2" style={{ fontFamily: 'sans-serif' }}>
                WHAT OUR CLIENTS SAY
              </h2>
            </div>
          </ScrollAnimation>

        {/* Testimonials Carousel */}
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {displayTestimonials.map((testimonial, index) => {
              const isActive = index === current
              return (
                <CarouselItem key={testimonial.id} className="pl-2 md:pl-4 basis-full md:basis-1/3">
                  <div className={`bg-white rounded-lg p-6 h-full transition-all ${
                    isActive ? "shadow-lg" : "shadow-none"
                  }`}>
                    {/* Star Rating */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-black text-black"
                        />
                      ))}
                    </div>

                    {/* Review Text */}
                    <p className="text-gray-900 mb-6 leading-relaxed text-sm md:text-base text-left" style={{ fontFamily: 'sans-serif' }}>
                      {testimonial.review}
                    </p>

                    {/* Customer Info */}
                    <div className="flex flex-col items-center text-center">
                      <img
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover mb-3"
                      />
                      <h3 className="font-bold text-gray-900 text-base md:text-lg mb-1" style={{ fontFamily: 'sans-serif' }}>
                        {testimonial.name}
                      </h3>
                      <p className="text-gray-600 text-sm" style={{ fontFamily: 'sans-serif' }}>
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </Carousel>

        {/* Pagination Dots */}
        {displayTestimonials.length > 0 && (
          <div className="flex justify-center gap-2 mt-8">
            {displayTestimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === current ? "bg-gray-900" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
    </ScrollAnimation>
  )
}
