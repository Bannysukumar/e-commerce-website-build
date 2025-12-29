"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { AdminProvider } from "@/lib/admin-context"
import { getDashboardStats } from "@/lib/admin-service"

function AdminDashboardContent() {
  const [stats, setStats] = useState([
    {
      label: "Total Sales",
      value: "₹0.00",
      change: "0%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Products",
      value: "0",
      change: "0 this month",
      icon: Package,
      color: "text-purple-600",
    },
    {
      label: "Orders",
      value: "0",
      change: "0 today",
      icon: ShoppingCart,
      color: "text-amber-600",
    },
    {
      label: "Customers",
      value: "0",
      change: "0 new",
      icon: Users,
      color: "text-purple-600",
    },
  ])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    // Refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      const data = await getDashboardStats()
      setStats([
        {
          label: "Total Sales",
          value: data.totalSales,
          change: "+0%",
          icon: TrendingUp,
          color: "text-green-600",
        },
        {
          label: "Products",
          value: data.totalProducts,
          change: "0 this month",
          icon: Package,
          color: "text-purple-600",
        },
        {
          label: "Orders",
          value: data.totalOrders,
          change: "0 today",
          icon: ShoppingCart,
          color: "text-amber-600",
        },
        {
          label: "Customers",
          value: data.totalCustomers,
          change: "0 new",
          icon: Users,
          color: "text-purple-600",
        },
      ])
      setRecentOrders(data.recentOrders)
      setTopProducts(data.topProducts)
      setLoading(false)
    } catch (error) {
      console.error("Error loading dashboard:", error)
      setLoading(false)
    }
  }

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
                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No recent orders</p>
                  </div>
                ) : (
                  recentOrders.map((order) => (
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
                              ? "text-purple-600"
                              : "text-amber-600"
                        }`}
                      >
                        {order.status}
                      </p>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Top Products</h2>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No product data available</p>
                  </div>
                ) : (
                  topProducts.map((product) => (
                  <div key={product.name} className="pb-4 border-b border-border last:border-0">
                    <p className="font-semibold line-clamp-1">{product.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-muted-foreground">{product.sales} sales</span>
                      <span className="font-bold text-accent">{product.revenue}</span>
                    </div>
                  </div>
                  ))
                )}
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
