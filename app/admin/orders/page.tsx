"use client"

import { useState } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Filter } from "lucide-react"

function OrdersManagementContent() {
  const [selectedStatus, setSelectedStatus] = useState("all")

  const orders = [
    { id: "ORD-001", customer: "John Doe", date: "Dec 6, 2024", amount: "$199.99", status: "Delivered" },
    { id: "ORD-002", customer: "Jane Smith", date: "Dec 5, 2024", amount: "$89.99", status: "Shipped" },
    { id: "ORD-003", customer: "Bob Johnson", date: "Dec 4, 2024", amount: "$349.99", status: "Processing" },
    { id: "ORD-004", customer: "Alice Brown", date: "Dec 3, 2024", amount: "$129.99", status: "Pending" },
    { id: "ORD-005", customer: "Charlie Davis", date: "Dec 2, 2024", amount: "$279.99", status: "Delivered" },
  ]

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Processing: "bg-blue-100 text-blue-700",
    Shipped: "bg-indigo-100 text-indigo-700",
    Delivered: "bg-green-100 text-green-700",
  }

  const filteredOrders = selectedStatus === "all" ? orders : orders.filter((order) => order.status === selectedStatus)

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Orders</h1>

          {/* Filters */}
          <div className="mb-8 flex items-center gap-4">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold">Order ID</th>
                  <th className="text-left px-6 py-4 font-semibold">Customer</th>
                  <th className="text-left px-6 py-4 font-semibold">Date</th>
                  <th className="text-left px-6 py-4 font-semibold">Amount</th>
                  <th className="text-left px-6 py-4 font-semibold">Status</th>
                  <th className="text-left px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">{order.id}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4 text-muted-foreground">{order.date}</td>
                    <td className="px-6 py-4 font-bold">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-accent hover:opacity-80 transition-opacity font-medium text-sm">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrdersManagement() {
  return (
    <AdminProvider>
      <OrdersManagementContent />
    </AdminProvider>
  )
}
