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
  Star,
  ChevronDown
} from "lucide-react"
import { TestimonialsSection } from "@/components/events/testimonials-section"
import { RecentEventsSection } from "@/components/events/recent-events-section"
import { VenuesCarousel } from "@/components/events/venues-carousel"
import { PackagesGrid } from "@/components/events/packages-grid"
import { VideoModal } from "@/components/events/video-modal"
import { FeaturesSection } from "@/components/events/features-section"

export const metadata = {
  title: "Lumière Restaurant - Fine Dining Experience in Manila",
  description:
    "Experience culinary excellence at Lumière Restaurant. Award-winning chefs, fresh ingredients, and an unforgettable dining atmosphere. Reserve your table today!",
  keywords: "fine dining Manila, restaurant Philippines, best food Manila, gourmet restaurant, luxury dining, table reservation Manila",
  openGraph: {
    title: "Lumière Restaurant - Fine Dining Experience in Manila",
    description: "Experience culinary excellence with award-winning chefs, fresh ingredients, and exceptional service.",
    type: "website",
    url: "https://yourdomain.com",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lumière Restaurant"
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

  // Structured Data for Restaurant SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Lumière Restaurant",
    "description": "Fine dining restaurant in Manila offering exquisite cuisine and exceptional service",
    "url": "https://yourdomain.com",
    "telephone": "+639171234567",
    "email": "info@restaurant.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street",
      "addressLocality": "Manila",
      "addressCountry": "Philippines",
      "postalCode": "1000"
    },
    "servesCuisine": ["International", "Asian Fusion", "Fine Dining"],
    "priceRange": "₱₱₱",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": "500",
      "bestRating": "5",
      "worstRating": "1"
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
      "opens": "11:00",
      "closes": "22:00"
    }
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

    <div className="flex flex-col">
      {/* Hero Section - Enhanced Premium */}
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
          {/* Tagline */}
          <div className="mb-4 animate-in fade-in slide-in-from-top duration-700">
            <p className="text-amber-400 text-sm md:text-base font-semibold tracking-[0.3em] uppercase">
              Good Food • Great Vibes
            </p>
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white md:text-6xl lg:text-7xl animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            Taste the
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              Extraordinary
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300 md:text-xl animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            At Lumière Restaurant, we bring together fresh ingredients,
            <br />
            skilled chefs, and a welcoming atmosphere to give you the
            <br />
            ultimate dining experience
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
            <Link href="/order">
              <Button 
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-lg font-semibold shadow-2xl shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Book A Table
                  <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </Button>
            </Link>
            
            <VideoModal />
          </div>

          {/* Trust Badges */}
          <p className="text-sm text-slate-400 mb-16 animate-in fade-in duration-700 delay-500">
            ✓ Fresh ingredients daily • ✓ Award-winning chefs • ✓ Cozy atmosphere
          </p>

          {/* Trust Indicators - Keep existing animations */}
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

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-slate-400 cursor-pointer hover:text-amber-400 transition-colors">
            <span className="text-xs uppercase tracking-wider font-medium">Scroll to explore</span>
            <ChevronDown className="size-5" />
          </div>
        </div>
      </section>

      {/* Features Section - Phase 2 ✅ */}
      <FeaturesSection />

      {/* Venues Carousel - Phase 3 ✅ (Anthore: Signature Dishes position) */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mb-12">
            <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
              Our Spaces
            </p>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Exceptional <span className="text-amber-600">Venues</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Discover our collection of meticulously designed spaces, each crafted to elevate your event experience
            </p>
          </div>

          {/* Venues Carousel */}
          <VenuesCarousel venues={venues} />

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
      </section>

      {/* Packages Grid - Phase 4 🆕 (Anthore: 2x2 Grid like Signature Dishes) */}
      <PackagesGrid packages={packages} />

      {/* Testimonials - Moved Here (Anthore position) */}
      <TestimonialsSection />

      {/* Recent Events Gallery - (Anthore: Moments of Good Food) */}
      <RecentEventsSection />

      {/* Final CTA Section - (Anthore: Ready for Delicious Experience) */}
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
