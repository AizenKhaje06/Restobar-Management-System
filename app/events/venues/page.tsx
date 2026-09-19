import { getVenues } from "@/app/actions/events"
import Link from "next/link"
import { Building2, MapPin, Users, DollarSign, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Our Venues - Event Venue",
  description: "Explore our stunning event venues perfect for any occasion.",
}

export default async function VenuesPage() {
  const { venues, error } = await getVenues()

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive">Failed to load venues. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-sm font-medium mb-4">
            <Building2 className="size-4" />
            <span>Our Venues</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Choose Your Perfect{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Event Space
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            From elegant ballrooms to stunning gardens, find the ideal setting for your special occasion
          </p>
        </div>
      </section>

      {/* Venues Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {venues && venues.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {venues.map((venue) => (
                <Link
                  key={venue.id}
                  href={`/events/venues/${venue.id}`}
                  className="group relative overflow-hidden rounded-2xl border bg-card shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    {venue.photos && venue.photos.length > 0 ? (
                      <img
                        src={venue.photos[0]}
                        alt={venue.name}
                        className="size-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="size-full flex items-center justify-center">
                        <Building2 className="size-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
                      {venue.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="size-4 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">{venue.location}</span>
                    </div>

                    {venue.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {venue.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 text-xs font-medium">
                        <Users className="size-3" />
                        <span>{venue.capacity_min}-{venue.capacity_max} guests</span>
                      </div>
                      {venue.area_sqm && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 text-xs font-medium">
                          <Building2 className="size-3" />
                          <span>{venue.area_sqm} sqm</span>
                        </div>
                      )}
                    </div>

                    {/* Amenities */}
                    {venue.amenities && venue.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {venue.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                          >
                            {amenity}
                          </span>
                        ))}
                        {venue.amenities.length > 3 && (
                          <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            +{venue.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Starting at</p>
                        <p className="text-lg font-bold text-amber-600">
                          ₱{Number(venue.base_rate).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 group-hover:gap-2 transition-all"
                      >
                        View Details
                        <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No venues available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-600 to-orange-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Book Your Event?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Let us help you create an unforgettable experience at our stunning venues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events/book">
              <Button size="lg" variant="secondary" className="min-w-[160px]">
                Book Now
              </Button>
            </Link>
            <Link href="/events/contact">
              <Button size="lg" variant="outline" className="min-w-[160px] border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
