"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, X, Star } from "lucide-react"
import {
  getTestimonials,
  saveTestimonial,
  deleteTestimonial,
  subscribeToTestimonials,
  type Testimonial,
} from "@/lib/testimonials-service"

function TestimonialsManagementContent() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    rating: 5,
    review: "",
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    const unsubscribe = subscribeToTestimonials((testimonialsList) => {
      setTestimonials(testimonialsList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial)
      setFormData({
        name: testimonial.name,
        role: testimonial.role,
        image: testimonial.image,
        rating: testimonial.rating,
        review: testimonial.review,
        order: testimonial.order,
        isActive: testimonial.isActive,
      })
    } else {
      setEditingTestimonial(null)
      setFormData({
        name: "",
        role: "",
        image: "",
        rating: 5,
        review: "",
        order: testimonials.length,
        isActive: true,
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTestimonial(null)
    setFormData({
      name: "",
      role: "",
      image: "",
      rating: 5,
      review: "",
      order: 0,
      isActive: true,
    })
  }

  const handleSave = async () => {
    if (!formData.name || !formData.role || !formData.review) {
      alert("Please fill in all required fields (Name, Role, and Review)")
      return
    }

    try {
      await saveTestimonial({
        id: editingTestimonial?.id,
        ...formData,
      })
      handleCloseModal()
    } catch (error) {
      console.error("Error saving testimonial:", error)
      alert("Failed to save. Please try again.")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      await deleteTestimonial(id)
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      alert("Failed to delete. Please try again.")
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const testimonial = testimonials[index]
    const prevTestimonial = testimonials[index - 1]
    try {
      await Promise.all([
        saveTestimonial({ ...testimonial, order: prevTestimonial.order }),
        saveTestimonial({ ...prevTestimonial, order: testimonial.order }),
      ])
    } catch (error) {
      console.error("Error reordering:", error)
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index === testimonials.length - 1) return
    const testimonial = testimonials[index]
    const nextTestimonial = testimonials[index + 1]
    try {
      await Promise.all([
        saveTestimonial({ ...testimonial, order: nextTestimonial.order }),
        saveTestimonial({ ...nextTestimonial, order: testimonial.order }),
      ])
    } catch (error) {
      console.error("Error reordering:", error)
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Customer Testimonials</h1>
              <p className="text-muted-foreground mt-2">Manage customer reviews and testimonials</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Testimonial
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No testimonials yet</p>
              <button
                onClick={() => handleOpenModal()}
                className="bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                Add Your First Testimonial
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start gap-6">
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
                        disabled={index === testimonials.length - 1}
                        className="p-1 hover:bg-muted rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={testimonial.image || "/placeholder.svg"}
                          alt={testimonial.name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-border"
                        />
                        <div>
                          <h3 className="font-bold text-foreground">{testimonial.name}</h3>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < testimonial.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-gray-300 text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-muted-foreground line-clamp-3">{testimonial.review}</p>
                        <p className="text-xs text-muted-foreground mt-2">Order: {testimonial.order}</p>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                            testimonial.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {testimonial.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(testimonial)}
                        className="p-2 hover:bg-muted rounded transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
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
              <h2 className="text-2xl font-bold text-foreground">
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 hover:bg-muted rounded transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dixtia Patel"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role/Profession <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Fashion Influencer"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Customer Image URL <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/profile.jpg"
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-border"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Rating <span className="text-destructive">*</span>
                </label>
                <div className="flex gap-2 items-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating })}
                      className={`p-2 rounded transition-colors ${
                        formData.rating >= rating
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          formData.rating >= rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-300 text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">{formData.rating} / 5</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Review Text <span className="text-destructive">*</span>
                </label>
                <textarea
                  value={formData.review}
                  onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                  placeholder="Preery good stuff salty! They are helpful, and go the extra mile to ensure customer satisfaction..."
                  rows={5}
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
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
              {formData.name && formData.role && formData.review && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Preview</label>
                  <div className="bg-white rounded-lg p-6 shadow-lg border border-border">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < formData.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-300 text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-gray-700 mb-6 leading-relaxed">{formData.review}</p>
                    <div className="flex flex-col items-center text-center">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt={formData.name}
                          className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-200 mb-3"></div>
                      )}
                      <h3 className="font-bold text-gray-900 text-lg">{formData.name}</h3>
                      <p className="text-gray-600 text-sm">{formData.role}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  {editingTestimonial ? "Update" : "Add Testimonial"}
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

export default function TestimonialsManagement() {
  return (
    <AdminProvider>
      <TestimonialsManagementContent />
    </AdminProvider>
  )
}
