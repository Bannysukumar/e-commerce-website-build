"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { getSections, subscribeToSections, saveSection, deleteSection, updateSectionOrder, type HomepageSection, type SectionType, type SectionLayout } from "@/lib/sections-service"
import { Plus, Trash2, Edit2, GripVertical, Save, X } from "lucide-react"
import { subscribeToProducts, type Product } from "@/lib/products-service"

export default function SectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<HomepageSection>>({
    title: "",
    type: "product-section",
    category: "",
    order: 0,
    isActive: true,
    layout: "horizontal-scroll",
    maxProducts: 4,
    backgroundColor: "",
    showTitle: true,
  })

  useEffect(() => {
    const unsubscribe = subscribeToSections((sectionsList) => {
      setSections(sectionsList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToProducts((productsList) => {
      setProducts(productsList)
    })
    return () => unsubscribe()
  }, [])

  // Get unique categories from products
  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort()

  const handleEdit = (section: HomepageSection) => {
    setFormData(section)
    setEditingId(section.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this section?")) {
      try {
        await deleteSection(id)
      } catch (error) {
        console.error("Error deleting section:", error)
        alert("Error deleting section")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.order)) : -1
      const sectionToSave = {
        ...formData,
        order: formData.order ?? maxOrder + 1,
        isActive: formData.isActive ?? true,
        layout: formData.layout ?? "horizontal-scroll",
        showTitle: formData.showTitle ?? true,
      } as Omit<HomepageSection, "id" | "createdAt" | "updatedAt"> & { id?: string }

      if (editingId) {
        sectionToSave.id = editingId
      }

      await saveSection(sectionToSave)
      setShowForm(false)
      setEditingId(null)
      setFormData({
        title: "",
        type: "product-section",
        category: "",
        order: 0,
        isActive: true,
        layout: "horizontal-scroll",
        maxProducts: 4,
        backgroundColor: "",
        showTitle: true,
      })
    } catch (error) {
      console.error("Error saving section:", error)
      alert("Error saving section")
    }
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const sectionIndex = sections.findIndex((s) => s.id === id)
    if (sectionIndex === -1) return

    const newSections = [...sections]
    if (direction === "up" && sectionIndex > 0) {
      const temp = newSections[sectionIndex].order
      newSections[sectionIndex].order = newSections[sectionIndex - 1].order
      newSections[sectionIndex - 1].order = temp
    } else if (direction === "down" && sectionIndex < newSections.length - 1) {
      const temp = newSections[sectionIndex].order
      newSections[sectionIndex].order = newSections[sectionIndex + 1].order
      newSections[sectionIndex + 1].order = temp
    }

    await updateSectionOrder(newSections.map((s) => ({ id: s.id, order: s.order })))
  }

  const toggleActive = async (section: HomepageSection) => {
    await saveSection({
      ...section,
      isActive: !section.isActive,
    })
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <p>Loading sections...</p>
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
            <h1 className="text-3xl font-bold">Homepage Sections</h1>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({
                  title: "",
                  type: "product-section",
                  category: "",
                  order: sections.length > 0 ? Math.max(...sections.map((s) => s.order)) + 1 : 0,
                  isActive: true,
                  layout: "horizontal-scroll",
                  maxProducts: 4,
                  backgroundColor: "",
                  showTitle: true,
                })
              }}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>
          </div>

          {showForm && (
            <div className="bg-white border rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{editingId ? "Edit Section" : "Add New Section"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as SectionType })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="product-section">Product Section</option>
                    <option value="category-section">Category Section</option>
                    <option value="custom-section">Custom Section</option>
                  </select>
                </div>

                {formData.type === "product-section" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={formData.category || ""}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="">All Products</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Max Products</label>
                      <input
                        type="number"
                        value={formData.maxProducts || 4}
                        onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) || 4 })}
                        className="w-full border rounded px-3 py-2"
                        min="1"
                        max="20"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Layout *</label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value as SectionLayout })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="grid">Grid</option>
                    <option value="horizontal-scroll">Horizontal Scroll</option>
                    <option value="masonry">Masonry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Background Color (hex code)</label>
                  <input
                    type="text"
                    value={formData.backgroundColor || ""}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    placeholder="#FFFFFF"
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
                      checked={formData.showTitle ?? true}
                      onChange={(e) => setFormData({ ...formData, showTitle: e.target.checked })}
                    />
                    <span>Show Title</span>
                  </label>
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
                    {editingId ? "Update" : "Create"} Section
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Layout</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sections.map((section, index) => (
                  <tr key={section.id} className={!section.isActive ? "opacity-50" : ""}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleReorder(section.id, "up")}
                          disabled={index === 0}
                          className="disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <span className="font-medium">{section.order}</span>
                        <button
                          onClick={() => handleReorder(section.id, "down")}
                          disabled={index === sections.length - 1}
                          className="disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{section.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{section.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{section.category || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{section.layout}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(section)}
                        className={`px-2 py-1 rounded text-xs ${section.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {section.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(section)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(section.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sections.length === 0 && (
              <div className="p-8 text-center text-gray-500">No sections found. Add your first section above.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
