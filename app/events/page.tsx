import { getVenues, getEventPackages } from "@/app/actions/events"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Users, 
  Sparkles, 
  Award, 
  Heart,
  Building2,
  ChevronRight,
  Check,
  Star
} from "lucide-react"
import { TestimonialsSection } from "@/components/events/testimonials-section"
import { HowItWorksSection } from "@/components/events/how-it-works-section"
import { WhyChooseUsSection } from "@/components/events/why-choose-us-section"
import { FaqSection } from "@/components/events/faq-section"
import { RecentEventsSection } from "@/components/events/recent-events-section"
import { TrustBadgesSection } from "@/components/events/trust-badges-section"
import { PricingCalculator } from "@/components/events/pricing-calculator"
import { LiveAvailability } from "@/components/events/live-availability"
import { ComparisonTool } from "@/components/events/comparison-tool"

export const metadata = {
  title: "Lumière Events - Luxury Event Venue & Catering in Manila",
  description:
    "Premier event venue in Manila. Stunning venues, award-winning catering, and flawless execution for weddings, corporate events, and celebrations. Book your perfect event today!",
  keywords: "event venue Manila, wedding venue Philippines, corporate event space, birthday party venue, luxury event hall, event catering Manila",
  openGraph: {
    title: "Lumière Events - Luxury Event Venue & Catering in Manila",
    description: "Premier event venue with stunning spaces, award-winning catering, and exceptional service for all your celebrations.",
    type: "website",
    url: "https://yourdomain.com/events",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lumière Events Venue"
      }
    ]
  }
}

export default async function EventsLandingPage() {
  const [venuesResult, packagesResult] = await Promise.all([
    getVenues(),
    getEventPackages({ featured_only: true }),
  ])

  const venues = venuesResult.venues || []
  const packages = packagesResult.packages || []

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EventVenue",
    "name": "Lumière Events",
    "description": "Premier event venue in Manila offering stunning spaces for weddings, corporate events, and celebrations",
    "url": "https://yourdomain.com/events",
    "telephone": "+639171234567",
    "email": "events@restaurant.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street",
      "addressLocality": "Manila",
      "addressCountry": "Philippines",
      "postalCode": "1000"
    },
    "priceRange": "₱₱₱",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "500",
      "bestRating": "5",
      "worstRating": "1"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.5995",
      "longitude": "120.9842"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "08:00",
      "closes": "22:00"
    },
    "amenityFeature": [
      {
        "@type": "LocationFeatureSpecification",
        "name": "Parking",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Air Conditioning",
        "value": true
      },
      {
        "@type": "LocationFeatureSpecification",
        "name": "Catering",
        "value": true
      }
    ],
    "sameAs": [
      "https://facebook.com/lumiereevents",
      "https://instagram.com/lumiereevents"
    ]
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

    <div className="flex flex-col">
      {/* Hero Section - Premium */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/LydiasBG3.png" 
            alt="Lumière Events Background"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Dark Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80"></div>
        
        <div className="container relative z-10 mx-auto px-4 py-20 text-center">
          {/* Premium Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="size-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-100">Premium Event Experiences</span>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl">
            Where Moments Become
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Timeless Memories
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl">
            Exquisite venues, world-class catering, and impeccable service for your most cherished celebrations
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link href="/events/book">
              <Button 
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-lg font-semibold shadow-2xl shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Check Availability
                  <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </Button>
            </Link>
            
            <Link href="/events/venues">
              <Button 
                size="lg" 
                variant="outline"
                className="border-slate-600 bg-slate-800/50 px-8 py-6 text-lg font-semibold text-white backdrop-blur-sm hover:bg-slate-700/50 hover:border-slate-500"
              >
                Explore Venues
              </Button>
            </Link>
          </div>

          {/* Trust Badges */}
          <p className="text-sm text-slate-400 mb-16">
            ✓ No credit card required • ✓ Free consultation • ✓ Flexible cancellation
          </p>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Award, label: "500+ Events", sublabel: "Successfully Hosted" },
              { icon: Star, label: "5.0 Rating", sublabel: "Customer Reviews" },
              { icon: Users, label: "50,000+", sublabel: "Happy Guests" },
              { icon: Heart, label: "100%", sublabel: "Satisfaction Rate" },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${600 + (i * 100)}ms`,
                  animationDuration: '600ms'
                }}
              >
                <stat.icon className="size-8 mb-3 text-amber-400 animate-in zoom-in" 
                  style={{
                    animationDelay: `${700 + (i * 100)}ms`,
                    animationDuration: '400ms'
                  }}
                />
                <div className="text-2xl font-bold text-white">{stat.label}</div>
                <div className="text-sm text-slate-400">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
            <ChevronRight className="size-5 rotate-90" />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Trust Badges Section */}
      <TrustBadgesSection />

      {/* Featured Venues Section - Carousel */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 dark:bg-amber-950/30 px-4 py-2 mb-4">
              <Building2 className="size-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-900 dark:text-amber-400">Our Spaces</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Exceptional <span className="text-amber-600">Venues</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our collection of meticulously designed spaces, each crafted to elevate your event experience
            </p>
          </div>

          {/* Venues Carousel */}
          <div className="relative group/carousel">
            {/* Carousel Container */}
            <div 
              id="venues-carousel" 
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {venues.map((venue, index) => (
                <Link
                  key={venue.id}
                  href={`/events/venues/${venue.id}`}
                  className="flex-none w-[calc(100%-2rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] snap-start group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 transition-all hover:shadow-2xl hover:scale-[1.02]"
                >
                  {/* Image */}
                  <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900">
                    {venue.photos && venue.photos[0] && (
                      <img
                        src={venue.photos[0]}
                        alt={venue.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2">{venue.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/90">
                      <span className="flex items-center gap-1">
                        <Users className="size-4" />
                        {venue.capacity_min}-{venue.capacity_max}
                      </span>
                      <span className="flex items-center gap-1">
                        ₱{Number(venue.base_rate).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100">
                    <ChevronRight className="size-5 text-slate-900" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Left Arrow */}
            <button
              onClick={(e) => {
                e.preventDefault()
                const carousel = document.getElementById('venues-carousel')
                if (carousel) {
                  carousel.scrollBy({ left: -400, behavior: 'smooth' })
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:translate-x-0 size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover/carousel:opacity-100 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 transition-all z-10"
              aria-label="Previous venues"
            >
              <ChevronRight className="size-6 rotate-180 text-slate-900 dark:text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={(e) => {
                e.preventDefault()
                const carousel = document.getElementById('venues-carousel')
                if (carousel) {
                  carousel.scrollBy({ left: 400, behavior: 'smooth' })
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-0 size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover/carousel:opacity-100 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 transition-all z-10"
              aria-label="Next venues"
            >
              <ChevronRight className="size-6 text-slate-900 dark:text-white" />
            </button>
          </div>

          {/* View All Link */}
          <div className="text-center mt-12">
            <Link href="/events/venues">
              <Button size="lg" variant="outline" className="group">
                View All Venues
                <ChevronRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Hide scrollbar CSS */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>

      {/* Packages Section - Carousel */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 dark:bg-rose-950/30 px-4 py-2 mb-4">
              <Sparkles className="size-4 text-rose-600" />
              <span className="text-sm font-medium text-rose-900 dark:text-rose-400">Curated Packages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Tailored <span className="text-rose-600">Experiences</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From intimate gatherings to grand celebrations, we've crafted packages that exceed expectations
            </p>
          </div>

          {/* Packages Carousel */}
          <div className="relative group/carousel">
            {/* Carousel Container */}
            <div 
              id="packages-carousel" 
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {packages.map((pkg, index) => (
                <Link
                  key={pkg.id}
                  href={`/events/packages/${pkg.slug}`}
                  className="flex-none w-[calc(100%-2rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] snap-start group relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-950 p-8 transition-all hover:shadow-2xl hover:border-rose-400 dark:hover:border-rose-600"
                >
                  {/* Featured Badge */}
                  {pkg.is_featured && (
                    <div className="absolute top-4 right-4">
                      <div className="rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1 text-xs font-semibold text-white">
                        POPULAR
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white">
                    <Calendar className="size-6" />
                  </div>

                  <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                  <p className="text-muted-foreground mb-6 line-clamp-2">{pkg.short_description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-amber-600">
                      ₱{pkg.price_per_person ? Number(pkg.price_per_person).toLocaleString() : Number(pkg.base_price).toLocaleString()}
                    </span>
                    {pkg.price_per_person && (
                      <span className="text-muted-foreground"> /person</span>
                    )}
                  </div>

                  {/* Inclusions */}
                  <ul className="space-y-2 mb-6">
                    {pkg.inclusions.slice(0, 4).map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="size-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{inc.item}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-amber-600 font-medium group-hover:gap-3 transition-all">
                    Learn More
                    <ChevronRight className="size-4" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Left Arrow */}
            <button
              onClick={(e) => {
                e.preventDefault()
                const carousel = document.getElementById('packages-carousel')
                if (carousel) {
                  carousel.scrollBy({ left: -400, behavior: 'smooth' })
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:translate-x-0 size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover/carousel:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 transition-all z-10"
              aria-label="Previous packages"
            >
              <ChevronRight className="size-6 rotate-180 text-slate-900 dark:text-white" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={(e) => {
                e.preventDefault()
                const carousel = document.getElementById('packages-carousel')
                if (carousel) {
                  carousel.scrollBy({ left: 400, behavior: 'smooth' })
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-0 size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover/carousel:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 transition-all z-10"
              aria-label="Next packages"
            >
              <ChevronRight className="size-6 text-slate-900 dark:text-white" />
            </button>
          </div>

          {/* View All Link */}
          <div className="text-center mt-12">
            <Link href="/events/packages">
              <Button size="lg" variant="outline" className="group">
                View All Packages
                <ChevronRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Hide scrollbar CSS */}
        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>

      {/* Package Comparison Tool */}
      <ComparisonTool />

      {/* Pricing Calculator */}
      <PricingCalculator />

      {/* Why Choose Us Section */}
      <WhyChooseUsSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Recent Events Showcase */}
      <RecentEventsSection />

      {/* Live Availability */}
      <LiveAvailability />

      {/* FAQ Section */}
      <FaqSection />

      {/* Final CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/LydiasBG3.png" 
            alt="Lumière Events"
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/80"></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Something
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              Extraordinary?
            </span>
          </h2>
          
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Let us help you craft an unforgettable experience for you and your guests
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/events/book">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-lg font-semibold shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-105 transition-all"
              >
                Start Planning Your Event
              </Button>
            </Link>
            
            <Link href="/events/contact">
              <Button 
                size="lg" 
                variant="outline"
                className="border-slate-600 bg-slate-800/50 px-8 py-6 text-lg font-semibold text-white backdrop-blur-sm hover:bg-slate-700/50"
              >
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  )
}
