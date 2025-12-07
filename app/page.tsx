"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ChevronRight, Truck, Shield, RotateCcw, Sparkles, Heart, ShoppingCart, ChevronDown } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { subscribeToProducts, initializeProducts, type Product } from "@/lib/products-service"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { WishlistProvider } from "@/lib/wishlist-context"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { getCarouselSlides, subscribeToCarouselSlides, type CarouselSlide } from "@/lib/carousel-service"
import { subscribeToFeaturedProducts, type FeaturedProduct } from "@/lib/featured-products-service"
import { StoryProductCard } from "@/components/story-product-card"
import { TestimonialsSection } from "@/components/testimonials-section"
import { Plus } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { subscribeToSections, type HomepageSection } from "@/lib/sections-service"

const shopCategories = [
  { id: "back-to-90s", name: "BACK TO 90s", image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },
  { id: "salty-shores", name: "SALTY SHORES", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80" },
  { id: "soft-crimes", name: "SOFT CRIMES", image: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600&q=80" },
  { id: "covered-in-chrome", name: "COVERED IN CHROME", image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80" },
]

function HomeContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>([])
  const [loadingCarousel, setLoadingCarousel] = useState(true)
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loadingSections, setLoadingSections] = useState(true)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    initializeProducts().then(() => {
      const unsubscribe = subscribeToProducts((productsList) => {
        setProducts(productsList)
        setLoading(false)
      })
      return () => unsubscribe()
    })
  }, [])

  // Load carousel slides
  useEffect(() => {
    const unsubscribe = subscribeToCarouselSlides((slides) => {
      setCarouselSlides(slides)
      setLoadingCarousel(false)
    })
    return () => unsubscribe()
  }, [])

  // Load featured products for story section
  useEffect(() => {
    const unsubscribe = subscribeToFeaturedProducts((featured) => {
      setFeaturedProducts(featured)
      setLoadingFeatured(false)
    })
    return () => unsubscribe()
  }, [])

  // Load homepage sections
  useEffect(() => {
    const unsubscribe = subscribeToSections((sectionsList) => {
      setSections(sectionsList.filter((s) => s.isActive))
      setLoadingSections(false)
    })
    return () => unsubscribe()
  }, [])

  // Auto-scroll carousel
  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Auto-scroll functionality
  useEffect(() => {
    if (!api) return

    let interval: NodeJS.Timeout

    const startAutoplay = () => {
      interval = setInterval(() => {
        api.scrollNext()
      }, 4000)
    }

    const stopAutoplay = () => {
      if (interval) clearInterval(interval)
    }

    startAutoplay()

    // Pause on hover
    const carouselElement = document.querySelector('[data-slot="carousel"]')
    if (carouselElement) {
      carouselElement.addEventListener('mouseenter', stopAutoplay)
      carouselElement.addEventListener('mouseleave', startAutoplay)
    }

    return () => {
      stopAutoplay()
      if (carouselElement) {
        carouselElement.removeEventListener('mouseenter', stopAutoplay)
        carouselElement.removeEventListener('mouseleave', startAutoplay)
      }
    }
  }, [api])

  // Get featured products with their product data
  const storyProducts = featuredProducts
    .map((featured) => {
      const product = products.find((p) => p.id === featured.productId)
      return product ? { product, tagline: featured.tagline, videoUrl: featured.videoUrl } : null
    })
    .filter((item): item is { product: Product; tagline?: string; videoUrl?: string } => item !== null)

  // Filter products by category for different sections
  const giftSets = products.filter((p) => p.category.toLowerCase().includes("gift") || p.category.toLowerCase().includes("set")).slice(0, 4)
  const gifts = products.filter((p) => p.category.toLowerCase() === "gifts").slice(0, 4)
  const jewellery = products.filter((p) => p.category.toLowerCase() === "jewellery" || p.category.toLowerCase() === "jewelry").slice(0, 4)
  const watches = products.filter((p) => p.category.toLowerCase() === "watches").slice(0, 4)
  const newArrivalsAccessories = products.filter((p) => p.category.toLowerCase() === "accessories").slice(0, 4)
  const bestSellers = products.slice(0, 4)
  const dealsOfDay = products.filter((p) => p.category.toLowerCase() === "watches").slice(0, 4)
  const belts = products.filter((p) => p.category.toLowerCase() === "belts").slice(0, 4)
  const sunglasses = products.filter((p) => p.category.toLowerCase() === "shades" || p.category.toLowerCase() === "sunglasses").slice(0, 4)
  const hats = products.filter((p) => p.category.toLowerCase() === "hats").slice(0, 4)
  const scarves = products.filter((p) => p.category.toLowerCase() === "scarves").slice(0, 4)
  const hairAccessories = products.filter((p) => p.category.toLowerCase() === "hairwear" || p.category.toLowerCase() === "hair accessories").slice(0, 5)

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Carousel - Auto Scrolling with Dynamic Slides */}
      <section className="relative h-screen w-full overflow-hidden group">
        {loadingCarousel ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-muted-foreground">Loading carousel...</p>
          </div>
        ) : carouselSlides.length === 0 ? (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-background to-secondary">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No carousel slides available</p>
              <p className="text-sm text-muted-foreground">Add slides from the admin panel</p>
            </div>
          </div>
        ) : (
          <Carousel
            setApi={setApi}
            opts={{
              align: "start",
              loop: true,
            }}
            className="h-full w-full"
          >
            <CarouselContent className="h-full">
              {carouselSlides.map((slide) => (
                <CarouselItem key={slide.id} className="h-screen w-full pl-0">
                  <Link href={slide.categoryLink || "#"} className="block h-full w-full relative">
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                      style={{
                        backgroundImage: `url('${slide.imageUrl}')`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                    <div className="relative h-full flex items-center justify-end px-8 md:px-16 lg:px-24">
                      <div className="flex flex-col items-end text-right">
                        {slide.tagline && (
                          <p className="text-lg md:text-xl font-serif text-white/90 italic mb-2">
                            {slide.tagline}
                          </p>
                        )}
                        <h2 className="text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-none">
                          {slide.title}
                        </h2>
                        <div className="mt-6 bg-[#6B46C1] text-white px-8 py-3 rounded uppercase tracking-widest text-sm font-medium hover:opacity-90 transition-opacity pointer-events-none">
                          SHOP NOW
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </section>

      {/* TRENDING NOW - Category Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-normal text-gray-500 mb-2 uppercase">TRENDING NOW</h2>
          </div>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-6 min-w-max">
              {shopCategories.map((category, index) => {
                const categoryProducts = products.filter((p) => 
                  p.category.toLowerCase().includes(category.id.toLowerCase().replace("-", " ")) ||
                  p.category.toLowerCase() === category.id.toLowerCase()
                )
                return (
                  <Link key={category.id} href={`/products?category=${category.id}`}>
                    <div className="relative w-[280px] aspect-square rounded-lg overflow-hidden group cursor-pointer">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4 w-10 h-10 bg-[#6B46C1] text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-2xl font-bold text-white mb-2">{category.name}</h3>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Our Stories Section */}
      {storyProducts.length > 0 && (
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-sm font-normal text-gray-500">STORIES</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {storyProducts.map(({ product, tagline, videoUrl }) => (
                  <StoryProductCard key={product.id} product={product} tagline={tagline} videoUrl={videoUrl} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Dynamic Product Sections */}
      {!loadingSections &&
        sections
          .filter((section) => section.type === "product-section")
          .sort((a, b) => a.order - b.order)
          .map((section) => {
            const sectionProducts = section.category
              ? products.filter((p) => p.category.toLowerCase() === section.category?.toLowerCase()).slice(0, section.maxProducts || 4)
              : products.slice(0, section.maxProducts || 4)

            if (sectionProducts.length === 0) return null

            const bgColor = section.backgroundColor || "bg-white"
            const sectionClasses = `py-12 px-4 ${bgColor}`

            return (
              <section key={section.id} className={sectionClasses}>
                <div className="max-w-7xl mx-auto">
                  {section.showTitle && (
                    <div className="text-center mb-8">
                      <h2 className="text-sm font-normal text-gray-500 uppercase">{section.title}</h2>
                    </div>
                  )}
                  {section.layout === "grid" ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      {sectionProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  ) : section.layout === "horizontal-scroll" ? (
                    <div className="overflow-x-auto pb-4">
                      <div className="flex gap-4 min-w-max">
                        {sectionProducts.map((product) => (
                          <div key={product.id} className="flex-shrink-0 w-[250px]">
                            <ProductCard product={product} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {sectionProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )
          })}

      {/* GIFTS Section */}
      {gifts.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">GIFTS</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {gifts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* JEWELLERY Section */}
      {jewellery.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">JEWELLERY</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {jewellery.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* WATCHES Section */}
      {watches.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">WATCHES</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {watches.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* New Arrivals (Accessories) Section */}
      {newArrivalsAccessories.length > 0 && (
        <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">NEW ARRIVALS</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {newArrivalsAccessories.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Best Sellers Section */}
      {bestSellers.length > 0 && (
        <section className="py-12 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500">BEST SELLERS</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deals of the Day (Watches) Section */}
      {dealsOfDay.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">WATCHES</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {dealsOfDay.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* BELTS Section */}
      {belts.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">BELTS</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {belts.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SUNGLASSES Section */}
      {sunglasses.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">SUNGLASSES</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {sunglasses.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* HATS Section */}
      {hats.length > 0 && (
        <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">HATS</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {hats.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SCARVES Section */}
      {scarves.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">SCARVES</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {scarves.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* HAIR ACCESSORIES Section */}
      {hairAccessories.length > 0 && (
        <section className="py-12 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-sm font-normal text-gray-500 uppercase">HAIR ACCESSORIES</h2>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {hairAccessories.map((product) => (
                  <div key={product.id} className="flex-shrink-0 w-[250px]">
                    <ProductCard product={product} />
                </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* WHY SHOP WITH US Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-normal text-gray-500 uppercase">WHY SHOP WITH US</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="flex flex-col items-center text-center">
              <Truck className="w-12 h-12 text-orange-500 mb-3" strokeWidth={1.5} />
              <h3 className="font-normal text-sm text-gray-900">Fast Delivery</h3>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw className="w-12 h-12 text-orange-500 mb-3" strokeWidth={1.5} />
              <h3 className="font-normal text-sm text-gray-900">Easy Returns</h3>
            </div>
            <div className="flex flex-col items-center text-center">
              <Heart className="w-12 h-12 text-orange-500 mb-3" strokeWidth={1.5} />
              <h3 className="font-normal text-sm text-gray-900">Quality Products</h3>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="w-12 h-12 text-orange-500 mb-3" strokeWidth={1.5} />
              <h3 className="font-normal text-sm text-gray-900">Secure Payment</h3>
            </div>
            <div className="flex flex-col items-center text-center">
              <Sparkles className="w-12 h-12 text-orange-500 mb-3" strokeWidth={1.5} />
              <h3 className="font-normal text-sm text-gray-900">24/7 Support</h3>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING NOW - Lifestyle Images Grid Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-sm font-normal text-gray-500 uppercase">TRENDING NOW</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {/* Top Row - 3 square images */}
            <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80"
                alt="Lifestyle 1"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80"
                alt="Lifestyle 2"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80"
                alt="Lifestyle 3"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {/* Middle Row - 3 square images */}
            <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80"
                alt="Lifestyle 4"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                alt="Lifestyle 5"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80"
                alt="Lifestyle 6"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            {/* Bottom Row - 1 large rectangular + 1 square */}
            <div className="relative col-span-2 aspect-[2/1] rounded-lg overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=800&q=80"
                alt="Lifestyle 7"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80"
                alt="Lifestyle 8"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Government Trust Section */}
      <section className="py-12 px-4 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col items-center gap-4">
            <img
              src="https://salty.co.in/cdn/shop/files/TRUSTED_BY_GOVERNMENT_OF_INDIA_3.png?crop=center&height=149&v=1689235711&width=800"
              alt="Trusted by Government of India"
              srcSet="https://salty.co.in/cdn/shop/files/TRUSTED_BY_GOVERNMENT_OF_INDIA_3.png?crop=center&height=65&v=1689235711&width=352 352w, https://salty.co.in/cdn/shop/files/TRUSTED_BY_GOVERNMENT_OF_INDIA_3.png?crop=center&height=149&v=1689235711&width=800 800w"
              width="800"
              height="149"
              loading="lazy"
              className="max-w-full h-auto"
            />
            <p className="text-xs text-gray-600 max-w-md font-medium">
              MINISTRY OF ELECTRONICS & INFORMATION TECHNOLOGY GOVERNMENT OF INDIA
            </p>
          </div>
        </div>
      </section>

      {/* Brand Introduction Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              SHOP FASHION ACCESSORIES FOR WOMEN AT swebirdshop
            </h2>
          </div>
          <div className="space-y-6 text-gray-700 text-base leading-relaxed">
            <p>
              Welcome to swebirdshop, India's fastest-growing fashion accessories brand.
            </p>
            <p>
              As your go-to destination for fashion accessories, we have made over 1 Million stylish customers happy and cool over the past two years, establishing ourselves as a trusted name in trendy accessories for women.
            </p>
            <p>
              Whether you're looking for the latest in jewelry, accessories, or fashion extras, Salty has it all. Our expansive catalog ensures that every piece you purchase gives you an edge above the rest. Explore our collection of women's fashion accessories online curated for every occasion & need to complete your look. It is how all our happy customers find their perfect style companion at Salty.
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
              BEST FASHION JEWELLERY BRAND IN INDIA
            </h3>
            <p>
              Experience the finest fashion jewellery and accessories brand in India, swebirdshop. Hands down, we are the best website for women's jewellery online. Our selection includes chic, affordable fashion jewellery that suit any occasion, from timeless classics to contemporary pieces. We ensure our jewellery and fashion accessories for women meet the varied tastes and preferences of our customers.
            </p>
            <p>
              We are proud to share that our brand has been supported and funded by the Government of India. Which underscores the quality of our fashion accessories and jewellery.
            </p>
            <p>
              At swebirdshop, we specialize in crafting high-quality jewellery and accessories for both women and men. Our extensive collection features a wide range of designs, ensuring there's something for everyone. From timeless classics to modern pieces, we provide jewellery for women that appeal to various tastes and preferences.
            </p>
            <p>
              Customer satisfaction is our top priority, which is why we offer a hassle-free return and exchange policy within 7 days of purchase. Additionally, our faster delivery options ensures you receive your order as quickly as the same day in select major cities, allowing you to enjoy your new fashion jewellery and accessories without delay.
            </p>
            <p>
              Shop with us today and step up your style with our one-of-a-kind jewellery and accessory pieces.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[#212121] mb-2 uppercase" style={{ fontFamily: 'sans-serif' }}>
              FREQUENTLY ASKED QUESTIONS
            </h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-6">
            {[
              {
                question: "How should we store our jewelry to maintain its shine?",
                answer: "To maintain the shine of your jewelry, store each piece separately in a soft cloth pouch or jewelry box with individual compartments. Keep them away from direct sunlight and moisture. Clean them regularly with a soft, lint-free cloth. Avoid storing different metals together as they can scratch each other."
              },
              {
                question: "Things to keep in mind while buying jewelry online?",
                answer: "When buying jewelry online, always check the return policy, read customer reviews, verify the seller's authenticity, check product images from multiple angles, understand the sizing guide, and ensure secure payment methods. Look for detailed product descriptions including materials, dimensions, and care instructions."
              },
              {
                question: "Is cash on delivery available?",
                answer: "Yes, we offer cash on delivery (COD) for orders above ₹44. Free standard delivery is available for orders above ₹1500. COD orders are subject to verification and may have certain restrictions based on location."
              },
              {
                question: "How to choose a perfect ring?",
                answer: "To choose the perfect ring, consider your style preferences, finger size (use our size guide), the occasion, metal type (gold, silver, platinum), gemstone preferences, and budget. We offer a size guide and virtual try-on features to help you choose the perfect ring. Consider the ring's width and comfort for daily wear."
              },
              {
                question: "What is the return policy?",
                answer: "We offer a 30-day return policy from the date of delivery. Items must be unused, in original packaging, and with proof of purchase. Some items like personalized or custom-made jewelry may be excluded from returns. Please contact our customer service for assistance with returns and exchanges."
              },
            ].map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-none">
                <AccordionTrigger className="hover:no-underline py-0 [&>svg]:hidden">
                  <div className="w-full flex items-center gap-4 text-left group">
                    <div className="w-8 h-8 rounded-full bg-[#F5F5F5] flex items-center justify-center flex-shrink-0 group-data-[state=open]:bg-[#E0E0E0] transition-colors">
                      <ChevronDown className="w-4 h-4 text-[#424242] transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </div>
                    <span className="text-base font-normal text-[#424242] flex-1" style={{ fontFamily: 'sans-serif' }}>
                      {faq.question}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 pb-0">
                  <div className="pl-12">
                    <p className="text-base font-normal text-[#424242] leading-relaxed" style={{ fontFamily: 'sans-serif' }}>
                      {faq.answer}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <HomeContent />
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  )
}
