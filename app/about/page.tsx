"use client"

import Link from "next/link"
import { ArrowRight, Heart, Zap, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AboutPage() {
  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card to-background px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
            Welcome to swebirdshop
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-balance leading-relaxed">
            Your trusted destination for premium products and exceptional customer service
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="gap-2">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-balance">Our Story</h2>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            Founded with a passion for excellence, swebirdshop was created to revolutionize the way people shop online.
            We believe that every customer deserves access to high-quality products at fair prices with exceptional
            service.
          </p>
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            From our humble beginnings to becoming a trusted brand, we've stayed committed to our core values: quality,
            integrity, and customer satisfaction. Every product in our store is carefully curated to ensure it meets our
            rigorous standards.
          </p>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Today, thousands of customers trust us every day. We're not just selling products; we're building a
            community of satisfied shoppers who appreciate quality and value.
          </p>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center text-balance">
            Our Core Values
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
              <Heart className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Customer First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your satisfaction is our top priority. We listen to your feedback and continuously improve our service
                to exceed your expectations.
              </p>
            </div>
            <div className="p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
              <Shield className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Quality Assurance</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every product undergoes rigorous quality checks before reaching your doorstep. We stand behind
                everything we sell.
              </p>
            </div>
            <div className="p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
              <Zap className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Fast & Reliable</h3>
              <p className="text-muted-foreground leading-relaxed">
                Quick processing and reliable shipping mean your orders arrive quickly and safely. We value your time.
              </p>
            </div>
            <div className="p-8 bg-card rounded-lg border border-border hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-accent mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-3">Community Focused</h3>
              <p className="text-muted-foreground leading-relaxed">
                We're building more than a store—we're creating a community of like-minded customers who value quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-16 text-center text-balance">
            By The Numbers
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-accent mb-2">50K+</div>
              <p className="text-muted-foreground">Happy Customers</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-accent mb-2">100K+</div>
              <p className="text-muted-foreground">Products Sold</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-accent mb-2">98%</div>
              <p className="text-muted-foreground">Satisfaction Rate</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-accent mb-2">24/7</div>
              <p className="text-muted-foreground">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-12 text-center text-balance">
            Why Choose swebirdshop?
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Curated Selection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We handpick every product to ensure quality and value for money.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Competitive Pricing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get the best deals without compromising on quality. We work directly with suppliers to pass savings to
                  you.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Easy Returns</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Not satisfied? Return within 30 days for a full refund. No questions asked.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Secure Shopping</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your data is encrypted and protected. Shop with confidence on our secure platform.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Expert Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our knowledgeable team is here to help you find exactly what you need.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-accent to-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-accent-foreground mb-6 text-balance">
            Join Our Community Today
          </h2>
          <p className="text-xl text-accent-foreground/90 mb-8 text-balance leading-relaxed">
            Start shopping and discover why thousands of customers trust swebirdshop
          </p>
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="border-accent-foreground text-accent-foreground hover:bg-accent-foreground/10 bg-transparent"
            >
              Start Shopping
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  )
}
