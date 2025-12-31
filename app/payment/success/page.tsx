"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { createOrder, getAllOrders } from "@/lib/orders-service"
import { useCart } from "@/lib/cart-context"
import { useAuth } from "@/lib/auth-context"
import { saveShippingInfo } from "@/lib/shipping-info-service"
import { useCoupon } from "@/lib/coupons-service"

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clearCart } = useCart()
  const { user } = useAuth()
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading")
  const [orderId, setOrderId] = useState<string>("")
  const [orderNumber, setOrderNumber] = useState<string>("")
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get payment details from URL parameters
        const razorpayPaymentId = searchParams.get("razorpay_payment_id")
        const razorpayOrderId = searchParams.get("razorpay_order_id")
        const razorpaySignature = searchParams.get("razorpay_signature")
        const paymentStatus = searchParams.get("status")

        // Get order data from sessionStorage (stored before payment)
        const orderDataStr = sessionStorage.getItem("pendingOrderData")
        const appliedCouponStr = sessionStorage.getItem("appliedCoupon")

        if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
          // Check if payment was cancelled
          if (paymentStatus === "cancelled" || !paymentStatus) {
            setStatus("failed")
            setError("Payment was cancelled. Please try again.")
            return
          }
          setStatus("failed")
          setError("Missing payment information. Please contact support.")
          return
        }

        // Verify payment with backend
        const verifyResponse = await fetch("/api/razorpay/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
            razorpay_signature: razorpaySignature,
          }),
        })

        const verification = await verifyResponse.json()

        if (!verification.verified) {
          setStatus("failed")
          setError("Payment verification failed. Please contact support.")
          return
        }

        // Check if payment status is successful
        if (verification.payment.status !== "captured" && verification.payment.status !== "authorized") {
          setStatus("failed")
          setError(`Payment status: ${verification.payment.status}. Please contact support.`)
          return
        }

        // Check if order with this payment ID already exists (prevent duplicates)
        const allOrders = await getAllOrders()
        const existingOrder = allOrders.find(
          (order) => order.paymentInfo?.razorpayPaymentId === razorpayPaymentId
        )

        if (existingOrder) {
          // Order already exists (probably created by handler callback)
          setOrderId(existingOrder.id)
          setOrderNumber(existingOrder.orderNumber)
          clearCart()
          sessionStorage.removeItem("pendingOrderData")
          sessionStorage.removeItem("appliedCoupon")
          setStatus("success")
          return
        }

        // If order data exists in sessionStorage, create the order
        if (orderDataStr) {
          try {
            const orderData = JSON.parse(orderDataStr)
            const appliedCoupon = appliedCouponStr ? JSON.parse(appliedCouponStr) : null

            // Create order in database
            const orderInfo = {
              userId: user?.id || null,
              items: orderData.items,
              shippingInfo: orderData.shippingInfo,
              paymentInfo: {
                razorpayOrderId: razorpayOrderId,
                razorpayPaymentId: razorpayPaymentId,
                razorpaySignature: razorpaySignature,
                paymentMethod: verification.payment.method || "razorpay",
                paymentStatus: verification.payment.status,
              },
              subtotal: orderData.subtotal,
              shipping: orderData.shipping,
              tax: orderData.tax,
              total: orderData.total,
              couponCode: appliedCoupon?.code || null,
              discount: orderData.discount || 0,
              status: "Processing" as const,
            }

            const result = await createOrder(orderInfo)
            setOrderId(result.id)
            setOrderNumber(result.orderNumber)

            // Save shipping information for future use (if user is logged in)
            if (user?.id && orderData.shippingInfo) {
              try {
                await saveShippingInfo(user.id, {
                  firstName: orderData.shippingInfo.firstName,
                  lastName: orderData.shippingInfo.lastName,
                  email: orderData.shippingInfo.email,
                  phone: orderData.shippingInfo.phone,
                  address: orderData.shippingInfo.address,
                  city: orderData.shippingInfo.city,
                  state: orderData.shippingInfo.state,
                  zipCode: orderData.shippingInfo.zipCode,
                })
              } catch (error) {
                console.error("Error saving shipping info:", error)
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

            // Clear cart and session storage
            clearCart()
            sessionStorage.removeItem("pendingOrderData")
            sessionStorage.removeItem("appliedCoupon")

            setStatus("success")
          } catch (error) {
            console.error("Error creating order:", error)
            // Payment is verified but order creation failed
            setStatus("failed")
            setError("Payment was successful but order creation failed. Please contact support with your payment ID: " + razorpayPaymentId)
          }
        } else {
          // Payment verified but no order data - might be duplicate callback
          setStatus("success")
          setError("Payment verified successfully. If you don't see your order, please check your account or contact support.")
        }
      } catch (error: any) {
        console.error("Error verifying payment:", error)
        setStatus("failed")
        setError(error.message || "An error occurred while verifying payment. Please contact support.")
      }
    }

    verifyPayment()
  }, [searchParams, clearCart, user])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          {status === "loading" && (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-accent" />
              <h1 className="text-2xl font-bold">Verifying Payment...</h1>
              <p className="text-muted-foreground">Please wait while we verify your payment.</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="text-muted-foreground">Your order has been placed successfully.</p>
              
              {orderNumber && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-1">
                    <span className="font-semibold">Order Number:</span> {orderNumber}
                  </p>
                  <p className="text-xs text-green-600">Save this number to track your order</p>
                </div>
              )}

              {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">{error}</p>
                </div>
              )}

              <div className="flex gap-4 justify-center pt-4">
                <Link
                  href={orderNumber ? `/orders?orderId=${orderNumber}` : "/orders"}
                  className="inline-block bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Track Your Order
                </Link>
                <Link
                  href="/products"
                  className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="space-y-6">
              <XCircle className="w-16 h-16 mx-auto text-red-500" />
              <h1 className="text-2xl font-bold">Payment Failed</h1>
              <p className="text-muted-foreground">{error}</p>
              
              <div className="flex gap-4 justify-center pt-4">
                <Link
                  href="/checkout"
                  className="inline-block bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Try Again
                </Link>
                <Link
                  href="/products"
                  className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

