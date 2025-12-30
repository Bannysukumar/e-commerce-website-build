"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { getProducts } from "@/lib/products-service"
import { createOrder } from "@/lib/orders-service"
import { applyCoupon, useCoupon, validateCoupon } from "@/lib/coupons-service"
import { CartProvider } from "@/lib/cart-context"
import { Check, ChevronLeft, X } from "lucide-react"
import { CheckoutProgress } from "@/components/checkout-progress"
import { CartToast } from "@/components/cart-toast"
import { RAZORPAY_KEY_ID } from "@/lib/razorpay-service"

declare global {
  interface Window {
    Razorpay: any
  }
}

function CheckoutContent() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { user } = useAuth()
  const [products, setProducts] = useState<any[]>([])
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string>("")
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState("")
  const [applyingCoupon, setApplyingCoupon] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  })
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  // Load products
  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const cartItems = items.map((item) => {
    const product = products.find((p) => p.id === item.productId)
    return { ...item, product }
  })

  const subtotal = cartItems.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity
  }, 0)

  const shipping = subtotal > 0 && subtotal < 100 ? 10 : 0
  const tax = subtotal * 0.1
  const total = subtotal + shipping + tax - discount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code")
      return
    }

    setApplyingCoupon(true)
    setCouponError("")

    try {
      const result = await applyCoupon(couponCode, subtotal + shipping)
      if (result.success) {
        const validation = await validateCoupon(couponCode, subtotal + shipping)
        setAppliedCoupon(validation.coupon)
        setDiscount(result.discount)
        setCouponError("")
        setToast({ message: "Coupon applied successfully!", type: "success" })
      } else {
        setCouponError(result.error || "Invalid coupon code")
        setAppliedCoupon(null)
        setDiscount(0)
        setToast({ message: result.error || "Invalid coupon code", type: "error" })
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      setCouponError("Error applying coupon. Please try again.")
      setAppliedCoupon(null)
      setDiscount(0)
    } finally {
      setApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setCouponCode("")
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate shipping information
    if (!formData.firstName || !formData.email || !formData.phone || !formData.address) {
      setToast({ message: "Please fill in all required shipping information", type: "error" })
      return
    }

    if (!razorpayLoaded || !window.Razorpay) {
      setToast({ message: "Payment gateway is loading. Please wait...", type: "error" })
      return
    }

    setCurrentStep(3)
    setLoading(true)

    try {
      // Create Razorpay order
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            userId: user?.id || "guest",
            email: formData.email,
            phone: formData.phone,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment order")
      }

      const razorpayOrder = await response.json()

      // Initialize Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SweBird",
        description: `Order for ${formData.firstName} ${formData.lastName}`,
        order_id: razorpayOrder.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verification = await verifyResponse.json()

            if (!verification.verified) {
              throw new Error("Payment verification failed")
            }

            // Create order in database
            const orderData = {
              userId: user?.id || null,
              items,
              shippingInfo: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.zipCode,
              },
              paymentInfo: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentMethod: verification.payment.method || "razorpay",
                paymentStatus: verification.payment.status,
              },
              subtotal,
              shipping,
              tax,
              total,
              couponCode: appliedCoupon?.code || null,
              discount: discount,
              status: "Processing" as const,
            }

            const result = await createOrder(orderData)

            // Mark coupon as used if applied
            if (appliedCoupon?.code) {
              try {
                await useCoupon(appliedCoupon.code)
              } catch (error) {
                console.error("Error marking coupon as used:", error)
              }
            }

            setOrderId(result.id)
            setOrderNumber(result.orderNumber)
            setOrderPlaced(true)
            clearCart()
            setToast({ message: "Payment successful! Order placed successfully!", type: "success" })
          } catch (error) {
            console.error("Error processing payment:", error)
            setToast({ message: "Payment verification failed. Please contact support.", type: "error" })
          } finally {
            setLoading(false)
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            setToast({ message: "Payment cancelled", type: "info" })
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Error initiating payment:", error)
      setToast({ message: "Failed to initiate payment. Please try again.", type: "error" })
      setLoading(false)
    }
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <Link
              href="/products"
              className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold">Order Confirmed!</h1>
            <p className="text-muted-foreground text-lg">
              Thank you for your purchase. Your order has been placed successfully.
            </p>
            <div className="bg-card border border-border rounded-lg p-8 space-y-6">
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6">
                <p className="text-sm text-muted-foreground mb-2">Your Order Number</p>
                <p className="text-3xl font-bold text-accent">{orderNumber}</p>
                <p className="text-xs text-muted-foreground mt-2">Save this number to track your order</p>
              </div>
              
              <div className="space-y-4">
                {appliedCoupon && discount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800 mb-1">
                      <span className="font-semibold">Coupon Applied:</span> {appliedCoupon.code}
              </p>
                    <p className="text-xs text-green-600">You saved ₹{discount.toFixed(2)}</p>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-accent">₹{total.toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="text-muted-foreground text-sm mb-4">
                    A confirmation email has been sent to <span className="font-semibold text-foreground">{formData.email}</span>
              </p>
                  <Link
                    href={`/orders?orderId=${orderNumber}`}
                    className="inline-block bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Track Your Order
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/products"
                className="text-accent hover:underline font-medium"
              >
                Continue Shopping
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link
                href="/account"
                className="text-accent hover:underline font-medium"
              >
                View My Orders
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/cart" className="flex items-center gap-2 text-accent hover:opacity-80 transition-opacity mb-8">
          <ChevronLeft className="w-4 h-4" />
          Back to Cart
        </Link>

        <h1 className="text-4xl font-bold mb-12">Checkout</h1>

        <CheckoutProgress currentStep={currentStep} />

        {toast && (
          <CartToast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Information */}
              <div
                className={`border border-border rounded-lg p-8 transition-all duration-500 ${
                  currentStep >= 1 ? "opacity-100 translate-y-0" : "opacity-50"
                }`}
                onFocus={() => setCurrentStep(1)}
              >
                <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="md:col-span-2 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="md:col-span-2 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="md:col-span-2 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="ZIP Code"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    className="px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
              </div>

              {/* Payment Information */}
              <div
                className={`border border-border rounded-lg p-8 transition-all duration-500 ${
                  currentStep >= 2 ? "opacity-100 translate-y-0" : "opacity-50"
                }`}
                onFocus={() => {
                  if (formData.firstName && formData.email && formData.address) {
                    setCurrentStep(2)
                  }
                }}
              >
                <h2 className="text-2xl font-bold mb-6">Payment Information</h2>
                <div className="space-y-4">
                  <div className="bg-muted/50 border border-border rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold">Secure Payment via Razorpay</h3>
                        <p className="text-sm text-muted-foreground">You will be redirected to Razorpay for secure payment</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>✓ Secure payment gateway</p>
                      <p>✓ Multiple payment options (Cards, UPI, Netbanking, Wallets)</p>
                      <p>✓ PCI DSS compliant</p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !razorpayLoaded}
                className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                    Processing Payment...
                  </>
                ) : !razorpayLoaded ? (
                  "Loading Payment Gateway..."
                ) : (
                  "Proceed to Payment"
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="border border-border rounded-lg p-8 sticky top-24 space-y-6 transition-all duration-300">
              <h2 className="text-xl font-bold">Order Summary</h2>

              {/* Coupon Code Section */}
              <div className="border border-border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-sm">Have a coupon code?</h3>
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value.toUpperCase())
                        setCouponError("")
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon || !couponCode.trim()}
                      className="bg-accent text-accent-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {applyingCoupon ? "..." : "Apply"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-semibold text-green-800">{appliedCoupon.code}</p>
                      <p className="text-xs text-green-600">
                        {appliedCoupon.discountType === "percentage"
                          ? `${appliedCoupon.discountValue}% off`
                          : `₹${appliedCoupon.discountValue} off`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-green-600" />
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-600">{couponError}</p>}
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-4 pb-4 border-b border-border">
                    <img
                      src={item.product?.image || "/placeholder.svg"}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 text-sm">
                      <p className="font-semibold">{item.product?.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="font-bold">₹{((item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <div className="flex justify-between text-sm transition-all duration-300">
                  <span>Subtotal</span>
                  <span className="transition-all duration-300">₹{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600 transition-all duration-300 animate-in slide-in-from-top">
                    <span>Discount</span>
                    <span>-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm transition-all duration-300">
                  <span>Shipping</span>
                  <span className="transition-all duration-300">₹{shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm transition-all duration-300">
                  <span>Tax</span>
                  <span className="transition-all duration-300">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-3 transition-all duration-300">
                  <span>Total</span>
                  <span className="transition-all duration-300 text-accent">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutContent />
    </CartProvider>
  )
}
