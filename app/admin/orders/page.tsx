"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { subscribeToAllOrders, updateOrderStatus, type Order } from "@/lib/orders-service"
import { getProducts } from "@/lib/products-service"
import { Filter, X, Package, MapPin, CreditCard, User, Mail, Phone } from "lucide-react"
import type { Product } from "@/lib/products-service"

function OrdersManagementContent() {
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderProducts, setOrderProducts] = useState<Product[]>([])
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false)

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-indigo-100 text-indigo-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  }

  // Subscribe to orders
  useEffect(() => {
    const unsubscribe = subscribeToAllOrders((ordersList) => {
      setOrders(ordersList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredOrders =
    selectedStatus === "all" ? orders : orders.filter((order) => order.status === selectedStatus)

  const handleStatusChange = async (orderId: string, newStatus: Order["status"]) => {
    try {
      await updateOrderStatus(orderId, newStatus)
    } catch (error) {
      console.error("Error updating order status:", error)
      alert("Failed to update order status")
    }
  }

  const handleViewDetails = async (order: Order) => {
    setLoadingOrderDetails(true)
    setSelectedOrder(order)
    try {
      // Load product details for order items
      const products = await getProducts()
      const productDetails = order.items
        .map((item) => products.find((p) => p.id === item.productId))
        .filter((p): p is Product => p !== undefined)
      setOrderProducts(productDetails)
    } catch (error) {
      console.error("Error loading order details:", error)
    } finally {
      setLoadingOrderDetails(false)
    }
  }

  const handleCloseDetails = () => {
    setSelectedOrder(null)
    setOrderProducts([])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Delivered":
        return "✅"
      case "Shipped":
        return "📦"
      case "Processing":
        return "⚙️"
      case "Pending":
        return "⏳"
      case "Cancelled":
        return "❌"
      default:
        return "📋"
    }
  }

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Orders</h1>

          {/* Filters */}
          <div className="mb-8 flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading orders...</div>
            ) : (
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                    <th className="text-left px-6 py-4 font-semibold">Order Number</th>
                  <th className="text-left px-6 py-4 font-semibold">Customer</th>
                  <th className="text-left px-6 py-4 font-semibold">Date</th>
                  <th className="text-left px-6 py-4 font-semibold">Amount</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 font-semibold">{order.orderNumber || `#${order.id.slice(-8)}`}</td>
                        <td className="px-6 py-4">
                          {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {order.createdAt.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 font-bold">${order.total.toFixed(2)}</td>
                    <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as Order["status"])
                            }
                            className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${statusColors[order.status]}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-accent hover:opacity-80 transition-opacity font-medium text-sm"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                    ))
                  )}
              </tbody>
            </table>
            )}
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <div>
                      <h2 className="text-2xl font-bold">Order Details</h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {selectedOrder.orderNumber || `Order #${selectedOrder.id.slice(-8)}`}
                      </p>
                    </div>
                    <button
                      onClick={handleCloseDetails}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {loadingOrderDetails ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading order details...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Order Status */}
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Order Status</p>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getStatusIcon(selectedOrder.status)}</span>
                              <span className={`text-lg font-semibold px-3 py-1 rounded ${statusColors[selectedOrder.status]}`}>
                                {selectedOrder.status}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Order Date</p>
                            <p className="font-semibold">{selectedOrder.createdAt.toLocaleDateString()}</p>
                            <p className="text-xs text-muted-foreground">{selectedOrder.createdAt.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div>
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Customer Information
                          </h3>
                          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div>
                              <p className="text-sm text-muted-foreground">Name</p>
                              <p className="font-medium">
                                {selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <a
                                href={`mailto:${selectedOrder.shippingInfo.email}`}
                                className="text-accent hover:underline"
                              >
                                {selectedOrder.shippingInfo.email}
                              </a>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <a
                                href={`tel:${selectedOrder.shippingInfo.phone}`}
                                className="text-foreground hover:text-accent"
                              >
                                {selectedOrder.shippingInfo.phone}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address */}
                        <div>
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Shipping Address
                          </h3>
                          <div className="bg-muted/50 rounded-lg p-4">
                            <p className="font-medium mb-2">
                              {selectedOrder.shippingInfo.firstName} {selectedOrder.shippingInfo.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{selectedOrder.shippingInfo.address}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state}{" "}
                              {selectedOrder.shippingInfo.zipCode}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          <Package className="w-5 h-5" />
                          Order Items ({selectedOrder.items.length})
                        </h3>
                        <div className="space-y-3">
                          {selectedOrder.items.map((item, index) => {
                            const product = orderProducts.find((p) => p.id === item.productId)
                            return (
                              <div key={index} className="bg-muted/50 rounded-lg p-4 flex gap-4">
                                <img
                                  src={product?.image || "/placeholder.svg"}
                                  alt={product?.name || "Product"}
                                  className="w-20 h-20 object-cover rounded"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold">{product?.name || `Product ID: ${item.productId}`}</p>
                                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                  {item.selectedSize && (
                                    <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>
                                  )}
                                  {item.selectedColor && (
                                    <p className="text-sm text-muted-foreground">Color: {item.selectedColor}</p>
                                  )}
                                  {product && (
                                    <p className="font-semibold text-accent mt-2">
                                      ${(product.price * item.quantity).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      {/* Payment & Summary */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Payment Information */}
                        <div>
                          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Payment Information
                          </h3>
                          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Card Name:</span>
                              <span className="font-medium">{selectedOrder.paymentInfo.cardName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Card Number:</span>
                              <span className="font-mono text-sm">
                                **** **** **** {selectedOrder.paymentInfo.cardNumber.slice(-4)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Expiry:</span>
                              <span className="font-medium">{selectedOrder.paymentInfo.cardExpiry}</span>
                            </div>
                          </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                          <h3 className="font-semibold text-lg mb-4">Order Summary</h3>
                          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Subtotal:</span>
                              <span className="font-medium">${selectedOrder.subtotal.toFixed(2)}</span>
                            </div>
                            {selectedOrder.discount && selectedOrder.discount > 0 && (
                              <div className="flex justify-between text-sm text-green-600">
                                <span>Discount ({selectedOrder.couponCode}):</span>
                                <span className="font-medium">-${selectedOrder.discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Shipping:</span>
                              <span className="font-medium">${selectedOrder.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Tax:</span>
                              <span className="font-medium">${selectedOrder.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t border-border pt-3">
                              <span>Total:</span>
                              <span className="text-accent">${selectedOrder.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrdersManagement() {
  return (
    <AdminProvider>
      <OrdersManagementContent />
    </AdminProvider>
  )
}
