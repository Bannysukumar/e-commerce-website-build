"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, X } from "lucide-react"
import {
  getTrendingProducts,
  saveTrendingProduct,
  deleteTrendingProduct,
  subscribeToTrendingProducts,
  type TrendingProduct,
} from "@/lib/trending-products-service"
import { getProducts, type Product } from "@/lib/products-service"

function TrendingProductsManagementContent() {
  const [trendingProducts, setTrendingProducts] = useState<TrendingProduct[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTrending, setEditingTrending] = useState<TrendingProduct | null>(null)
  const [formData, setFormData] = useState({
    productId: "",
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    // Load all products
    getProducts().then((products) => {
      setAllProducts(products)
    })

    // Subscribe to trending products
    const unsubscribe = subscribeToTrendingProducts((trending) => {
      setTrendingProducts(trending)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleOpenModal = (trending?: TrendingProduct) => {
    if (trending) {
      setEditingTrending(trending)
      setFormData({
        productId: trending.productId,
        order: trending.order,
        isActive: trending.isActive,
      })
    } else {
      setEditingTrending(null)
      setFormData({
        productId: "",
        order: trendingProducts.length,
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTrending(null)
    setFormData({
      productId: "",
      order: 0,
      isActive: true,
    })
  }

  const handleSave = async () => {
    if (!formData.productId) {
      alert("Please select a product")
      return
    }

    try {
      await saveTrendingProduct({
        id: editingTrending?.id,
        ...formData,
      })
      handleCloseModal()
    } catch (error) {
      console.error("Error saving trending product:", error)
      alert("Failed to save. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from trending?")) return

    try {
      await deleteTrendingProduct(id)
    } catch (error) {
      console.error("Error deleting trending product:", error)
      alert("Failed to delete. Please try again.")
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const trending = trendingProducts[index]
    const prevTrending = trendingProducts[index - 1]
    try {
      await Promise.all([
        saveTrendingProduct({ ...trending, order: prevTrending.order }),
        saveTrendingProduct({ ...prevTrending, order: trending.order }),
      ])
    } catch (error) {
      console.error("Error reordering:", error)
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === trendingProducts.length - 1) return
    const trending = trendingProducts[index]
    const nextTrending = trendingProducts[index + 1]
    try {
      await Promise.all([
        saveTrendingProduct({ ...trending, order: nextTrending.order }),
        saveTrendingProduct({ ...nextTrending, order: trending.order }),
      ])
    } catch (error) {
      console.error("Error reordering:", error)
    }
  }

  const selectedProduct = allProducts.find((p) => p.id === formData.productId)

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Trending Products</h1>
              <p className="text-muted-foreground mt-2">Manage products displayed in the TRENDING NOW section on homepage</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : trendingProducts.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No trending products yet</p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {trendingProducts.map((trending, index) => {
                const product = allProducts.find((p) => p.id === trending.productId)
                if (!product) return null

                return (
                  <div key={trending.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-1 mb-4">
                      <h3 className="font-medium text-sm text-foreground line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">₹{product.price.toFixed(0)}</span>
                        {product.originalPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            ₹{product.originalPrice.toFixed(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === trendingProducts.length - 1}
                          className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(trending)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(trending.id)}
                          className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">
                {editingTrending ? "Edit Trending Product" : "Add Trending Product"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-muted rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Product <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="">Choose a product...</option>
                  {allProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - ₹{product.price.toFixed(0)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex gap-4">
                    <img
                      src={selectedProduct.image || "/placeholder.svg"}
                      alt={selectedProduct.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h3 className="font-medium">{selectedProduct.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedProduct.category}</p>
                      <p className="text-sm font-semibold">₹{selectedProduct.price.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                  <select
                    value={formData.isActive ? "active" : "inactive"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
                    className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingTrending ? "Update" : "Add Product"}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrendingProductsManagement() {
  return (
    <AdminProvider>
      <TrendingProductsManagementContent />
    </AdminProvider>
  )
}

