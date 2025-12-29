"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import {
  subscribeToCoupons,
  saveCoupon,
  deleteCoupon,
  type Coupon,
  type DiscountType,
} from "@/lib/coupons-service"
import { Plus, Trash2, Edit2, Save, X, Copy, CheckCircle } from "lucide-react"
import { Timestamp } from "firebase/firestore"

function CouponsManagementContent() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    minPurchaseAmount: 0,
    maxDiscountAmount: 0,
    expiryDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
    usageLimit: 100,
    isActive: true,
    description: "",
  })

  useEffect(() => {
    const unsubscribe = subscribeToCoupons((couponsList) => {
      setCoupons(couponsList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleEdit = (coupon: Coupon) => {
    setFormData(coupon)
    setEditingId(coupon.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this coupon?")) {
      try {
        await deleteCoupon(id)
      } catch (error) {
        console.error("Error deleting coupon:", error)
        alert("Error deleting coupon")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.code || !formData.discountValue || !formData.expiryDate) {
      alert("Please fill in all required fields")
      return
    }

    try {
      const couponToSave = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: Number(formData.discountValue),
        usageLimit: Number(formData.usageLimit) || 100,
        minPurchaseAmount: formData.minPurchaseAmount ? Number(formData.minPurchaseAmount) : undefined,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        isActive: formData.isActive ?? true,
      } as Omit<Coupon, "id" | "createdAt" | "updatedAt" | "usedCount"> & { id?: string }

      if (editingId) {
        couponToSave.id = editingId
      }

      await saveCoupon(couponToSave)
      setShowForm(false)
      setEditingId(null)
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minPurchaseAmount: 0,
        maxDiscountAmount: 0,
        expiryDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        usageLimit: 100,
        isActive: true,
        description: "",
      })
    } catch (error) {
      console.error("Error saving coupon:", error)
      alert("Error saving coupon")
    }
  }

  const toggleActive = async (coupon: Coupon) => {
    await saveCoupon({
      ...coupon,
      isActive: !coupon.isActive,
    })
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  const isExpired = (coupon: Coupon) => {
    if (!coupon.expiryDate) return false
    const expiryDate = coupon.expiryDate.toDate ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate)
    return expiryDate < new Date()
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <p>Loading coupons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Coupons</h1>
            <button
              onClick={() => {
                setShowForm(true)
                setEditingId(null)
                setFormData({
                  code: "",
                  discountType: "percentage",
                  discountValue: 0,
                  minPurchaseAmount: 0,
                  maxDiscountAmount: 0,
                  expiryDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
                  usageLimit: 100,
                  isActive: true,
                  description: "",
                })
              }}
              className="flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              Add Coupon
            </button>
          </div>

          {showForm && (
            <div className="bg-card border border-border rounded-lg p-6 mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">{editingId ? "Edit Coupon" : "Add New Coupon"}</h2>
                <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full border rounded px-3 py-2"
                    required
                    placeholder="SWEBIRD10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value as DiscountType })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Discount Value * ({formData.discountType === "percentage" ? "Percentage" : "Amount in ₹"})
                  </label>
                  <input
                    type="number"
                    value={formData.discountValue || 0}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    required
                    min="0"
                    max={formData.discountType === "percentage" ? 100 : undefined}
                    step="0.01"
                  />
                </div>

                {formData.discountType === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Discount Amount ($) - Optional</label>
                    <input
                      type="number"
                      value={formData.maxDiscountAmount || 0}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: parseFloat(e.target.value) || 0 })}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Minimum Purchase Amount (₹) - Optional</label>
                  <input
                    type="number"
                    value={formData.minPurchaseAmount || 0}
                    onChange={(e) => setFormData({ ...formData, minPurchaseAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full border rounded px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date *</label>
                  <input
                    type="datetime-local"
                    value={
                      formData.expiryDate
                        ? new Date(formData.expiryDate.toDate ? formData.expiryDate.toDate() : formData.expiryDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) => {
                      const date = new Date(e.target.value)
                      setFormData({ ...formData, expiryDate: Timestamp.fromDate(date) })
                    }}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Usage Limit (Number of users) *</label>
                  <input
                    type="number"
                    value={formData.usageLimit || 100}
                    onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 100 })}
                    className="w-full border rounded px-3 py-2"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description - Optional</label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={3}
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
                    {editingId ? "Update" : "Create"} Coupon
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

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Code</th>
                  <th className="text-left px-6 py-4 font-semibold">Discount</th>
                  <th className="text-left px-6 py-4 font-semibold">Expiry</th>
                  <th className="text-left px-6 py-4 font-semibold">Usage</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No coupons found. Add your first coupon above.
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{coupon.code}</span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.discountType === "percentage" ? (
                          <span className="font-semibold">{coupon.discountValue}%</span>
                        ) : (
                          <span className="font-semibold">₹{coupon.discountValue.toFixed(2)}</span>
                        )}
                        {coupon.minPurchaseAmount && (
                          <p className="text-xs text-muted-foreground">Min: ₹{coupon.minPurchaseAmount}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={isExpired(coupon) ? "text-red-600" : ""}>{formatDate(coupon.expiryDate)}</span>
                        {isExpired(coupon) && <p className="text-xs text-red-600">Expired</p>}
                      </td>
                      <td className="px-6 py-4">
                        <span>
                          {coupon.usedCount || 0} / {coupon.usageLimit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleActive(coupon)}
                          className={`px-2 py-1 rounded text-xs ${
                            coupon.isActive && !isExpired(coupon)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {isExpired(coupon) ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(coupon)} className="text-purple-600 hover:text-purple-800">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(coupon.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CouponsManagement() {
  return (
    <AdminProvider>
      <CouponsManagementContent />
    </AdminProvider>
  )
}
