"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useState, useEffect, Suspense, useCallback } from "react"
import { useAuth } from "@/lib/auth-context"
import { getAllOrders } from "@/lib/orders-service"
import { Package, Search, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

function TrackOrderContent() {
  const { user, isLoggedIn } = useAuth()
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState("")
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = useCallback(async (searchValue?: string) => {
    const searchTerm = searchValue || orderId.trim()
    if (!searchTerm) {
      setError("Please enter an order number")
      return
    }

    setLoading(true)
    setError("")
    setOrder(null)

    try {
      const orders = await getAllOrders()
      // Search by orderNumber or document ID
      const foundOrder = orders.find(
        (o) =>
          o.orderNumber?.toUpperCase() === searchTerm.toUpperCase() ||
          o.id.toLowerCase() === searchTerm.toLowerCase() ||
          o.orderNumber?.toUpperCase().includes(searchTerm.toUpperCase())
      )

      if (foundOrder) {
        setOrder(foundOrder)
      } else {
        setError("Order not found. Please check your order number and try again.")
      }
    } catch (error) {
      console.error("Error fetching order:", error)
      setError("An error occurred while searching for your order. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [orderId])

  // Check for orderId in URL params
  useEffect(() => {
    const orderIdParam = searchParams.get("orderId")
    if (orderIdParam) {
      setOrderId(orderIdParam)
      handleSearch(orderIdParam)
    }
  }, [searchParams, handleSearch])

  const handleSearchClick = () => {
    handleSearch()
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "Shipped":
        return <Package className="w-5 h-5 text-purple-600" />
      case "Processing":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "Pending":
        return <Clock className="w-5 h-5 text-gray-600" />
      case "Cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-800"
      case "Shipped":
        return "bg-purple-100 text-purple-800"
      case "Processing":
        return "bg-yellow-100 text-yellow-800"
      case "Pending":
        return "bg-gray-100 text-gray-800"
      case "Cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-lg text-gray-600">Enter your order ID to track your shipment</p>
        </div>

        {/* Search Form */}
        <div className="bg-gray-50 rounded-lg p-8 mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Order Number (e.g., ORD-2024-123456)"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchClick()}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B46C1] focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearchClick}
              disabled={loading}
              className="bg-[#6B46C1] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#5B3FA8] transition-colors disabled:opacity-50"
            >
              {loading ? "Searching..." : "Track Order"}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {order.orderNumber || `Order #${order.id.slice(-8)}`}
                </h2>
                <p className="text-gray-600">Placed on {order.createdAt.toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Shipping Address</h3>
                {order.shippingInfo && (
                  <div className="text-gray-600 space-y-1">
                    <p>{order.shippingInfo.firstName} {order.shippingInfo.lastName}</p>
                    <p>{order.shippingInfo.address}</p>
                    <p>
                      {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.zipCode}
                    </p>
                    <p>Phone: {order.shippingInfo.phone}</p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>₹{order.shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>₹{order.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span>₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Product ID: {item.productId}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{(item.quantity * 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Login Prompt */}
        {isLoggedIn && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">View all your orders in your account</p>
            <Link
              href="/account"
              className="inline-block bg-[#6B46C1] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5B3FA8] transition-colors"
            >
              Go to My Account
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Track Your Order</h1>
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  )
}
