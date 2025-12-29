"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { getCustomers } from "@/lib/admin-service"
import { getAllOrders } from "@/lib/orders-service"
import { getUserAddresses } from "@/lib/user-service"
import { Mail, Phone, X, MapPin, Calendar, DollarSign, Package } from "lucide-react"
import type { Order } from "@/lib/orders-service"

function CustomersManagementContent() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [customerAddresses, setCustomerAddresses] = useState<any[]>([])
  const [loadingProfile, setLoadingProfile] = useState(false)

  useEffect(() => {
    loadCustomers()
    // Refresh every 30 seconds
    const interval = setInterval(loadCustomers, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadCustomers = async () => {
    try {
      const customersData = await getCustomers()
      setCustomers(customersData)
      setLoading(false)
    } catch (error) {
      console.error("Error loading customers:", error)
      setLoading(false)
    }
  }

  const handleViewProfile = async (customer: any) => {
    setLoadingProfile(true)
    setSelectedCustomer(customer)
    try {
      // Load customer orders
      const allOrders = await getAllOrders()
      const userOrders = allOrders.filter((order) => order.userId === customer.id)
      setCustomerOrders(userOrders)

      // Load customer addresses
      try {
        const addresses = await getUserAddresses(customer.id)
        setCustomerAddresses(addresses)
      } catch (error) {
        console.error("Error loading addresses:", error)
        setCustomerAddresses([])
      }
    } catch (error) {
      console.error("Error loading customer profile:", error)
    } finally {
      setLoadingProfile(false)
    }
  }

  const handleCloseProfile = () => {
    setSelectedCustomer(null)
    setCustomerOrders([])
    setCustomerAddresses([])
  }

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Customers</h1>

          {/* Customers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
            {loading ? (
              <div className="text-center py-12 col-span-full">
                <p className="text-muted-foreground">Loading customers...</p>
              </div>
            ) : customers.length === 0 ? (
              <div className="text-center py-12 col-span-full">
                <p className="text-muted-foreground">No customers found</p>
              </div>
            ) : (
              customers.map((customer) => (
              <div key={customer.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.joinDate}</p>
                  </div>
                  <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                    {customer.orders} orders
                  </span>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${customer.email}`} className="hover:text-accent transition-colors">
                      {customer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-xl font-bold text-accent">{customer.totalSpent}</p>
                  </div>
                  <button
                    onClick={() => handleViewProfile(customer)}
                    className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm"
                  >
                    View Profile
                  </button>
                </div>
              </div>
              ))
            )}
          </div>

          {/* Customer Profile Modal */}
          {selectedCustomer && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <h2 className="text-2xl font-bold">Customer Profile</h2>
                    <button
                      onClick={handleCloseProfile}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {loadingProfile ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">Loading profile...</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Customer Info */}
                      <div className="bg-muted/50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Name</p>
                            <p className="font-medium">{selectedCustomer.name}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Email</p>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <a
                                href={`mailto:${selectedCustomer.email}`}
                                className="text-accent hover:underline"
                              >
                                {selectedCustomer.email}
                              </a>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Phone</p>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{selectedCustomer.phone}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Join Date</p>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{selectedCustomer.joinDate}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Orders</p>
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{selectedCustomer.orders}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold text-accent">{selectedCustomer.totalSpent}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Addresses */}
                      {customerAddresses.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Saved Addresses</h3>
                          <div className="space-y-3">
                            {customerAddresses.map((address) => (
                              <div
                                key={address.id}
                                className="bg-muted/50 rounded-lg p-4 border border-border"
                              >
                                <div className="flex items-start gap-3">
                                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{address.name}</p>
                                      {address.default && (
                                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{address.address}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {address.city}, {address.state} {address.zip}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Orders */}
                      {customerOrders.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Order History</h3>
                          <div className="space-y-3">
                            {customerOrders
                              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                              .map((order) => (
                                <div
                                  key={order.id}
                                  className="bg-muted/50 rounded-lg p-4 border border-border"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <p className="font-medium">Order #{order.id.slice(-8)}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {order.createdAt.toLocaleDateString()} at{" "}
                                        {order.createdAt.toLocaleTimeString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-semibold text-accent">₹{order.total.toFixed(2)}</p>
                                      <span
                                        className={`text-xs px-2 py-1 rounded ${
                                          order.status === "Delivered"
                                            ? "bg-green-100 text-green-700"
                                            : order.status === "Pending" || order.status === "Processing"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : order.status === "Shipped"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {order.status}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2 pt-2 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                      {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                    </p>
                                    {order.shippingInfo && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        Ship to: {order.shippingInfo.firstName}{" "}
                                        {order.shippingInfo.lastName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {customerOrders.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>No orders found</p>
                        </div>
                      )}
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

export default function CustomersManagement() {
  return (
    <AdminProvider>
      <CustomersManagementContent />
    </AdminProvider>
  )
}
