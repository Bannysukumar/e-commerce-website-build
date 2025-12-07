"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { products } from "@/lib/products-data"
import { AdminProvider } from "@/lib/admin-context"
import { Plus, Edit, Trash2, Search } from "lucide-react"

function ProductsManagementContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

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
                {filteredProducts.map((product) => (
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
                    <td className="px-6 py-4 font-bold">${product.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          product.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {product.inStock ? "In Stock" : "Out"}
                      </span>
                    </td>
                    <td className="px-6 py-4">{product.rating}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingProduct(product.id)
                            setShowModal(true)
                          }}
                          className="p-2 hover:bg-muted rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-6">{editingProduct ? "Edit Product" : "Add Product"}</h2>

                  <div className="space-y-4 mb-6">
                    <input
                      type="text"
                      placeholder="Product Name"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    <select className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent">
                      <option>Select Category</option>
                      <option>Fashion</option>
                      <option>Electronics</option>
                      <option>Accessories</option>
                      <option>Sports</option>
                    </select>
                    <textarea
                      placeholder="Description"
                      rows={4}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-muted transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
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
