import Link from "next/link"
import { Button } from "@/components/ui/card"
import { MapPin, Users, ArrowRight } from "lucide-react"
import type { EventVenue } from "@/lib/types/events"

export function VenuePreview({ venues }: { venues: EventVenue[] }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {venues.slice(0, 3).map((venue) => (
          <Link 
            key={venue.id} 
            href={`/events/venues/${venue.id}`}
            className="group block"
          >
            <div className="overflow-hidden rounded-2xl border bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              {/* Image */}
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                {venue.photos[0] ? (
                  <img 
                    src={venue.photos[0]} 
                    alt={venue.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
                    <MapPin className="size-16 text-amber-600/50" />
                  </div>
                )}
                {/* Capacity Badge */}
                <div className="absolute top-4 left-4">
                  <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold flex items-center gap-1">
                    <Users className="size-3" />
                    {venue.capacity_min}-{venue.capacity_max} pax
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:text-amber-600 transition-colors">
                      {venue.name}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="size-3" />
                      {venue.location}
                    </p>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {venue.description}
                </p>

                {/* Amenities */}
                {venue.amenities && venue.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {venue.amenities.slice(0, 3).map((amenity, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs font-medium"
                      >
                        {amenity}
                      </span>
                    ))}
                    {venue.amenities.length > 3 && (
                      <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        +{venue.amenities.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Starting at</p>
                    <p className="text-2xl font-black text-amber-600">
                      ₱{venue.base_rate.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-600 font-semibold text-sm">
                    View Details
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href="/events/venues">
          <button className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:shadow-xl transition-all hover:scale-105">
            View All Venues
            <ArrowRight className="ml-2 size-5" />
          </button>
        </Link>
      </div>
    </div>
  )
}
