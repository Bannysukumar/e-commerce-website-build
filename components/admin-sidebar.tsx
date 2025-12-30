"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, Package, ShoppingCart, Users, BarChart3, Settings, LogOut, Image, Sparkles, MessageSquare, Layers, FolderTree, Mail, Ticket, Bell, TrendingUp, Megaphone } from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const menuItems = [
    { href: "/admin", icon: LayoutGrid, label: "Dashboard", exact: true },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/categories", icon: FolderTree, label: "Categories" },
    { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/customers", icon: Users, label: "Customers" },
    { href: "/admin/contact-messages", icon: Mail, label: "Contact Messages" },
    { href: "/admin/newsletter", icon: Bell, label: "Newsletter" },
    { href: "/admin/carousel", icon: Image, label: "Carousel" },
    { href: "/admin/promotional-banners", icon: Megaphone, label: "Promotional Banners" },
    { href: "/admin/featured-products", icon: Sparkles, label: "Story Products" },
    { href: "/admin/trending-products", icon: TrendingUp, label: "Trending Products" },
    { href: "/admin/testimonials", icon: MessageSquare, label: "Testimonials" },
    { href: "/admin/sections", icon: Layers, label: "Homepage Sections" },
    { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <div className="w-64 bg-primary text-primary-foreground min-h-screen p-6 flex flex-col">
      <div className="mb-12">
        <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="text-accent-foreground font-bold">A</span>
          </div>
          <span>Admin</span>
        </Link>
      </div>

      <nav className="space-y-2 flex-1 overflow-y-auto">
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

      <div className="mt-auto pt-4 border-t border-primary-foreground/10">
        <button
          onClick={() => {
            localStorage.removeItem("adminAuthenticated")
            localStorage.removeItem("adminUserId")
            window.location.href = "/admin/login"
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-foreground/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        <Link href="/" className="mt-2 flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary-foreground/10 transition-colors">
          <span>Back to Store</span>
        </Link>
      </div>
    </div>
  )
}
