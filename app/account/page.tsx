"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/lib/auth-context"
import { useWishlist } from "@/lib/wishlist-context"
import { subscribeToUserOrders, type Order } from "@/lib/orders-service"
import { subscribeToUserAddresses, addAddress, updateAddress, deleteAddress, updateUserProfile, type Address } from "@/lib/user-service"
import { getProducts, type Product } from "@/lib/products-service"
import { User, LogOut, Heart, Package, MapPin, Plus, Edit, Trash2 } from "lucide-react"
import { ProductCard } from "@/components/product-card"

function AccountContent() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useAuth()
  const { items: wishlistItems, removeFromWishlist } = useWishlist()
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "addresses">("profile")
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loadingAddresses, setLoadingAddresses] = useState(true)
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loadingWishlist, setLoadingWishlist] = useState(true)
  const [profileName, setProfileName] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressForm, setAddressForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    default: false,
  })

  // Load orders from Firestore - MUST be called before any conditional returns
  useEffect(() => {
    if (isLoggedIn && user) {
      const unsubscribe = subscribeToUserOrders(user.id, (userOrders) => {
        setOrders(userOrders)
        setLoadingOrders(false)
      })
      return () => unsubscribe()
    } else {
      setLoadingOrders(false)
    }
  }, [isLoggedIn, user])

  // Load addresses from Firestore
  useEffect(() => {
    if (isLoggedIn && user) {
      const unsubscribe = subscribeToUserAddresses(user.id, (userAddresses) => {
        setAddresses(userAddresses)
        setLoadingAddresses(false)
      })
      return () => unsubscribe()
    } else {
      setLoadingAddresses(false)
    }
  }, [isLoggedIn, user])

  // Load wishlist products
  useEffect(() => {
    if (isLoggedIn && user && wishlistItems.length > 0) {
      const loadProducts = async () => {
        const allProducts = await getProducts()
        const products = allProducts.filter((p) => wishlistItems.includes(p.id))
        setWishlistProducts(products)
        setLoadingWishlist(false)
      }
      loadProducts()
    } else {
      setWishlistProducts([])
      setLoadingWishlist(false)
    }
  }, [isLoggedIn, user, wishlistItems])

  // Initialize profile name
  useEffect(() => {
    if (user?.name) {
      setProfileName(user.name)
    }
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleSaveProfile = async () => {
    if (!user || !profileName.trim()) {
      alert("Please enter a valid name")
      return
    }
    setSavingProfile(true)
    try {
      await updateUserProfile(user.id, profileName.trim())
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    } finally {
      setSavingProfile(false)
    }
  }

  const handleAddAddress = () => {
    setEditingAddress(null)
    setAddressForm({
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      default: addresses.length === 0,
    })
    setShowAddressModal(true)
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setAddressForm({
      name: address.name,
      address: address.address,
      city: address.city,
      state: address.state,
      zip: address.zip,
      default: address.default,
    })
    setShowAddressModal(true)
  }

  const handleSaveAddress = async () => {
    if (!user) return
    if (!addressForm.name || !addressForm.address || !addressForm.city || !addressForm.state || !addressForm.zip) {
      alert("Please fill in all fields")
      return
    }
    try {
      if (editingAddress) {
        await updateAddress(user.id, editingAddress.id, addressForm)
      } else {
        await addAddress(user.id, addressForm)
      }
      setShowAddressModal(false)
      setAddressForm({
        name: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        default: false,
      })
    } catch (error) {
      console.error("Error saving address:", error)
      alert("Failed to save address. Please try again.")
    }
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteAddress(user.id, addressId)
      } catch (error) {
        console.error("Error deleting address:", error)
        alert("Failed to delete address. Please try again.")
      }
    }
  }

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
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full px-4 py-3 border border-border rounded-lg bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Member Since</label>
                    <input
                      type="text"
                      value={new Date(user?.createdAt || new Date()).toLocaleDateString()}
                      disabled
                      className="w-full px-4 py-3 border border-border rounded-lg bg-muted"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {savingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-6">Order History</h2>
                {loadingOrders ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No orders found</p>
                  </div>
                ) : (
                  orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-card border border-border rounded-lg p-6 flex items-center justify-between"
                  >
                    <div>
                        <p className="font-semibold">#{order.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.createdAt.toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">₹{order.total.toFixed(2)}</p>
                      <p
                        className={`text-sm font-medium ${
                            order.status === "Delivered"
                              ? "text-green-600"
                              : order.status === "Shipped"
                                ? "text-purple-600"
                                : order.status === "Processing"
                                  ? "text-yellow-600"
                                  : "text-gray-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Saved Addresses</h2>
                  <button
                    onClick={handleAddAddress}
                    className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Address
                  </button>
                </div>
                {loadingAddresses ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading addresses...</p>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No saved addresses. Add your first address to get started.</p>
                  </div>
                ) : (
                  addresses.map((address) => (
                  <div key={address.id} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{address.name}</h3>
                        {address.default && (
                          <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">Default</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-accent hover:opacity-80 transition-opacity text-sm font-medium"
                          >
                            <Edit className="w-4 h-4 inline mr-1" />
                          Edit
                        </button>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-destructive hover:opacity-80 transition-opacity text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4 inline mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-muted-foreground">{address.address}</p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.state} {address.zip}
                    </p>
                  </div>
                  ))
                )}

                {/* Address Modal */}
                {showAddressModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
                      <h3 className="text-xl font-bold mb-4">{editingAddress ? "Edit Address" : "Add Address"}</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Address Name</label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            placeholder="Home, Work, etc."
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Street Address</label>
                          <input
                            type="text"
                            value={addressForm.address}
                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">City</label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">State</label>
                            <input
                              type="text"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">ZIP Code</label>
                          <input
                            type="text"
                            value={addressForm.zip}
                            onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={addressForm.default}
                            onChange={(e) => setAddressForm({ ...addressForm, default: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Set as default address</span>
                        </label>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button
                          onClick={() => setShowAddressModal(false)}
                          className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveAddress}
                          className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                {loadingWishlist ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading wishlist...</p>
                  </div>
                ) : wishlistProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground text-lg mb-2">Your wishlist is empty</p>
                    <p className="text-muted-foreground text-sm">Add items from the store to see them here!</p>
                    <Link
                      href="/products"
                      className="inline-block mt-4 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistProducts.map((product) => (
                      <div key={product.id} className="relative">
                        <ProductCard product={product} />
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="absolute top-2 right-2 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-destructive/10 text-destructive transition-colors"
                          title="Remove from wishlist"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
