"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react"
import {
  getAllPromotionalBanners,
  savePromotionalBanner,
  deletePromotionalBanner,
  subscribeToAllPromotionalBanners,
  type PromotionalBanner,
} from "@/lib/promotional-banners-service"

function PromotionalBannersManagementContent() {
  const [banners, setBanners] = useState<PromotionalBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<PromotionalBanner | null>(null)
  const [formData, setFormData] = useState({
    text: "",
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    const unsubscribe = subscribeToAllPromotionalBanners((bannersList) => {
      setBanners(bannersList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleOpenModal = (banner?: PromotionalBanner) => {
    if (banner) {
      setEditingBanner(banner)
      setFormData({
        text: banner.text,
        order: banner.order,
        isActive: banner.isActive,
      })
    } else {
      setEditingBanner(null)
      setFormData({
        text: "",
        order: banners.length,
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingBanner(null)
    setFormData({
      text: "",
      order: 0,
      isActive: true,
    })
  }

  const handleSave = async () => {
    if (!formData.text.trim()) {
      alert("Please enter the promotional text")
      return
    }

    try {
      await savePromotionalBanner({
        id: editingBanner?.id,
        ...formData,
      })
      handleCloseModal()
    } catch (error) {
      console.error("Error saving banner:", error)
      alert("Failed to save banner. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional banner?")) return

    try {
      await deletePromotionalBanner(id)
    } catch (error) {
      console.error("Error deleting banner:", error)
      alert("Failed to delete banner. Please try again.")
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const banner = banners[index]
    const prevBanner = banners[index - 1]
    try {
      await Promise.all([
        savePromotionalBanner({ ...banner, order: prevBanner.order }),
        savePromotionalBanner({ ...prevBanner, order: banner.order }),
      ])
    } catch (error) {
      console.error("Error reordering banners:", error)
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return
    const banner = banners[index]
    const nextBanner = banners[index + 1]
    try {
      await Promise.all([
        savePromotionalBanner({ ...banner, order: nextBanner.order }),
        savePromotionalBanner({ ...nextBanner, order: banner.order }),
      ])
    } catch (error) {
      console.error("Error reordering banners:", error)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Promotional Banners</h1>
              <p className="text-muted-foreground mt-2">Manage promotional messages displayed in the header</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add New Banner
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No promotional banners yet</p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Add Your First Banner
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {banners.map((banner, index) => (
                <div key={banner.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === banners.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1">
                      <div className="bg-black text-white py-2 px-4 rounded mb-2">
                        <p className="text-sm font-medium">{banner.text}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">Order: {banner.order}</span>
                        <span className={`px-3 py-1 rounded text-sm ${banner.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(banner)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{editingBanner ? "Edit Banner" : "Add New Banner"}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-muted rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Promotional Text <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="GET 10% OFF ON YOUR FIRST ORDER. USE CODE SWEBIRD10."
                  rows={3}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter the promotional message to display in the header banner</p>
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

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Preview</label>
                <div className="bg-black text-white py-2 px-4 rounded">
                  <p className="text-sm font-medium">{formData.text || "Enter promotional text to see preview"}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save className="w-5 h-5" />
                  {editingBanner ? "Update Banner" : "Add Banner"}
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

export default function PromotionalBannersManagement() {
  return (
    <AdminProvider>
      <PromotionalBannersManagementContent />
    </AdminProvider>
  )
}

