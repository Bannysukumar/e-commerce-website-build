"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Package, ShoppingCart, Users, BarChart3, Settings, LogOut } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: "/admin", icon: LayoutGrid, label: "Dashboard", exact: true },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/customers", icon: Users, label: "Customers" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="w-64 bg-primary text-primary-foreground min-h-screen p-6">
      <div className="mb-12">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold">A</span>
          </div>
          <span>Admin</span>
        </Link>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-primary-foreground/10"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-6 left-6">
        <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-foreground/10">
          <LogOut className="w-5 h-5" />
          <span>Back to Store</span>
        </Link>
      </div>
    </div>
  )
}
