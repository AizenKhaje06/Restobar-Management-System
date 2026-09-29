'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard,
  ShoppingCart,
  Calendar,
  Users,
  FileText,
  Settings,
  Star,
  Image,
  Package,
  MapPin,
  UtensilsCrossed,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ManagerSidebarProps {
  userRole: string
  userName: string
}

const navigation = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", href: "/manager", icon: LayoutDashboard },
    ]
  },
  {
    title: "Orders & Bookings",
    items: [
      { name: "Online Orders", href: "/manager/orders", icon: ShoppingCart },
      { name: "Event Bookings", href: "/manager/bookings", icon: Calendar },
      { name: "Customers", href: "/manager/customers", icon: Users },
      { name: "Reviews", href: "/manager/reviews", icon: Star },
    ]
  },
  {
    title: "Content Management",
    items: [
      { name: "Menu Items", href: "/manager/menu", icon: UtensilsCrossed },
      { name: "Event Packages", href: "/manager/packages", icon: Package },
      { name: "Venues", href: "/manager/venues", icon: MapPin },
      { name: "Gallery", href: "/manager/gallery", icon: Image },
    ]
  },
  {
    title: "Settings",
    items: [
      { name: "Landing Page Settings", href: "/manager/settings", icon: Settings },
      { name: "Activity Log", href: "/manager/activity", icon: FileText },
    ]
  },
]

export function ManagerSidebar({ userRole, userName }: ManagerSidebarProps) {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Landing Page Manager
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{userName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigation.map((section) => (
          <div key={section.title}>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-amber-100 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          asChild
        >
          <Link href="/auth/signout">
            <LogOut className="size-4 mr-2" />
            Sign Out
          </Link>
        </Button>
      </div>
    </div>
  )
}
