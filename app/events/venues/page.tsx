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
                  className="group relative"
                >
                  {/* Card with stacked effect */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                    {/* Main Image */}
                    <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                      {venue.photos && venue.photos.length > 0 ? (
                        <img
                          src={venue.photos[0]}
                          alt={venue.name}
                          className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                          <Building2 className="size-24 text-muted-foreground/30" />
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                      {/* Venue Name Sidebar */}
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                        <p className="text-white font-bold text-sm tracking-wider transform -rotate-90 whitespace-nowrap origin-center">
                          {venue.name}
                        </p>
                      </div>

                      {/* Top Right Icons */}
                      <div className="absolute top-4 right-14 flex gap-2">
                        <button className="size-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors flex items-center justify-center">
                          <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <button className="size-9 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-colors flex items-center justify-center">
                          <svg className="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                        </button>
                      </div>

                      {/* Overlay Content - Top */}
                      <div className="absolute top-4 left-4 space-y-3">
                        {/* Location */}
                        <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                          <div className="flex items-center gap-2 text-white mb-1">
                            <MapPin className="size-4" />
                            <span className="text-xs font-semibold">{venue.location}</span>
                          </div>
                        </div>

                        {/* Capacity */}
                        <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                          <div className="flex items-center gap-2 text-white mb-1">
                            <Users className="size-4" />
                            <span className="text-xs font-semibold">{venue.capacity_min}-{venue.capacity_max}</span>
                          </div>
                        </div>

                        {/* Season/Type */}
                        {venue.amenities && venue.amenities.length > 0 && (
                          <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                            <div className="flex items-center gap-2 text-white mb-1">
                              <Building2 className="size-4" />
                              <span className="text-xs font-semibold">{venue.amenities[0]}</span>
                            </div>
                          </div>
                        )}

                        {/* Area */}
                        {venue.area_sqm && (
                          <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                            <div className="flex items-center gap-2 text-white mb-1">
                              <DollarSign className="size-4" />
                              <span className="text-xs font-semibold">{venue.area_sqm} sqm</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Overlay Content - Bottom */}
                      <div className="absolute bottom-0 left-0 right-14 p-6 text-white">
                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-6 mb-4">
                          <div>
                            <div className="text-3xl font-bold">9.6</div>
                            <div className="text-xs opacity-80">Guest Rating</div>
                          </div>
                          <div>
                            <div className="text-3xl font-bold">88%</div>
                            <div className="text-xs opacity-80">Return Visitors</div>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          <div className="text-sm opacity-80">From</div>
                          <div className="text-3xl font-bold">₱{Number(venue.base_rate).toLocaleString()}</div>
                          <div className="text-xs opacity-80">per event</div>
                        </div>

                        {/* View Button */}
                        <button className="w-full py-3 px-6 rounded-2xl bg-amber-600/80 backdrop-blur-md hover:bg-amber-600 transition-all font-semibold text-sm flex items-center justify-center gap-2 group-hover:gap-3">
                          View Venue
                          <ChevronRight className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Editor's Choice Badge (optional) */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg">
                      Editor's Choice
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
