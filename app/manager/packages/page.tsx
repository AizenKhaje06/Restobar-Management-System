import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, DollarSign, TrendingUp } from "lucide-react"
import { PackagesTable } from "@/components/manager/packages-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function PackagesPage() {
  const supabase = await createClient()

  // Fetch event packages
  const { data: packages, error } = await supabase
    .from("event_packages")
    .select("*")
    .order("created_at", { ascending: false })

  // Calculate stats
  const totalPackages = packages?.length || 0
  const activePackages = packages?.filter(p => p.is_active)?.length || 0
  const avgPrice = packages?.length
    ? (packages.reduce((sum, p) => sum + Number(p.base_price), 0) / packages.length)
    : 0

  const stats = [
    {
      title: "Total Packages",
      value: totalPackages,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20"
    },
    {
      title: "Active Packages",
      value: activePackages,
      icon: TrendingUp,
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
          <h1 className="text-3xl font-bold tracking-tight">Event Packages</h1>
          <p className="text-muted-foreground">
            Manage event packages and pricing
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/events/packages/new">
            <Plus className="size-4 mr-2" />
            Add New Package
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

      {/* Packages Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-center text-red-600">Error: {error.message}</p>
          ) : (
            <PackagesTable packages={packages || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
