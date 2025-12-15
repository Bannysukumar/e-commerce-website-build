"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, X, Upload, Loader2 } from "lucide-react"
import { uploadVideo, isVideoFile } from "@/lib/storage-service"
import {
  getFeaturedProducts,
  saveFeaturedProduct,
  deleteFeaturedProduct,
  subscribeToFeaturedProducts,
  type FeaturedProduct,
} from "@/lib/featured-products-service"
import { getProducts, type Product } from "@/lib/products-service"

function FeaturedProductsManagementContent() {
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFeatured, setEditingFeatured] = useState<FeaturedProduct | null>(null)
  const [formData, setFormData] = useState({
    productId: "",
    tagline: "",
    videoUrl: "",
    order: 0,
    isActive: true,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    // Load all products
    getProducts().then((products) => {
      setAllProducts(products)
    })

    // Subscribe to featured products
    const unsubscribe = subscribeToFeaturedProducts((featured) => {
      setFeaturedProducts(featured)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleOpenModal = (featured?: FeaturedProduct) => {
    if (featured) {
      setEditingFeatured(featured)
      setVideoFile(null)
      setUploadProgress(0)
      setFormData({
        productId: featured.productId,
        tagline: featured.tagline || "",
        videoUrl: featured.videoUrl || "",
        order: featured.order,
        isActive: featured.isActive,
      })
    } else {
      setEditingFeatured(null)
      setVideoFile(null)
      setUploadProgress(0)
      setFormData({
        productId: "",
        tagline: "",
        videoUrl: "",
        order: featuredProducts.length,
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingFeatured(null)
    setVideoFile(null)
    setUploadProgress(0)
    setFormData({
      productId: "",
      tagline: "",
      videoUrl: "",
      order: 0,
      isActive: true,
    })
  }

  const handleSave = async () => {
    if (!formData.productId) {
      alert("Please select a product")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      let videoUrl = formData.videoUrl

      // Upload video if a file is selected
      if (videoFile) {
        if (!isVideoFile(videoFile)) {
          alert("Please select a video file")
          setIsUploading(false)
          return
        }
        videoUrl = await uploadVideo(videoFile, "featured", undefined, (progress) => {
          setUploadProgress(progress)
        })
      }

      await saveFeaturedProduct({
        id: editingFeatured?.id,
        ...formData,
        videoUrl,
      })
      handleCloseModal()
    } catch (error) {
      console.error("Error saving featured product:", error)
      alert("Failed to save. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!isVideoFile(file)) {
        alert("Please select a video file")
        return
      }
      setVideoFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setFormData({ ...formData, videoUrl: previewUrl })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from featured?")) return

    try {
      await deleteFeaturedProduct(id)
    } catch (error) {
      console.error("Error deleting featured product:", error)
      alert("Failed to delete. Please try again.")
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const featured = featuredProducts[index]
    const prevFeatured = featuredProducts[index - 1]
    try {
      await Promise.all([
        saveFeaturedProduct({ ...featured, order: prevFeatured.order }),
        saveFeaturedProduct({ ...prevFeatured, order: featured.order }),
      ])
    } catch (error) {
      console.error("Error reordering:", error)
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === featuredProducts.length - 1) return
    const featured = featuredProducts[index]
    const nextFeatured = featuredProducts[index + 1]
    try {
      await Promise.all([
        saveFeaturedProduct({ ...featured, order: nextFeatured.order }),
        saveFeaturedProduct({ ...nextFeatured, order: featured.order }),
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
              <h1 className="text-3xl font-bold text-foreground">Story Featured Products</h1>
              <p className="text-muted-foreground mt-2">Manage products displayed in story/reel format on homepage</p>
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
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No featured products yet</p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {featuredProducts.map((featured, index) => {
                  const product = allProducts.find((p) => p.id === featured.productId)
                  if (!product) return null

                  return (
                    <div key={featured.id} className="flex-shrink-0 w-[280px] bg-card border border-border rounded-lg p-4">
                      <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-muted mb-3">
                        {featured.videoUrl ? (
                          <video
                            src={featured.videoUrl}
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {featured.tagline && (
                          <div className="absolute top-4 left-4 right-4 z-10">
                            <p className="text-white text-sm font-medium drop-shadow-lg">{featured.tagline}</p>
                          </div>
                        )}
                        {featured.videoUrl && (
                          <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded z-10">
                            Video
                          </div>
                        )}
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
                            disabled={index === featuredProducts.length - 1}
                            className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(featured)}
                            className="p-2 hover:bg-muted rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(featured.id)}
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
                {editingFeatured ? "Edit Featured Product" : "Add Featured Product"}
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

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tagline (Optional)</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Why wear a smartwatch when you could wear this ✨"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">This text will appear as an overlay on the image/video</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Video (Optional)</label>
                <div className="space-y-2">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted/50 transition-colors flex items-center justify-center gap-2 cursor-pointer">
                      <Upload className="w-5 h-5" />
                      <span>{videoFile ? videoFile.name : "Choose Video from Gallery"}</span>
                    </div>
                  </label>
                  {videoFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null)
                        setFormData({ ...formData, videoUrl: "" })
                      }}
                      className="text-sm text-destructive hover:underline"
                    >
                      Remove video
                    </button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload a video to display instead of the product image. Video will auto-play when scrolled into view.
                  <br />
                  Supported formats: MP4, WebM, MOV
                </p>
              </div>

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

              {selectedProduct && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preview</label>
                  <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-muted border border-border">
                    {formData.videoUrl ? (
                      <video
                        src={formData.videoUrl}
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        autoPlay
                      />
                    ) : (
                      <img
                        src={selectedProduct.image || "/placeholder.svg"}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {formData.tagline && (
                      <div className="absolute top-4 left-4 right-4 z-10">
                        <p className="text-white text-sm font-medium drop-shadow-lg">{formData.tagline}</p>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 p-3 bg-background/80 rounded z-10">
                      <h3 className="font-medium text-sm">{selectedProduct.name}</h3>
                      <p className="text-sm font-semibold">₹{selectedProduct.price.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isUploading}
                  className="flex-1 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Uploading... {Math.round(uploadProgress)}%</span>
                    </>
                  ) : (
                    editingFeatured ? "Update" : "Add Product"
                  )}
                </button>
                <button
                  onClick={handleCloseModal}
                  disabled={isUploading}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

export default function FeaturedProductsManagement() {
  return (
    <AdminProvider>
      <FeaturedProductsManagementContent />
    </AdminProvider>
  )
}
