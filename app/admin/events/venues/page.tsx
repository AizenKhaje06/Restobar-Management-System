import { getAllVenues } from "@/app/actions/admin-events"
import Link from "next/link"
import {
  Building2,
  Plus,
  Users,
  MapPin,
  DollarSign,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Venue Management - Admin",
  description: "Manage event venues",
}

export default async function AdminVenuesPage() {
  const { venues, error } = await getAllVenues()

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const activeVenues = venues?.filter((v) => v.is_active) || []
  const inactiveVenues = venues?.filter((v) => !v.is_active) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venue Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your event venues and spaces
          </p>
        </div>
        <Link href="/admin/events/venues/new">
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            <Plus className="size-4 mr-2" />
            Add New Venue
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Venues</p>
              <p className="text-3xl font-bold">{venues?.length || 0}</p>
            </div>
            <Building2 className="size-8 text-muted-foreground/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {activeVenues.length}
              </p>
            </div>
            <ToggleRight className="size-8 text-green-600/30" />
          </div>
        </div>

        <div className="p-6 rounded-xl border bg-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Inactive</p>
              <p className="text-3xl font-bold text-gray-600">
                {inactiveVenues.length}
              </p>
            </div>
            <ToggleLeft className="size-8 text-gray-600/30" />
          </div>
        </div>
      </div>

      {/* Active Venues */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Active Venues</h2>

        {activeVenues.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-muted/30">
            <Building2 className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No active venues</h3>
            <p className="text-muted-foreground mb-6">
              Add your first venue to start accepting bookings
            </p>
            <Link href="/admin/events/venues/new">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                <Plus className="size-4 mr-2" />
                Add Your First Venue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2 xl:gap-8">
            {activeVenues.map((venue) => (
              <div
                key={venue.id}
                className="p-6 rounded-xl border-2 bg-card shadow-md hover:shadow-xl hover:border-amber-300 transition-all duration-300"
              >
                {/* Venue Image */}
                {venue.photos && venue.photos.length > 0 && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img
                      src={venue.photos[0]}
                      alt={venue.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {/* Venue Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="size-4" />
                        <span>{venue.location}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600">
                      Active
                    </span>
                  </div>

                  {venue.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {venue.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Capacity
                      </p>
                      <div className="flex items-center gap-1">
                        <Users className="size-4 text-amber-600" />
                        <span className="font-semibold text-sm">
                          {venue.capacity_min}-{venue.capacity_max}
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Base Rate
                      </p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="size-4 text-amber-600" />
                        <span className="font-semibold text-sm">
                          ₱{Number(venue.base_rate).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-xs text-muted-foreground mb-2">
                        Amenities
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {venue.amenities.slice(0, 4).map((amenity, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full text-xs bg-muted"
                          >
                            {amenity}
                          </span>
                        ))}
                        {venue.amenities.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-muted">
                            +{venue.amenities.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3">
                    <Link
                      href={`/events/venues/${venue.id}`}
                      className="flex-1"
                      target="_blank"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="size-4 mr-2" />
                        View Public
                      </Button>
                    </Link>
                    <Link
                      href={`/admin/events/venues/${venue.id}/edit`}
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
        )}
      </div>

      {/* Inactive Venues */}
      {inactiveVenues.length > 0 && (
        <details className="space-y-4">
          <summary className="cursor-pointer text-lg font-bold hover:text-amber-600">
            Inactive Venues ({inactiveVenues.length})
          </summary>

          <div className="grid gap-6 lg:grid-cols-2 xl:gap-8 mt-4">
            {inactiveVenues.map((venue) => (
              <div
                key={venue.id}
                className="p-6 rounded-xl border-2 bg-card shadow-md opacity-60 hover:opacity-100 hover:shadow-lg transition-all duration-300"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold">{venue.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <MapPin className="size-4" />
                        <span>{venue.location}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-900/30 text-gray-600">
                      Inactive
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t">
                    <Link
                      href={`/admin/events/venues/${venue.id}/edit`}
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
