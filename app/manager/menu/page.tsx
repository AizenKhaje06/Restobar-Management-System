import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UtensilsCrossed, DollarSign, Package } from "lucide-react"
import { MenuItemsTable } from "@/components/manager/menu-items-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function MenuItemsPage() {
  const supabase = await createClient()

  // Fetch menu items from event_packages (since event_menu_items doesn't exist)
  const { data: menuItems, error } = await supabase
    .from("event_packages")
    .select("*")
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalItems = menuItems?.length || 0
  const activeItems = menuItems?.filter(m => m.is_active)?.length || 0
  const avgPrice = menuItems?.length
    ? (menuItems.reduce((sum, m) => sum + Number(m.base_price), 0) / menuItems.length)
    : 0

  const stats = [
    {
      title: "Total Menu Items",
      value: totalItems,
      icon: UtensilsCrossed,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Active Items",
      value: activeItems,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20"
    },
    {
      title: "Average Price",
      value: `₱${avgPrice.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20"
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Items</h1>
          <p className="text-muted-foreground">
            Manage event menu items and packages
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/menu/new">
            <Plus className="size-4 mr-2" />
            Add New Item
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`size-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Menu Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-center text-red-600">Error: {error.message}</p>
          ) : (
            <MenuItemsTable items={menuItems || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
