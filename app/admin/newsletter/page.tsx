"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import {
  getActiveSubscribers,
  subscribeToSubscribers,
  createNotification,
  getNotifications,
  subscribeToNotifications,
  type NewsletterSubscriber,
  type Notification,
} from "@/lib/newsletter-service"
import { Bell, Mail, Users, Send, X } from "lucide-react"

function NewsletterManagementContent() {
  const [activeTab, setActiveTab] = useState<"subscribers" | "notifications" | "send">("subscribers")
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showSendModal, setShowSendModal] = useState(false)
  const [notificationForm, setNotificationForm] = useState({
    type: "new_product" as "new_product" | "new_offer" | "general",
    title: "",
    message: "",
    link: "",
  })
  const [sending, setSending] = useState(false)

  // Subscribe to subscribers
  useEffect(() => {
    const unsubscribe = subscribeToSubscribers((subs) => {
      setSubscribers(subs)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Subscribe to notifications
  useEffect(() => {
    const unsubscribe = subscribeToNotifications((notifs) => {
      setNotifications(notifs)
    })
    return () => unsubscribe()
  }, [])

  const handleSendNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      alert("Please fill in title and message")
      return
    }

    setSending(true)
    try {
      await createNotification({
        type: notificationForm.type,
        title: notificationForm.title,
        message: notificationForm.message,
        link: notificationForm.link || undefined,
      })
      alert(`Notification sent to ${subscribers.length} subscribers!`)
      setShowSendModal(false)
      setNotificationForm({
        type: "new_product",
        title: "",
        message: "",
        link: "",
      })
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Failed to send notification")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Newsletter & Notifications</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab("subscribers")}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === "subscribers"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Subscribers ({subscribers.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === "notifications"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications ({notifications.length})
              </div>
            </button>
            <button
              onClick={() => setActiveTab("send")}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === "send"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Send Notification
              </div>
            </button>
          </div>

          {/* Subscribers Tab */}
          {activeTab === "subscribers" && (
            <div>
              {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading subscribers...</div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No subscribers yet</div>
              ) : (
                <div className="bg-card rounded-lg border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Subscribed At</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((subscriber) => (
                          <tr key={subscriber.id} className="border-t border-border hover:bg-muted/50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                {subscriber.email}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {subscriber.subscribedAt.toDate().toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Active
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div>
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No notifications sent yet</div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="bg-card rounded-lg border border-border p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                notification.type === "new_product"
                                  ? "bg-purple-100 text-purple-700"
                                  : notification.type === "new_offer"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {notification.type === "new_product"
                                ? "New Product"
                                : notification.type === "new_offer"
                                ? "New Offer"
                                : "General"}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold mb-1">{notification.title}</h3>
                          <p className="text-muted-foreground mb-2">{notification.message}</p>
                          {notification.link && (
                            <a
                              href={notification.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent hover:underline text-sm"
                            >
                              {notification.link}
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Sent to {notification.sentTo} subscribers</span>
                        <span>•</span>
                        <span>{notification.sentAt.toDate().toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Send Notification Tab */}
          {activeTab === "send" && (
            <div className="bg-card rounded-lg border border-border p-8 max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Send Notification to Subscribers</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Notification Type</label>
                  <select
                    value={notificationForm.type}
                    onChange={(e) =>
                      setNotificationForm({ ...notificationForm, type: e.target.value as any })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="new_product">New Product</option>
                    <option value="new_offer">New Offer</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={notificationForm.title}
                    onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                    placeholder="e.g., New Product Added!"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    value={notificationForm.message}
                    onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                    placeholder="Enter notification message..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link (Optional)</label>
                  <input
                    type="url"
                    value={notificationForm.link}
                    onChange={(e) => setNotificationForm({ ...notificationForm, link: e.target.value })}
                    placeholder="e.g., /products or /product/123"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This notification will be sent to <strong>{subscribers.length} active subscribers</strong>.
                  </p>
                </div>
                <button
                  onClick={handleSendNotification}
                  disabled={sending}
                  className="w-full bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Notification
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NewsletterPage() {
  return (
    <AdminProvider>
      <NewsletterManagementContent />
    </AdminProvider>
  )
}
