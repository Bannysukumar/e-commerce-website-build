"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { subscribeToProducts, saveProduct, deleteProduct, initializeProducts, type Product } from "@/lib/products-service"
import { subscribeToCategories, initializeCategories, type Category } from "@/lib/categories-service"
import { AdminProvider } from "@/lib/admin-context"
import { createNotification } from "@/lib/newsletter-service"
import { Plus, Edit, Trash2, Search, X } from "lucide-react"

function ProductsManagementContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    originalPrice: "",
    category: "",
    subcategory: "",
    gender: "",
    description: "",
    image: "",
    images: [] as string[],
    inStock: true,
  })
  const [sendNotification, setSendNotification] = useState(false)
  const [additionalImageUrl, setAdditionalImageUrl] = useState("")

  // Initialize products and categories on first load
  useEffect(() => {
    initializeProducts().then(() => {
      setLoading(false)
    })
    initializeCategories().then(() => {
      const unsubscribe = subscribeToCategories((categoriesList) => {
        setCategories(categoriesList.filter((c) => c.isActive))
      })
      return () => unsubscribe()
    })
  }, [])

  // Subscribe to products
  useEffect(() => {
    const unsubscribe = subscribeToProducts((productsList) => {
      setProducts(productsList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.category || !formData.image) {
      alert("Please fill in all required fields (Name, Price, Category, and Image URL)")
      return
    }

    // Filter out empty image URLs
    const imagesArray = formData.images.filter((url) => url.trim().length > 0)

    const product: any = {
      id: editingProduct?.id || `product_${Date.now()}`,
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category,
      subcategory: formData.subcategory || "",
      rating: editingProduct?.rating || 0,
      reviews: editingProduct?.reviews || 0,
      inStock: formData.inStock,
      description: formData.description,
      images: imagesArray.length > 0 ? imagesArray : [formData.image],
      createdAt: editingProduct?.createdAt || new Date(),
    }
    
    // Only add optional fields if they have values
    if (formData.originalPrice && formData.originalPrice.trim() !== "") {
      product.originalPrice = parseFloat(formData.originalPrice)
    }
    if (formData.gender && formData.gender.trim() !== "") {
      product.gender = formData.gender
    }
    if (editingProduct?.size && editingProduct.size.length > 0) {
      product.size = editingProduct.size
    }
    if (editingProduct?.colors && editingProduct.colors.length > 0) {
      product.colors = editingProduct.colors
    }

    try {
      await saveProduct(product)
      
      // Send notification if it's a new product and notification is enabled
      if (!editingProduct && sendNotification) {
        try {
          await createNotification({
            type: "new_product",
            title: "New Product Added!",
            message: `Check out our new product: ${product.name}`,
            link: `/product/${product.id}`,
          })
        } catch (notifError) {
          console.error("Error creating notification:", notifError)
          // Don't fail the product save if notification fails
        }
      }
      
      setShowModal(false)
      setEditingProduct(null)
      setSendNotification(false)
      setFormData({
        name: "",
        price: "",
        originalPrice: "",
        category: "",
        subcategory: "",
        gender: "",
        description: "",
        image: "",
        images: [],
        inStock: true,
      })
      setAdditionalImageUrl("")
    } catch (error) {
      console.error("Error saving product:", error)
      alert("Failed to save product")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id)
      } catch (error) {
        console.error("Error deleting product:", error)
        alert("Failed to delete product")
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setSendNotification(false) // Don't send notification when editing
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || "",
      category: product.category,
      subcategory: product.subcategory,
      gender: product.gender || "",
      description: product.description,
      image: product.image || "",
      images: product.images && product.images.length > 0 ? product.images : [],
      inStock: product.inStock,
    })
    setAdditionalImageUrl("")
    setShowModal(true)
  }

  const handleAddImageUrl = () => {
    if (additionalImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, additionalImageUrl.trim()],
      })
      setAdditionalImageUrl("")
    }
  }

  const handleRemoveImageUrl = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold">Products</h1>
            <button
              onClick={() => {
                setEditingProduct(null)
                setSendNotification(false)
                setAdditionalImageUrl("")
                setFormData({
                  name: "",
                  price: "",
                  originalPrice: "",
                  category: "",
                  subcategory: "",
                  gender: "",
                  description: "",
                  image: "",
                  images: [],
                  inStock: true,
                })
                setShowModal(true)
              }}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading products...</div>
            ) : (
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold">Product</th>
                    <th className="text-left px-6 py-4 font-semibold">Category</th>
                    <th className="text-left px-6 py-4 font-semibold">Price</th>
                    <th className="text-left px-6 py-4 font-semibold">Stock</th>
                    <th className="text-left px-6 py-4 font-semibold">Rating</th>
                    <th className="text-left px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                            />
                            <span className="font-medium">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{product.category}</td>
                        <td className="px-6 py-4 font-bold">₹{product.price.toFixed(2)}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.inStock ? "In Stock" : "Out"}
                          </span>
                        </td>
                        <td className="px-6 py-4">{product.rating.toFixed(1)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 hover:bg-muted rounded transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">{editingProduct ? "Edit Product" : "Add Product"}</h2>

                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="Product Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Price *"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      <input
                        type="number"
                        placeholder="Original Price (optional)"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>
                    <input
                      type="url"
                      placeholder="Main Image URL *"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {formData.image && (
                      <div className="relative h-32 rounded-lg overflow-hidden border border-border">
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium">Additional Images (Optional)</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter image URL"
                          value={additionalImageUrl}
                          onChange={(e) => setAdditionalImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddImageUrl()
                            }
                          }}
                          className="flex-1 px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold whitespace-nowrap"
                        >
                          Add URL
                        </button>
                      </div>
                      {formData.images.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {formData.images.map((url, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-muted-foreground truncate">{url}</p>
                                {url && (
                                  <div className="relative h-16 rounded overflow-hidden border border-border mt-2">
                                    <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveImageUrl(index)}
                                className="p-2 hover:bg-destructive/10 rounded transition-colors text-destructive"
                                aria-label="Remove image"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Select Category *</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Subcategory (optional)"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Select Gender (GIRLS | BOYS) - Optional</option>
                      <option value="GIRLS">GIRLS</option>
                      <option value="BOYS">BOYS</option>
                    </select>
                    <textarea
                      placeholder="Description"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span>In Stock</span>
                    </label>
                    {!editingProduct && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={sendNotification}
                          onChange={(e) => setSendNotification(e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span>Notify subscribers about this new product</span>
                      </label>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowModal(false)
                        setEditingProduct(null)
                        setSendNotification(false)
                        setAdditionalImageUrl("")
                      setFormData({
                        name: "",
                        price: "",
                        originalPrice: "",
                        category: "",
                        subcategory: "",
                        gender: "",
                        description: "",
                        image: "",
                        images: [],
                        inStock: true,
                      })
                      }}
                      className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsManagement() {
  return (
    <AdminProvider>
      <ProductsManagementContent />
    </AdminProvider>
  )
}
