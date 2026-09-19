import { getVenues, getEventPackages } from "@/app/actions/events"
import { ImageIcon, Building2, Package, Sparkles } from "lucide-react"

export const metadata = {
  title: "Photo Gallery - Event Venue",
  description: "Browse our stunning venues and past events. Get inspired for your special occasion.",
}

export default async function GalleryPage() {
  const { venues } = await getVenues()
  const { packages } = await getEventPackages()

  // Collect all photos from venues and packages
  const venuePhotos = venues?.flatMap(venue => 
    (venue.photos || []).map(photo => ({
      url: photo,
      title: venue.name,
      category: "Venues",
      location: venue.location,
    }))
  ) || []

  const packagePhotos = packages?.flatMap(pkg => {
    const photos = []
    if (pkg.featured_image) {
      photos.push({
        url: pkg.featured_image,
        title: pkg.name,
        category: "Packages",
        eventType: pkg.event_type,
      })
    }
    if (pkg.gallery) {
      photos.push(...pkg.gallery.map(photo => ({
        url: photo,
        title: pkg.name,
        category: "Packages",
        eventType: pkg.event_type,
      })))
    }
    return photos
  }) || []

  const allPhotos = [...venuePhotos, ...packagePhotos]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-sm font-medium mb-4">
            <ImageIcon className="size-4" />
            <span>Photo Gallery</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Moments That{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Inspire
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore our stunning venues and past events to envision your perfect celebration
          </p>
        </div>
      </section>

      {/* Gallery Categories */}
      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className="px-4 py-2 rounded-full bg-amber-600 text-white text-sm font-medium">
              All Photos ({allPhotos.length})
            </button>
            <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-medium transition-colors">
              <Building2 className="size-4 inline mr-1.5" />
              Venues ({venuePhotos.length})
            </button>
            <button className="px-4 py-2 rounded-full bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-medium transition-colors">
              <Package className="size-4 inline mr-1.5" />
              Events ({packagePhotos.length})
            </button>
          </div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {allPhotos.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
              {allPhotos.map((photo, idx) => (
                <div
                  key={idx}
                  className="break-inside-avoid group relative overflow-hidden rounded-2xl bg-muted shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                              {photo.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              {photo.category === "Venues" ? (
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/90 text-white">
                                  Venue
                                </span>
                              ) : (
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/90 text-white">
                                  Event
                                </span>
                              )}
                              {photo.location && (
                                <span className="text-xs text-white/80 line-clamp-1">
                                  {photo.location}
                                </span>
                              )}
                            </div>
                          </div>
                          <button className="flex-shrink-0 p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                            <Sparkles className="size-4 text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <ImageIcon className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No photos available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-600 to-orange-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Create Your Own Memories?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Let us help you bring your vision to life at our stunning venues
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/events/book">
              <button className="px-8 py-3 rounded-lg bg-white text-amber-600 hover:bg-white/90 font-semibold transition-colors min-w-[160px]">
                Book Now
              </button>
            </a>
            <a href="/events/contact">
              <button className="px-8 py-3 rounded-lg border-2 border-white text-white hover:bg-white/10 font-semibold transition-colors min-w-[160px]">
                Contact Us
              </button>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
