"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import {
  subscribeToContactMessages,
  updateMessageStatus,
  deleteContactMessage,
  type ContactMessage,
} from "@/lib/contact-messages-service"
import { Mail, Phone, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react"

function ContactMessagesContent() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [filter, setFilter] = useState<"all" | "unread" | "read" | "replied">("all")

  useEffect(() => {
    const unsubscribe = subscribeToContactMessages((messagesList) => {
      setMessages(messagesList)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await updateMessageStatus(id, "read")
    } catch (error) {
      console.error("Error updating message status:", error)
      alert("Error updating message status")
    }
  }

  const handleMarkAsReplied = async (id: string) => {
    try {
      await updateMessageStatus(id, "replied")
    } catch (error) {
      console.error("Error updating message status:", error)
      alert("Error updating message status")
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteContactMessage(id)
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
        }
      } catch (error) {
        console.error("Error deleting message:", error)
        alert("Error deleting message")
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "replied":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "read":
        return <Eye className="w-4 h-4 text-blue-600" />
      case "unread":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "replied":
        return "bg-green-100 text-green-800"
      case "read":
        return "bg-blue-100 text-blue-800"
      case "unread":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredMessages =
    filter === "all"
      ? messages
      : messages.filter((msg) => msg.status === filter)

  const unreadCount = messages.filter((msg) => msg.status === "unread").length

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <p>Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold">Contact Messages</h1>
              {unreadCount > 0 && (
                <p className="text-muted-foreground mt-2">
                  {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg ${filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                All ({messages.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-lg ${filter === "unread" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`px-4 py-2 rounded-lg ${filter === "read" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                Read ({messages.filter((m) => m.status === "read").length})
              </button>
              <button
                onClick={() => setFilter("replied")}
                className={`px-4 py-2 rounded-lg ${filter === "replied" ? "bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                Replied ({messages.filter((m) => m.status === "replied").length})
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Messages List */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {filteredMessages.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">No messages found</div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => {
                        setSelectedMessage(message)
                        if (message.status === "unread") {
                          handleMarkAsRead(message.id)
                        }
                      }}
                      className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedMessage?.id === message.id ? "bg-muted" : ""
                      } ${message.status === "unread" ? "bg-yellow-50/50" : ""}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{message.name}</h3>
                          <p className="text-sm text-muted-foreground">{message.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(message.status)}
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{message.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {message.createdAt?.toDate?.().toLocaleString() || new Date().toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Message Detail */}
            <div className="bg-card border border-border rounded-lg p-6">
              {selectedMessage ? (
                <div>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                    <h2 className="text-2xl font-bold">Message Details</h2>
                    <div className="flex gap-2">
                      {selectedMessage.status === "unread" && (
                        <button
                          onClick={() => handleMarkAsRead(selectedMessage.id)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Mark as Read"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {selectedMessage.status !== "replied" && (
                        <button
                          onClick={() => handleMarkAsReplied(selectedMessage.id)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                          title="Mark as Replied"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Name</label>
                      <p className="text-foreground font-semibold">{selectedMessage.name}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`mailto:${selectedMessage.email}`}
                          className="text-foreground hover:text-accent transition-colors"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>

                    {selectedMessage.phone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <a
                            href={`tel:${selectedMessage.phone}`}
                            className="text-foreground hover:text-accent transition-colors"
                          >
                            {selectedMessage.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Subject</label>
                      <p className="text-foreground font-semibold">{selectedMessage.subject}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Message</label>
                      <p className="text-foreground leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedMessage.status)}
                        <span className={`text-sm px-3 py-1 rounded ${getStatusColor(selectedMessage.status)}`}>
                          {selectedMessage.status.charAt(0).toUpperCase() + selectedMessage.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Received</label>
                      <p className="text-foreground">
                        {selectedMessage.createdAt?.toDate?.().toLocaleString() || new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a message to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContactMessagesPage() {
  return (
    <AdminProvider>
      <ContactMessagesContent />
    </AdminProvider>
  )
}
