"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import {
  getCategories,
  subscribeToCategories,
  saveCategory,
  deleteCategory,
  updateCategoryOrder,
  initializeCategories,
  type Category,
} from "@/lib/categories-service"
import { Plus, Trash2, Edit2, Save, X } from "lucide-react"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Category>>({
    name: "",
    slug: "",
    description: "",
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    // Initialize categories on first load
    initializeCategories().then(() => {
      const unsubscribe = subscribeToCategories((categoriesList) => {
        setCategories(categoriesList)
        setLoading(false)
      })
      return () => unsubscribe()
    })
  }, [])

  const handleEdit = (category: Category) => {
    setFormData(category)
    setEditingId(category.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? Products using this category will not be affected.")) {
      try {
        await deleteCategory(id)
      } catch (error) {
        console.error("Error deleting category:", error)
        alert("Error deleting category")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      alert("Please enter a category name")
      return
    }

    try {
      const maxOrder = categories.length > 0 ? Math.max(...categories.map((c) => c.order)) : -1
      const categoryToSave = {
        ...formData,
        slug: formData.slug || formData.name?.toLowerCase().replace(/\s+/g, "-") || "",
        order: formData.order ?? maxOrder + 1,
        isActive: formData.isActive ?? true,
      } as Omit<Category, "id" | "createdAt" | "updatedAt"> & { id?: string }

      if (editingId) {
        categoryToSave.id = editingId
      }

      await saveCategory(categoryToSave)
      setShowForm(false)
      setEditingId(null)
      setFormData({
        name: "",
        slug: "",
        description: "",
        order: 0,
        isActive: true,
      })
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Error saving category")
    }
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const categoryIndex = categories.findIndex((c) => c.id === id)
    if (categoryIndex === -1) return

    const newCategories = [...categories]
    if (direction === "up" && categoryIndex > 0) {
      const temp = newCategories[categoryIndex].order
      newCategories[categoryIndex].order = newCategories[categoryIndex - 1].order
      newCategories[categoryIndex - 1].order = temp
    } else if (direction === "down" && categoryIndex < newCategories.length - 1) {
      const temp = newCategories[categoryIndex].order
      newCategories[categoryIndex].order = newCategories[categoryIndex + 1].order
      newCategories[categoryIndex + 1].order = temp
    }

    await updateCategoryOrder(newCategories.map((c) => ({ id: c.id, order: c.order })))
  }

  const toggleActive = async (category: Category) => {
    await saveCategory({
      ...category,
      isActive: !category.isActive,
    })
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <p>Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Categories</h1>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({
                  name: "",
                  slug: "",
                  description: "",
                  order: categories.length > 0 ? Math.max(...categories.map((c) => c.order)) + 1 : 0,
                  isActive: true,
                })
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>

          {showForm && (
            <div className="bg-white border rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{editingId ? "Edit Category" : "Add New Category"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setFormData({
                        ...formData,
                        name,
                        slug: formData.slug || name.toLowerCase().replace(/\s+/g, "-"),
                      })
                    }}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Slug (URL-friendly name)</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="auto-generated from name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive ?? true}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span>Active</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90">
                    <Save className="w-4 h-4 inline mr-2" />
                    {editingId ? "Update" : "Create"} Category
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Order</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Slug</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category, index) => (
                  <tr key={category.id} className={!category.isActive ? "opacity-50" : ""}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(category.id, "up")}
                          disabled={index === 0}
                          className="disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <span className="font-medium">{category.order}</span>
                        <button
                          onClick={() => handleReorder(category.id, "down")}
                          disabled={index === categories.length - 1}
                          className="disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{category.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.slug}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{category.description || "-"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(category)}
                        className={`px-2 py-1 rounded text-xs ${category.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {categories.length === 0 && (
              <div className="p-8 text-center text-gray-500">No categories found. Add your first category above.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
