"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { Mail, Phone } from "lucide-react"

function CustomersManagementContent() {
  const customers = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      phone: "+1 (555) 123-4567",
      orders: 5,
      totalSpent: "$1,249.95",
      joinDate: "Oct 15, 2024",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "+1 (555) 234-5678",
      orders: 3,
      totalSpent: "$679.97",
      joinDate: "Oct 20, 2024",
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      phone: "+1 (555) 345-6789",
      orders: 8,
      totalSpent: "$2,149.92",
      joinDate: "Sep 10, 2024",
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      phone: "+1 (555) 456-7890",
      orders: 2,
      totalSpent: "$449.98",
      joinDate: "Nov 5, 2024",
    },
  ]

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Customers</h1>

          {/* Customers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-6">
            {customers.map((customer) => (
              <div key={customer.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.joinDate}</p>
                  </div>
                  <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium">
                    {customer.orders} orders
                  </span>
                </div>

                <div className="space-y-3 mb-6 pb-6 border-b border-border">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${customer.email}`} className="hover:text-accent transition-colors">
                      {customer.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                    <p className="text-xl font-bold text-accent">{customer.totalSpent}</p>
                  </div>
                  <button className="px-6 py-2 border border-border rounded-lg hover:bg-muted transition-colors font-medium text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomersManagement() {
  return (
    <AdminProvider>
      <CustomersManagementContent />
    </AdminProvider>
  )
}
