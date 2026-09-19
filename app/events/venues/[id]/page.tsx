import { getVenue } from "@/app/actions/events"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  Building2, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Check,
  ArrowLeft,
  Calendar,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { VenueCalendar } from "@/components/events/venue-calendar"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { venue } = await getVenue(params.id)
  
  if (!venue) {
    return {
      title: "Venue Not Found",
    }
  }

  return {
    title: `${venue.name} - Event Venue`,
    description: venue.description || `Book ${venue.name} for your next event`,
  }
}

export default async function VenueDetailPage({ params }: { params: { id: string } }) {
  const { venue, error } = await getVenue(params.id)

  if (error || !venue) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/events/venues" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Venues</span>
        </Link>
      </div>

      {/* Hero Image Gallery */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Main Image */}
          <div className="aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden bg-muted">
            {venue.photos && venue.photos.length > 0 ? (
              <img
                src={venue.photos[0]}
                alt={venue.name}
                className="size-full object-cover"
              />
            ) : (
              <div className="size-full flex items-center justify-center">
                <Building2 className="size-24 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 gap-4">
            {venue.photos && venue.photos.slice(1, 5).map((photo, idx) => (
              <div key={idx} className="aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                <img
                  src={photo}
                  alt={`${venue.name} - Photo ${idx + 2}`}
                  className="size-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
            {venue.photos && venue.photos.length > 5 && (
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted relative">
                <img
                  src={venue.photos[4]}
                  alt={`${venue.name} - More photos`}
                  className="size-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold">
                  +{venue.photos.length - 5} more
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                {venue.name}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="size-5 flex-shrink-0" />
                <span className="text-lg">{venue.location}</span>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="font-bold">{venue.capacity_min}-{venue.capacity_max}</p>
                </div>
              </div>

              {venue.area_sqm && (
                <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                  <div className="flex size-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Building2 className="size-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Area</p>
                    <p className="font-bold">{venue.area_sqm} sqm</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <DollarSign className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Base Rate</p>
                  <p className="font-bold">₱{Number(venue.base_rate).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {venue.description && (
              <div>
                <h2 className="text-2xl font-bold mb-3">About This Venue</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {venue.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {venue.amenities && venue.amenities.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Amenities & Features</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {venue.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex size-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <Check className="size-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="p-6 rounded-2xl border bg-card">
              <h2 className="text-2xl font-bold mb-4">Pricing</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Base Rate (4 hours)</span>
                  <span className="font-bold text-lg">₱{Number(venue.base_rate).toLocaleString()}</span>
                </div>
                {venue.hourly_rate && (
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-muted-foreground">Additional Hours</span>
                    <span className="font-bold">₱{Number(venue.hourly_rate).toLocaleString()}/hour</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground pt-2">
                  * Prices are exclusive of food packages and add-ons. Contact us for a complete quotation.
                </p>
              </div>
            </div>

            {/* Floor Plan */}
            {venue.floor_plan_url && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Floor Plan</h2>
                <div className="rounded-2xl overflow-hidden border bg-muted">
                  <img
                    src={venue.floor_plan_url}
                    alt={`${venue.name} Floor Plan`}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:sticky lg:top-20 space-y-6 h-fit">
            {/* Booking Card */}
            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-1">Starting at</p>
                <p className="text-3xl font-bold text-amber-600">
                  ₱{Number(venue.base_rate).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">per event (4 hours)</p>
              </div>

              <div className="space-y-3">
                <Link href="/events/book" className="block">
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    <Calendar className="size-4 mr-2" />
                    Book This Venue
                  </Button>
                </Link>
                <Link href="/events/contact" className="block">
                  <Button variant="outline" className="w-full">
                    Request Quotation
                  </Button>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t space-y-3">
                <p className="text-sm font-medium">Quick Contact</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>📞 +63 917 123 4567</p>
                  <p>📧 events@restaurant.com</p>
                  <p>⏰ Mon-Sun: 8 AM - 10 PM</p>
                </div>
              </div>
            </div>

            {/* Calendar */}
            <div className="p-6 rounded-2xl border bg-card">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar className="size-5 text-amber-600" />
                <span>Check Availability</span>
              </h3>
              <VenueCalendar venueId={venue.id} />
            </div>
          </div>
        </div>
      </section>

      {/* Related/Other Venues */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Explore Other Venues
          </h2>
          <p className="text-muted-foreground mb-8">
            We have more amazing spaces for your event
          </p>
          <Link href="/events/venues">
            <Button variant="outline" size="lg">
              View All Venues
              <ChevronRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
