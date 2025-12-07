"use client"

import { useState, useEffect } from "react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { getAnalytics } from "@/lib/admin-service"
import { TrendingUp, TrendingDown } from "lucide-react"

function AnalyticsContent() {
  const [metrics, setMetrics] = useState([
    { label: "Revenue", value: "$0.00", change: "0%", trend: "up" as const },
    { label: "Orders", value: "0", change: "0%", trend: "up" as const },
    { label: "Customers", value: "0", change: "0%", trend: "up" as const },
    { label: "Avg. Order Value", value: "$0.00", change: "0%", trend: "up" as const },
  ])
  const [sales, setSales] = useState<any[]>([])
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
    // Refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadAnalytics = async () => {
    try {
      const data = await getAnalytics()
      setMetrics([
        { label: "Revenue", value: data.revenue, change: "0%", trend: "up" as const },
        { label: "Orders", value: data.orders, change: "0%", trend: "up" as const },
        { label: "Customers", value: data.customers, change: "0%", trend: "up" as const },
        { label: "Avg. Order Value", value: data.avgOrderValue, change: "0%", trend: "up" as const },
      ])
      setSales(data.sales)
      setCategoryBreakdown(data.categoryBreakdown)
      setLoading(false)
    } catch (error) {
      console.error("Error loading analytics:", error)
      setLoading(false)
    }
  }

  return (
    <div className="flex bg-background">
      <AdminSidebar />

      <div className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-bold mb-8">Analytics</h1>

          {/* Metrics Grid */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric) => {
              const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
              const trendColor = metric.trend === "up" ? "text-green-600" : "text-red-600"

              return (
                <div key={metric.label} className="bg-card border border-border rounded-lg p-6">
                  <p className="text-sm font-medium text-muted-foreground mb-4">{metric.label}</p>
                  <p className="text-2xl font-bold mb-3">{metric.value}</p>
                  <div className={`flex items-center gap-2 ${trendColor}`}>
                    <TrendIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{metric.change}</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Revenue Trend */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Revenue Trend</h2>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading revenue data...</p>
                  </div>
                ) : sales.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No revenue data available</p>
                  </div>
                ) : (
                  (() => {
                    const maxRevenue = Math.max(...sales.map((s) => s.revenue), 1)
                    return sales.map((item) => (
                      <div key={item.month} className="flex items-center gap-4">
                        <span className="w-12 text-sm font-medium">{item.month}</span>
                        <div className="flex-1 bg-muted rounded-full h-8">
                          <div
                            className="bg-accent rounded-full h-8 flex items-center justify-end pr-3 transition-all"
                            style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                          >
                            <span className="text-xs font-bold text-accent-foreground">
                              ${(item.revenue / 1000).toFixed(0)}k
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  })()
                )}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Category Breakdown</h2>
              <div className="space-y-6">
                {categoryBreakdown.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No category data available</p>
                  </div>
                ) : (
                  categoryBreakdown.map((item) => (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-sm font-bold text-accent">{item.revenue}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent rounded-full h-2 transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.percentage}% of revenue</p>
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

export default function Analytics() {
  return (
    <AdminProvider>
      <AnalyticsContent />
    </AdminProvider>
  )
}
