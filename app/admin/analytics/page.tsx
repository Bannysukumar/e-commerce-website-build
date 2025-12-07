"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminProvider } from "@/lib/admin-context"
import { TrendingUp, TrendingDown } from "lucide-react"

function AnalyticsContent() {
  const metrics = [
    { label: "Revenue", value: "$45,231.89", change: "+20.1%", trend: "up" },
    { label: "Orders", value: "456", change: "+15.3%", trend: "up" },
    { label: "Customers", value: "892", change: "+8.2%", trend: "up" },
    { label: "Avg. Order Value", value: "$99.19", change: "-2.5%", trend: "down" },
  ]

  const sales = [
    { month: "Jan", revenue: 35000 },
    { month: "Feb", revenue: 38000 },
    { month: "Mar", revenue: 42000 },
    { month: "Apr", revenue: 39000 },
    { month: "May", revenue: 45000 },
    { month: "Jun", revenue: 52000 },
  ]

  const categoryBreakdown = [
    { category: "Fashion", percentage: 35, revenue: "$15,831" },
    { category: "Electronics", percentage: 28, revenue: "$12,665" },
    { category: "Accessories", percentage: 22, revenue: "$9,951" },
    { category: "Sports", percentage: 15, revenue: "$6,785" },
  ]

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
                {sales.map((item) => (
                  <div key={item.month} className="flex items-center gap-4">
                    <span className="w-12 text-sm font-medium">{item.month}</span>
                    <div className="flex-1 bg-muted rounded-full h-8">
                      <div
                        className="bg-accent rounded-full h-8 flex items-center justify-end pr-3 transition-all"
                        style={{ width: `${(item.revenue / 52000) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-accent-foreground">
                          ${(item.revenue / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-6">Category Breakdown</h2>
              <div className="space-y-6">
                {categoryBreakdown.map((item) => (
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
                ))}
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
