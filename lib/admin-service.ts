"use client"

import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { db } from "./firebase"
import { getAllOrders } from "./orders-service"
import { getProducts } from "./products-service"
import type { Order } from "./orders-service"

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    const [orders, products, users] = await Promise.all([
      getAllOrders(),
      getProducts(),
      getDocs(collection(db, "users")),
    ])

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const totalProducts = products.length
    const totalCustomers = users.size

    // Calculate recent orders (last 5)
    const recentOrders = orders
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((order) => ({
        id: order.id,
        customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
        amount: `$${order.total.toFixed(2)}`,
        status: order.status,
      }))

    // Calculate top products (by order frequency)
    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {}
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              name: product.name,
              sales: 0,
              revenue: 0,
            }
          }
          productSales[item.productId].sales += item.quantity
          productSales[item.productId].revenue += product.price * item.quantity
        }
      })
    })

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((p) => ({
        name: p.name,
        sales: p.sales,
        revenue: `$${p.revenue.toFixed(2)}`,
      }))

    return {
      totalSales: `$${totalSales.toFixed(2)}`,
      totalOrders: totalOrders.toString(),
      totalProducts: totalProducts.toString(),
      totalCustomers: totalCustomers.toString(),
      recentOrders,
      topProducts,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalSales: "$0.00",
      totalOrders: "0",
      totalProducts: "0",
      totalCustomers: "0",
      recentOrders: [],
      topProducts: [],
    }
  }
}

// Get all customers with their order data
export async function getCustomers() {
  try {
    const [usersSnapshot, orders] = await Promise.all([
      getDocs(collection(db, "users")),
      getAllOrders(),
    ])

    const customers = usersSnapshot.docs.map((userDoc) => {
      const userData = userDoc.data()
      const userId = userDoc.id

      // Calculate user's orders and total spent
      const userOrders = orders.filter((order) => order.userId === userId)
      const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0)

      return {
        id: userId,
        name: userData.name || userData.email?.split("@")[0] || "Unknown",
        email: userData.email || "",
        phone: userData.phone || "N/A",
        orders: userOrders.length,
        totalSpent: `$${totalSpent.toFixed(2)}`,
        joinDate: userData.createdAt?.toDate().toLocaleDateString() || new Date().toLocaleDateString(),
      }
    })

    return customers
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

// Get analytics data
export async function getAnalytics() {
  try {
    const orders = await getAllOrders()

    if (orders.length === 0) {
      return {
        revenue: "$0.00",
        orders: "0",
        customers: "0",
        avgOrderValue: "$0.00",
        sales: [],
        categoryBreakdown: [],
      }
    }

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const uniqueCustomers = new Set(orders.map((order) => order.userId).filter(Boolean)).size
    const avgOrderValue = totalRevenue / totalOrders

    // Calculate monthly sales (last 6 months)
    const now = new Date()
    const sales = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthOrders = orders.filter(
        (order) =>
          order.createdAt.getMonth() === month.getMonth() &&
          order.createdAt.getFullYear() === month.getFullYear()
      )
      const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total, 0)
      sales.push({
        month: month.toLocaleDateString("en-US", { month: "short" }),
        revenue: monthRevenue,
      })
    }

    // Calculate category breakdown from orders
    const categoryRevenue: Record<string, number> = {}
    const { getProducts } = await import("./products-service")
    const products = await getProducts()

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          const category = product.category
          if (!categoryRevenue[category]) {
            categoryRevenue[category] = 0
          }
          categoryRevenue[category] += product.price * item.quantity
        }
      })
    })

    const totalCategoryRevenue = Object.values(categoryRevenue).reduce((a, b) => a + b, 0)
    const categoryBreakdown = Object.entries(categoryRevenue)
      .map(([category, revenue]) => ({
        category,
        percentage: totalCategoryRevenue > 0 ? Math.round((revenue / totalCategoryRevenue) * 100) : 0,
        revenue: `$${revenue.toFixed(2)}`,
      }))
      .sort((a, b) => b.percentage - a.percentage)

    return {
      revenue: `$${totalRevenue.toFixed(2)}`,
      orders: totalOrders.toString(),
      customers: uniqueCustomers.toString(),
      avgOrderValue: `$${avgOrderValue.toFixed(2)}`,
      sales,
      categoryBreakdown,
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return {
      revenue: "$0.00",
      orders: "0",
      customers: "0",
      avgOrderValue: "$0.00",
      sales: [],
      categoryBreakdown: [],
    }
  }
}
