"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { AdminProvider } from "@/lib/admin-context"

function AdminDashboardContent() {
  const stats = [
    {
      label: "Total Sales",
      value: "$45,231.89",
      change: "+20.1%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Products",
      value: "1,234",
      change: "+12 this month",
      icon: Package,
      color: "text-blue-600",
    },
    {
      label: "Orders",
      value: "456",
      change: "+45 today",
      icon: ShoppingCart,
      color: "text-amber-600",
    },
    {
      label: "Customers",
      value: "892",
      change: "+23 new",
      icon: Users,
      color: "text-purple-600",
    },
  ]

  const recentOrders = [
    { id: "ORD-001", customer: "John Doe", amount: "$199.99", status: "Delivered" },
    { id: "ORD-002", customer: "Jane Smith", amount: "$89.99", status: "Processing" },
    { id: "ORD-003", customer: "Bob Johnson", amount: "$349.99", status: "Shipped" },
    { id: "ORD-004", customer: "Alice Brown", amount: "$129.99", status: "Pending" },
  ]

  const topProducts = [
    { name: "Premium Wireless Headphones", sales: 234, revenue: "$46,866" },
    { name: "Classic Cotton T-Shirt", sales: 189, revenue: "$5,671" },
    { name: "Minimalist Watch", sales: 156, revenue: "$23,374" },
    { name: "Slim Fit Denim Jeans", sales: 142, revenue: "$11,359" },
  ]

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold mb-2">{stat.value}</p>
                  <p className={`text-sm ${stat.color} font-medium`}>{stat.change}</p>
                </div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between pb-4 border-b border-border last:border-0"
                  >
                    <div>
                      <p className="font-semibold">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{order.amount}</p>
                      <p
                        className={`text-xs font-medium ${
                          order.status === "Delivered"
                            ? "text-green-600"
                            : order.status === "Shipped"
                              ? "text-blue-600"
                              : "text-amber-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Top Products</h2>
              <div className="space-y-4">
                {topProducts.map((product) => (
                  <div key={product.name} className="pb-4 border-b border-border last:border-0">
                    <p className="font-semibold line-clamp-1">{product.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{product.sales} sales</span>
                      <span className="font-bold text-accent">{product.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminProvider>
      <AdminDashboardContent />
    </AdminProvider>
  )
}
