import { getVenues, getEventPackages } from "@/app/actions/events"
import { HeroSection } from "@/components/events/hero-section"
import { VenuePreview } from "@/components/events/venue-preview"
import { PackagePreview } from "@/components/events/package-preview"
import { StatsSection } from "@/components/events/stats-section"
import { CTASection } from "@/components/events/cta-section"
import { TestimonialsSection } from "@/components/events/testimonials-section"

export const metadata = {
  title: "Event Venue - Make Your Event Unforgettable",
  description: "Perfect venue for weddings, birthdays, and corporate events. Book your dream event today.",
}

export default async function EventsLandingPage() {
  // Fetch data server-side
  const { venues } = await getVenues()
  const { packages } = await getEventPackages({ featured_only: true })

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats/Trust Indicators */}
      <StatsSection />

      {/* Featured Venues */}
      <section className="py-16 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Our Stunning Venues
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our elegant indoor halls, beautiful garden spaces, and modern rooftop decks
            </p>
          </div>
          <VenuePreview venues={venues || []} />
        </div>
      </section>

      {/* Featured Packages */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Event Packages
            </h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
              All-inclusive packages designed to make your event planning stress-free
            </p>
          </div>
          <PackagePreview packages={packages || []} />
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final CTA */}
      <CTASection />
    </div>
  )
}
