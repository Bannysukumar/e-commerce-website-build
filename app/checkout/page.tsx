"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { RAZORPAY_KEY_ID } from "@/lib/razorpay-config"
import { getAdminSettings, type AdminSettings } from "@/lib/settings-service"
import { saveShippingInfo, getShippingInfo } from "@/lib/shipping-info-service"

declare global {
  interface Window {
    Razorpay: any
  }
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { items, clearCart } = useCart()
  const { user, isLoggedIn } = useAuth()
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
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [fetchingPincode, setFetchingPincode] = useState(false)
  const [shippingInfoLoaded, setShippingInfoLoaded] = useState(false)

  // Load products
  useEffect(() => {
    getProducts().then(setProducts)
  }, [])

  // Load admin settings
  useEffect(() => {
    getAdminSettings().then(setSettings)
  }, [])

  // Check if returning from payment redirect
  useEffect(() => {
    const razorpayPaymentId = searchParams.get("razorpay_payment_id")
    const razorpayOrderId = searchParams.get("razorpay_order_id")
    const razorpaySignature = searchParams.get("razorpay_signature")
    
    // If payment parameters exist in URL, redirect to success page
    if (razorpayPaymentId && razorpayOrderId && razorpaySignature) {
      router.replace(`/payment/success?razorpay_payment_id=${razorpayPaymentId}&razorpay_order_id=${razorpayOrderId}&razorpay_signature=${razorpaySignature}`)
    }
  }, [searchParams, router])

  // Auto-fill user information when logged in (only once on initial load)
  useEffect(() => {
    if (isLoggedIn && user && !shippingInfoLoaded) {
      setShippingInfoLoaded(true)
      
      // First, try to load saved shipping info
      getShippingInfo(user.id).then((savedShippingInfo) => {
        if (savedShippingInfo) {
          // Use saved shipping info if available
          setFormData({
            firstName: savedShippingInfo.firstName || "",
            lastName: savedShippingInfo.lastName || "",
            email: savedShippingInfo.email || "",
            phone: savedShippingInfo.phone || "",
            address: savedShippingInfo.address || "",
            city: savedShippingInfo.city || "",
            state: savedShippingInfo.state || "",
            zipCode: savedShippingInfo.zipCode || "",
          })
        } else {
          // If no saved shipping info, use basic user info
          const nameParts = user.name ? user.name.trim().split(/\s+/) : []
          setFormData({
            firstName: nameParts[0] || "",
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email || "",
            phone: "",
            address: "",
            city: "",
            state: "",
            zipCode: "",
          })
        }
      }).catch((error) => {
        console.error("Error loading shipping info:", error)
        // Fallback to basic user info if loading fails
        const nameParts = user.name ? user.name.trim().split(/\s+/) : []
        setFormData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          email: user.email || "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
        })
      })
    }
  }, [isLoggedIn, user, shippingInfoLoaded])

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

  // Calculate shipping using admin settings
  const shippingCost = settings ? parseFloat(settings.shippingCost) || 0 : 10
  const freeShippingThreshold = settings ? parseFloat(settings.freeShippingThreshold) || 0 : 100
  const shipping = subtotal > 0 && subtotal < freeShippingThreshold ? shippingCost : 0

  // Calculate tax using admin settings
  const taxRate = settings ? parseFloat(settings.taxRate) || 0 : 10
  const tax = subtotal * (taxRate / 100)

  const total = subtotal + shipping + tax - discount

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Fetch city and state from PIN code
  const handlePincodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const pincode = e.target.value.trim()
    
    // Only fetch if PIN code is 6 digits and city/state are not already filled
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      // Don't fetch if city and state are already filled
      if (formData.city && formData.state) {
        return
      }

      setFetchingPincode(true)
      
      try {
        // Use our API route to avoid CORS issues
        const response = await fetch(`/api/pincode?pincode=${pincode}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        })
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `HTTP error! status: ${response.status}`
          console.error("PIN code API error:", errorMessage)
          
          // Show user-friendly error message
          if (response.status === 503) {
            setToast({ 
              message: "PIN code service is temporarily unavailable. Please enter city and state manually.", 
              type: "error" 
            })
          } else if (response.status === 504) {
            setToast({ 
              message: "Request timed out. Please try again.", 
              type: "error" 
            })
          } else {
            setToast({ 
              message: "Could not fetch location data. Please enter city and state manually.", 
              type: "info" 
            })
          }
          return
        }
        
        const data = await response.json()
        
        if (data.PostOffice && Array.isArray(data.PostOffice) && data.PostOffice.length > 0) {
          // Priority order: Sub Office > Head Post Office > Branch Post Office
          const branchTypePriority: Record<string, number> = {
            "Sub Office": 1,
            "Head Post Office": 2,
            "Branch Post Office": 3,
          }
          
          // Find the best post office (prefer Sub Office or Head Post Office)
          const bestPostOffice = data.PostOffice.reduce((best: any, current: any) => {
            const bestPriority = branchTypePriority[best?.BranchType] || 999
            const currentPriority = branchTypePriority[current?.BranchType] || 999
            return currentPriority < bestPriority ? current : best
          }, data.PostOffice[0])
          
          // Use District as city (more accurate than post office name)
          // Fallback to post office name if District is not available
          const city = bestPostOffice.District || bestPostOffice.Name || ""
          const state = bestPostOffice.State || ""
          
          setFormData((prev) => ({
            ...prev,
            city: city || prev.city,
            state: state || prev.state,
          }))
          
          if (city && state) {
            setToast({ 
              message: `Auto-filled: ${city}, ${state}`, 
              type: "success" 
            })
          }
        } else {
          setToast({ 
            message: "PIN code not found. Please enter city and state manually.", 
            type: "info" 
          })
        }
      } catch (error: any) {
        console.error("Error fetching PIN code data:", error)
        
        // Show error message to user
        if (error.name !== 'AbortError') {
          setToast({ 
            message: "Network error. Please enter city and state manually.", 
            type: "error" 
          })
        }
      } finally {
        setFetchingPincode(false)
      }
    }
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
    
    // Check if user is logged in
    if (!isLoggedIn || !user) {
      setToast({ 
        message: "Please login to proceed with payment. Redirecting to login page...", 
        type: "error" 
      })
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/auth/login?redirect=/checkout")
      }, 2000)
      return
    }
    
    // Validate all shipping information fields are filled
    const requiredFields = {
      "First Name": formData.firstName,
      "Last Name": formData.lastName,
      "Email": formData.email,
      "Phone Number": formData.phone,
      "Street Address": formData.address,
      "PIN Code": formData.zipCode,
      "City": formData.city,
      "State": formData.state,
    }
    
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([field]) => field)
    
    if (missingFields.length > 0) {
      setToast({ 
        message: `Please fill in all required fields: ${missingFields.join(", ")}`, 
        type: "error" 
      })
      return
    }
    
    // Validate PIN code format
    if (!/^\d{6}$/.test(formData.zipCode)) {
      setToast({ 
        message: "Please enter a valid 6-digit PIN code", 
        type: "error" 
      })
      return
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setToast({ 
        message: "Please enter a valid email address", 
        type: "error" 
      })
      return
    }
    
    // Validate phone number (at least 10 digits)
    const phoneRegex = /^\d{10,}$/
    const phoneDigits = formData.phone.replace(/\D/g, "")
    if (!phoneRegex.test(phoneDigits)) {
      setToast({ 
        message: "Please enter a valid phone number (at least 10 digits)", 
        type: "error" 
      })
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

      // Prepare order data to store in sessionStorage (for redirect handling)
      const orderDataForStorage = {
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
        subtotal,
        shipping,
        tax,
        total,
        discount: discount,
      }

      // Store order data in sessionStorage for redirect handling
      sessionStorage.setItem("pendingOrderData", JSON.stringify(orderDataForStorage))
      if (appliedCoupon) {
        sessionStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon))
      }

      // Initialize Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SweBird",
        description: `Order for ${formData.firstName} ${formData.lastName}`,
        order_id: razorpayOrder.id,
        // Redirect URLs for mobile payment methods (GPay, PhonePe, etc.)
        redirect: true,
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

            // Save shipping information for future use (if user is logged in)
            if (user?.id) {
              try {
                await saveShippingInfo(user.id, {
                  firstName: formData.firstName,
                  lastName: formData.lastName,
                  email: formData.email,
                  phone: formData.phone,
                  address: formData.address,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                })
              } catch (error) {
                console.error("Error saving shipping info:", error)
                // Don't block order completion if saving shipping info fails
              }
            }

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
            
            // Clean up session storage after successful payment
            sessionStorage.removeItem("pendingOrderData")
            sessionStorage.removeItem("appliedCoupon")
            
            setToast({ message: "Payment successful! Order placed successfully!", type: "success" })
            
            // Redirect to success page with payment details (for consistency)
            router.push(`/payment/success?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}&status=success`)
          } catch (error) {
            console.error("Error processing payment:", error)
            setToast({ message: "Payment verification failed. Please contact support.", type: "error" })
            // Clean up session storage on error
            sessionStorage.removeItem("pendingOrderData")
            sessionStorage.removeItem("appliedCoupon")
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
            // Clean up session storage on cancel
            sessionStorage.removeItem("pendingOrderData")
            sessionStorage.removeItem("appliedCoupon")
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

        {/* Login Required Banner */}
        {!isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-yellow-900">Login Required</p>
                  <p className="text-sm text-yellow-700">You must be logged in to proceed with payment.</p>
                </div>
              </div>
              <Link
                href="/auth/login?redirect=/checkout"
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
              >
                Login Now
              </Link>
            </div>
          </div>
        )}

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
                <p className="text-sm text-muted-foreground mb-6">
                  All fields are required. Please fill in all details to proceed.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2">
                      PIN Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="PIN Code (6 digits)"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      onBlur={handlePincodeBlur}
                      maxLength={6}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                    {fetchingPincode && (
                      <div className="absolute right-3 top-10 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      State <span className="text-red-500">*</span>
                    </label>
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  </div>
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
                disabled={loading || !razorpayLoaded || !isLoggedIn}
                className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {!isLoggedIn ? (
                  "Please Login to Proceed"
                ) : loading ? (
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
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">Loading checkout...</p>
          </div>
        </div>
      }>
      <CheckoutContent />
      </Suspense>
    </CartProvider>
  )
}
