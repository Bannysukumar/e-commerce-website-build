"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react"
import {
  getCarouselSlides,
  saveCarouselSlide,
  deleteCarouselSlide,
  subscribeToCarouselSlides,
  type CarouselSlide,
} from "@/lib/carousel-service"

function CarouselManagementContent() {
  const [slides, setSlides] = useState<CarouselSlide[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null)
  const [formData, setFormData] = useState({
    imageUrl: "",
    tagline: "",
    title: "",
    categoryLink: "",
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    const unsubscribe = subscribeToCarouselSlides((slidesList) => {
      setSlides(slidesList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleOpenModal = (slide?: CarouselSlide) => {
    if (slide) {
      setEditingSlide(slide)
      setFormData({
        imageUrl: slide.imageUrl,
        tagline: slide.tagline,
        title: slide.title,
        categoryLink: slide.categoryLink,
        order: slide.order,
        isActive: slide.isActive,
      })
    } else {
      setEditingSlide(null)
      setFormData({
        imageUrl: "",
        tagline: "",
        title: "",
        categoryLink: "",
        order: slides.length,
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingSlide(null)
    setFormData({
      imageUrl: "",
      tagline: "",
      title: "",
      categoryLink: "",
      order: 0,
      isActive: true,
    })
  }

  const handleSave = async () => {
    if (!formData.imageUrl || !formData.title) {
      alert("Please fill in all required fields (Image URL and Title)")
      return
    }

    try {
      await saveCarouselSlide({
        id: editingSlide?.id,
        ...formData,
      })
      handleCloseModal()
    } catch (error) {
      console.error("Error saving slide:", error)
      alert("Failed to save slide. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return

    try {
      await deleteCarouselSlide(id)
    } catch (error) {
      console.error("Error deleting slide:", error)
      alert("Failed to delete slide. Please try again.")
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const slide = slides[index]
    const prevSlide = slides[index - 1]
    try {
      await Promise.all([
        saveCarouselSlide({ ...slide, order: prevSlide.order }),
        saveCarouselSlide({ ...prevSlide, order: slide.order }),
      ])
    } catch (error) {
      console.error("Error reordering slides:", error)
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return
    const slide = slides[index]
    const nextSlide = slides[index + 1]
    try {
      await Promise.all([
        saveCarouselSlide({ ...slide, order: nextSlide.order }),
        saveCarouselSlide({ ...nextSlide, order: slide.order }),
      ])
    } catch (error) {
      console.error("Error reordering slides:", error)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Carousel Management</h1>
              <p className="text-muted-foreground mt-2">Manage homepage carousel slides</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add New Slide
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading slides...</p>
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No carousel slides yet</p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Add Your First Slide
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {slides.map((slide, index) => (
                <div key={slide.id} className="bg-card border border-border rounded-lg p-6">
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
                        disabled={index === slides.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="relative h-32 rounded-lg overflow-hidden border border-border">
                        <img src={slide.imageUrl} alt={slide.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <p className="text-sm text-muted-foreground italic">{slide.tagline}</p>
                        <h3 className="text-xl font-bold text-foreground">{slide.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Link: {slide.categoryLink}</p>
                        <p className="text-xs text-muted-foreground mt-1">Order: {slide.order}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded text-sm ${slide.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {slide.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(slide)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(slide.id)}
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
          <div className="bg-background border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">{editingSlide ? "Edit Slide" : "Add New Slide"}</h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-muted rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Image URL <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter the full URL of the image</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tagline (Small Text)</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="À La Carte"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title (Large Text) <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="SHADES"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category Link</label>
                <input
                  type="text"
                  value={formData.categoryLink}
                  onChange={(e) => setFormData({ ...formData, categoryLink: e.target.value })}
                  placeholder="/products?category=shades"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-muted-foreground mt-1">Link to navigate when slide is clicked</p>
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

              {formData.imageUrl && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preview</label>
                  <div className="relative h-48 rounded-lg overflow-hidden border border-border">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center px-8">
                      <div>
                        <p className="text-white/90 italic text-lg mb-2">{formData.tagline || "Tagline"}</p>
                        <h3 className="text-white text-4xl font-bold">{formData.title || "Title"}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Save className="w-5 h-5" />
                  {editingSlide ? "Update Slide" : "Add Slide"}
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

export default function CarouselManagement() {
  return (
    <AdminProvider>
      <CarouselManagementContent />
    </AdminProvider>
  )
}
