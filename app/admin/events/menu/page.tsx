import { getAllMenuPackages } from "@/app/actions/admin-events"
import Link from "next/link"
import {
  UtensilsCrossed,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Users,
  DollarSign,
  ChefHat,
  Leaf,
  Pizza,
  Wine,
  Cake,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Menu Package Management - Admin",
  description: "Manage event menu packages and catering options",
}

const categoryIcons = {
  buffet: ChefHat,
  plated: Pizza,
  drinks: Wine,
  dessert: Cake,
}

const categoryColors = {
  buffet: "bg-orange-100 dark:bg-orange-900/30 text-orange-600",
  plated: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  drinks: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  dessert: "bg-pink-100 dark:bg-pink-900/30 text-pink-600",
}

export default async function AdminMenuPackagesPage() {
  const { menuPackages, error } = await getAllMenuPackages()

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const activePackages = menuPackages?.filter((p) => p.is_active) || []
  const inactivePackages = menuPackages?.filter((p) => !p.is_active) || []

  // Group by category
  const byCategory = activePackages.reduce((acc, pkg) => {
    if (!acc[pkg.category]) acc[pkg.category] = []
    acc[pkg.category].push(pkg)
    return acc
  }, {} as Record<string, NonNullable<typeof activePackages>>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Package Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your event catering and menu options
          </p>
        </div>
        <Link href="/admin/events/menu/new">
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            <Plus className="size-4 mr-2" />
            Add Menu Package
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Packages</p>
              <p className="text-3xl font-bold">{menuPackages?.length || 0}</p>
            </div>
            <UtensilsCrossed className="size-8 text-muted-foreground/30" />
          </div>
        </div>

        {Object.entries(categoryColors).map(([category, color]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons]
          const count = byCategory[category]?.length || 0
          return (
            <div key={category} className="p-6 rounded-xl border bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 capitalize">{category}</p>
                  <p className="text-3xl font-bold">{count}</p>
                </div>
                <Icon className={`size-8 ${color}`} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Active Packages by Category */}
      {Object.entries(byCategory).map(([category, packages]) => {
        const Icon = categoryIcons[category as keyof typeof categoryIcons]
        const colorClass = categoryColors[category as keyof typeof categoryColors]
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colorClass} font-semibold`}>
                <Icon className="size-4" />
                <span className="capitalize">{category} Packages</span>
              </div>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {(packages as any[]).map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-6 rounded-xl border bg-card hover:shadow-lg transition-all"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-1">{pkg.name}</h3>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {pkg.description}
                        </p>
                      )}
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600">
                      Active
                    </span>
                  </div>

                  {/* Pricing & Min Order */}
                  <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Package Price</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="size-4 text-amber-600" />
                        <span className="font-semibold">
                          ₱{Number(pkg.price_per_person).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Min Order</p>
                      <div className="flex items-center gap-1">
                        <Users className="size-4 text-blue-600" />
                        <span className="font-semibold">{pkg.min_order} pax</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items Preview */}
                  {pkg.items && pkg.items.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">
                        Menu Items ({pkg.items.length})
                      </p>
                      <div className="space-y-1">
                        {pkg.items.slice(0, 3).map((item: any, idx: number) => (
                          <div key={idx} className="text-sm flex items-center gap-2">
                            <span className="size-1 rounded-full bg-amber-600" />
                            <span className="text-muted-foreground">{item.name}</span>
                          </div>
                        ))}
                        {pkg.items.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{pkg.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Dietary Info */}
                  {pkg.dietary_info && Object.keys(pkg.dietary_info).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(pkg.dietary_info).map(([key, value]) => 
                        value ? (
                          <div key={key} className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs">
                            <Leaf className="size-3 text-green-600" />
                            <span className="capitalize">{key}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/events/menu/${pkg.id}/edit`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full">
                        <Edit className="size-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Empty State */}
      {activePackages.length === 0 && (
        <div className="text-center py-16 border rounded-2xl bg-muted/30">
          <UtensilsCrossed className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No menu packages</h3>
          <p className="text-muted-foreground mb-6">
            Create your first menu package to offer catering options
          </p>
          <Link href="/admin/events/menu/new">
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <Plus className="size-4 mr-2" />
              Add Your First Menu Package
            </Button>
          </Link>
        </div>
      )}

      {/* Inactive Packages */}
      {inactivePackages.length > 0 && (
        <details className="space-y-4">
          <summary className="cursor-pointer text-lg font-bold hover:text-amber-600">
            Inactive Menu Packages ({inactivePackages.length})
          </summary>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            {inactivePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 rounded-xl border bg-card opacity-60 hover:opacity-100 transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{pkg.category}</p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600">
                    Inactive
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/events/menu/${pkg.id}/edit`}
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
