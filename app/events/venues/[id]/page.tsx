import { getVenue } from "@/app/actions/events"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function VenueDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { venue, error } = await getVenue(id)

  if (error || !venue) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link 
          href="/events/venues" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Venues</span>
        </Link>

        {/* Content */}
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">{venue.name}</h1>
          <p className="text-xl text-muted-foreground mb-8">{venue.location}</p>

          {/* Image */}
          {venue.photos && venue.photos[0] && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img
                src={venue.photos[0]}
                alt={venue.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          {venue.description && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                {venue.description}
              </p>
            </div>
          )}

          {/* Details */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-xl border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Capacity</p>
              <p className="text-2xl font-bold">
                {venue.capacity_min}-{venue.capacity_max}
              </p>
            </div>
            
            <div className="p-6 rounded-xl border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Base Rate</p>
              <p className="text-2xl font-bold text-amber-600">
                ₱{Number(venue.base_rate).toLocaleString()}
              </p>
            </div>

            {venue.area_sqm && (
              <div className="p-6 rounded-xl border bg-card">
                <p className="text-sm text-muted-foreground mb-1">Area</p>
                <p className="text-2xl font-bold">{venue.area_sqm} sqm</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          {venue.amenities && venue.amenities.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {venue.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-lg bg-muted text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex gap-4">
            <Link href="/events/book">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Calendar className="size-4 mr-2" />
                Book This Venue
              </Button>
            </Link>
            <Link href="/events/contact">
              <Button size="lg" variant="outline">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
