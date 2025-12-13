"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/lib/cart-context"
import { subscribeToProducts, initializeProducts, type Product } from "@/lib/products-service"
import { CartProvider } from "@/lib/cart-context"
import { CartToast } from "@/components/cart-toast"

function CartContent() {
  const { items, removeFromCart, updateQuantity } = useCart()
  const [products, setProducts] = useState<Product[]>([])
  const [toast, setToast] = useState<{ message: string; type?: "success" | "error" | "info" } | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [updatingQuantity, setUpdatingQuantity] = useState<string | null>(null)

  useEffect(() => {
    initializeProducts().then(() => {
      const unsubscribe = subscribeToProducts((productsList) => {
        setProducts(productsList)
      })
      return () => unsubscribe()
    })
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
  const total = subtotal + shipping + tax

  const handleRemoveItem = async (productId: string) => {
    setRemovingItem(productId)
    setTimeout(() => {
      removeFromCart(productId)
      setToast({ message: "Item removed from cart", type: "success" })
      setRemovingItem(null)
    }, 300)
  }

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId)
      return
    }
    setUpdatingQuantity(productId)
    updateQuantity(productId, newQuantity)
    setToast({ message: "Quantity updated", type: "success" })
    setTimeout(() => setUpdatingQuantity(null), 300)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {toast && (
        <CartToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-12">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8">Add some products to get started</p>
            <Link
              href="/products"
              className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.productId}
                    className={`flex gap-6 border border-border rounded-lg p-6 transition-all duration-300 ${
                      removingItem === item.productId
                        ? "opacity-0 scale-95 -translate-x-4"
                        : "opacity-100 scale-100 translate-x-0"
                    } ${updatingQuantity === item.productId ? "ring-2 ring-accent ring-offset-2" : ""}`}
                  >
                    <img
                      src={item.product?.image || "/placeholder.svg"}
                      alt={item.product?.name}
                      className="w-24 h-24 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{item.product?.name}</h3>
                      {item.selectedColor && (
                        <p className="text-sm text-muted-foreground">Color: {item.selectedColor}</p>
                      )}
                      {item.selectedSize && <p className="text-sm text-muted-foreground">Size: {item.selectedSize}</p>}
                      <p className="font-bold text-lg mt-2 transition-all duration-300">
                        ₹{((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-4">
                      <div className="flex items-center gap-2 border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                          disabled={updatingQuantity === item.productId}
                          className="px-3 py-2 hover:bg-muted rounded-l transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-semibold transition-all duration-300">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                          disabled={updatingQuantity === item.productId}
                          className="px-3 py-2 hover:bg-muted rounded-r transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded transition-all duration-200 hover:scale-110 active:scale-95"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-border rounded-lg p-8 sticky top-24 space-y-6">
                <h2 className="text-xl font-bold">Order Summary</h2>

                <div className="space-y-3 border-b border-border pb-6">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>₹{shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-lg transition-all duration-300">
                  <span>Total</span>
                  <span className="transition-all duration-300">₹{total.toFixed(2)}</span>
                </div>

                <Link
                  href="/checkout"
                  className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-semibold text-center hover:opacity-90 transition-opacity block"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="w-full border border-border py-3 rounded-lg font-semibold text-center hover:bg-muted transition-colors block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default function CartPage() {
  return (
    <CartProvider>
      <CartContent />
    </CartProvider>
  )
}
