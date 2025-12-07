"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { User, LogOut, Heart, Package, MapPin } from "lucide-react"

function AccountContent() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "addresses">("profile")

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold mb-4">Sign in to view your account</h2>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/login"
                className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="border border-border px-8 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const mockOrders = [
    {
      id: "ORD-001",
      date: "Dec 1, 2024",
      total: "$199.99",
      status: "Delivered",
      items: 2,
    },
    {
      id: "ORD-002",
      date: "Nov 28, 2024",
      total: "$89.99",
      status: "In Transit",
      items: 1,
    },
    {
      id: "ORD-003",
      date: "Nov 15, 2024",
      total: "$349.99",
      status: "Delivered",
      items: 3,
    },
  ]

  const mockAddresses = [
    {
      id: "1",
      name: "Home",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
      default: true,
    },
    {
      id: "2",
      name: "Work",
      address: "456 Business Ave",
      city: "New York",
      state: "NY",
      zip: "10002",
      default: false,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 pb-8 border-b border-border">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Account</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-20">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  activeTab === "profile" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  activeTab === "orders" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                }`}
              >
                <Package className="w-5 h-5" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  activeTab === "addresses" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                }`}
              >
                <MapPin className="w-5 h-5" />
                Addresses
              </button>
              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full flex items-center gap-3 px-6 py-4 transition-colors ${
                  activeTab === "wishlist" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                }`}
              >
                <Heart className="w-5 h-5" />
                Wishlist
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-card border border-border rounded-lg p-8">
                <h2 className="text-2xl font-bold mb-8">Profile Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Member Since</label>
                    <input
                      type="text"
                      defaultValue={new Date(user?.createdAt || new Date()).toLocaleDateString()}
                      disabled
                      className="w-full px-4 py-3 border border-border rounded-lg bg-muted"
                    />
                  </div>
                  <button className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Order History</h2>
                {mockOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-lg p-6 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.date}</p>
                      <p className="text-sm text-muted-foreground">{order.items} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{order.total}</p>
                      <p
                        className={`text-sm font-medium ${
                          order.status === "Delivered" ? "text-green-600" : "text-blue-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Saved Addresses</h2>
                  <button className="bg-accent text-accent-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm">
                    Add Address
                  </button>
                </div>
                {mockAddresses.map((address) => (
                  <div key={address.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{address.name}</h3>
                        {address.default && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Default</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-accent hover:opacity-80 transition-opacity text-sm font-medium">
                          Edit
                        </button>
                        <button className="text-destructive hover:opacity-80 transition-opacity text-sm font-medium">
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{address.address}</p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.state} {address.zip}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                <p className="text-muted-foreground text-center py-12">
                  Your wishlist is empty. Add items from the store!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function AccountPageWrapper() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    )
  }

  return <AccountContent />
}

export default AccountPageWrapper
