import { getAllPackages } from "@/app/actions/admin-events"
import Link from "next/link"
import {
  Package,
  Plus,
  Users,
  Clock,
  DollarSign,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Package Management - Admin",
  description: "Manage event packages",
}

export default async function AdminPackagesPage() {
  const { packages, error } = await getAllPackages()

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const activePackages = packages?.filter((p) => p.is_active) || []
  const inactivePackages = packages?.filter((p) => !p.is_active) || []
  const featuredPackages = activePackages.filter((p) => p.is_featured)

  // Group by event type
  const packagesByType = activePackages.reduce((acc, pkg) => {
    if (!acc[pkg.event_type]) {
      acc[pkg.event_type] = []
    }
    acc[pkg.event_type].push(pkg)
    return acc
  }, {} as Record<string, typeof activePackages>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Package Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your event packages and offerings
          </p>
        </div>
        <Link href="/admin/events/packages/new">
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            <Plus className="size-4 mr-2" />
            Add New Package
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                Total Packages
              </p>
              <p className="text-3xl font-bold">{packages?.length || 0}</p>
            </div>
            <Package className="size-8 text-muted-foreground/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {activePackages.length}
              </p>
            </div>
            <ToggleRight className="size-8 text-green-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Featured</p>
              <p className="text-3xl font-bold text-amber-600">
                {featuredPackages.length}
              </p>
            </div>
            <Star className="size-8 text-amber-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Inactive</p>
              <p className="text-3xl font-bold text-gray-600">
                {inactivePackages.length}
              </p>
            </div>
            <ToggleLeft className="size-8 text-gray-600/30" />
          </div>
        </div>
      </div>

      {/* Packages by Event Type */}
      {activePackages.length === 0 ? (
        <div className="text-center py-16 border rounded-2xl bg-muted/30">
          <Package className="size-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No active packages</h3>
          <p className="text-muted-foreground mb-6">
            Create your first package to offer to customers
          </p>
          <Link href="/admin/events/packages/new">
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <Plus className="size-4 mr-2" />
              Create Your First Package
            </Button>
          </Link>
        </div>
      ) : (
        Object.entries(packagesByType).map(([eventType, pkgs]) => (
          <div key={eventType} className="space-y-4">
            <h2 className="text-xl font-bold capitalize flex items-center gap-2">
              {eventType.replace("_", " ")} Packages
              <span className="text-sm font-normal text-muted-foreground">
                ({pkgs.length})
              </span>
            </h2>

            <div className="grid gap-4 lg:grid-cols-2">
              {pkgs.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-6 rounded-xl border bg-card hover:shadow-lg transition-all"
                >
                  {/* Package Image */}
                  {pkg.featured_image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img
                        src={pkg.featured_image}
                        alt={pkg.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  {/* Package Info */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">{pkg.name}</h3>
                        {pkg.short_description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {pkg.short_description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {pkg.is_featured && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center gap-1">
                            <Star className="size-3 fill-current" />
                            Featured
                          </span>
                        )}
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600">
                          Active
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Capacity
                        </p>
                        <div className="flex items-center gap-1">
                          <Users className="size-4 text-amber-600" />
                          <span className="font-semibold text-sm">
                            {pkg.min_guests}-{pkg.max_guests}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Duration
                        </p>
                        <div className="flex items-center gap-1">
                          <Clock className="size-4 text-amber-600" />
                          <span className="font-semibold text-sm">
                            {pkg.duration_hours}h
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Price
                        </p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="size-4 text-amber-600" />
                          <span className="font-semibold text-sm">
                            {pkg.price_per_person
                              ? `₱${Number(pkg.price_per_person).toLocaleString()}/pax`
                              : pkg.base_price
                              ? `₱${Number(pkg.base_price).toLocaleString()}`
                              : "Custom"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Inclusions Preview */}
                    {pkg.inclusions && pkg.inclusions.length > 0 && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">
                          Inclusions ({pkg.inclusions.length})
                        </p>
                        <div className="space-y-1">
                          {pkg.inclusions.slice(0, 3).map((inc, i) => (
                            <p key={i} className="text-xs text-muted-foreground">
                              • {inc.item}
                            </p>
                          ))}
                          {pkg.inclusions.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              + {pkg.inclusions.length - 3} more inclusions
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3">
                      <Link
                        href={`/events/packages/${pkg.slug}`}
                        className="flex-1"
                        target="_blank"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="size-4 mr-2" />
                          View Public
                        </Button>
                      </Link>
                      <Link
                        href={`/admin/events/packages/${pkg.id}/edit`}
                        className="flex-1"
                      >
                        <Button size="sm" className="w-full">
                          <Edit className="size-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Inactive Packages */}
      {inactivePackages.length > 0 && (
        <details className="space-y-4">
          <summary className="cursor-pointer text-lg font-bold hover:text-amber-600">
            Inactive Packages ({inactivePackages.length})
          </summary>

          <div className="grid gap-4 lg:grid-cols-2 mt-4">
            {inactivePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-6 rounded-xl border bg-card opacity-60 hover:opacity-100 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{pkg.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">
                        {pkg.event_type.replace("_", " ")}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600">
                      Inactive
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Link
                      href={`/admin/events/packages/${pkg.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="size-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
