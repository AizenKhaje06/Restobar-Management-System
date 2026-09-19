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

export const metadata = {
  title: "Lumière Events - Luxury Event Venue & Catering",
  description:
    "Elevate your celebrations at Lumière Events. Premium venues, exquisite catering, and flawless execution for weddings, corporate events, and milestone celebrations.",
}

export default async function EventsLandingPage() {
  const [venuesResult, packagesResult] = await Promise.all([
    getVenues(),
    getEventPackages({ featured_only: true }),
  ])

  const venues = venuesResult.venues || []
  const packages = packagesResult.packages || []

  return (
    <div className="flex flex-col">
      {/* Hero Section - Premium */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6bTAgMjRjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHpNMTIgMTZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHptMCAyNGMwLTQuNDE4IDMuNTgyLTggOC04czggMy41ODIgOCA4LTMuNTgyIDgtOCA4LTgtMy41ODItOC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900"></div>
        
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/events/book">
              <Button 
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6 text-lg font-semibold shadow-2xl shadow-amber-500/25 transition-all hover:shadow-amber-500/40 hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Book Your Event
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

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Award, label: "500+ Events", sublabel: "Successfully Hosted" },
              { icon: Star, label: "5.0 Rating", sublabel: "Customer Reviews" },
              { icon: Users, label: "50,000+", sublabel: "Happy Guests" },
              { icon: Heart, label: "100%", sublabel: "Satisfaction Rate" },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <stat.icon className="size-8 mb-3 text-amber-400" />
                <div className="text-2xl font-bold text-white">{stat.label}</div>
                <div className="text-sm text-slate-400">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <span className="text-xs uppercase tracking-wider">Scroll to explore</span>
            <ChevronRight className="size-5 rotate-90" />
          </div>
        </div>
      </section>

      {/* Featured Venues Section */}
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

          {/* Venues Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.slice(0, 3).map((venue) => (
              <Link
                key={venue.id}
                href={`/events/venues/${venue.id}`}
                className="group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 transition-all hover:shadow-2xl hover:scale-[1.02]"
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

      {/* Packages Section */}
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

          {/* Packages Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/events/packages/${pkg.slug}`}
                className="group relative overflow-hidden rounded-2xl border bg-white dark:bg-slate-950 p-8 transition-all hover:shadow-2xl hover:border-rose-400 dark:hover:border-rose-600"
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
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtNC40MTggMy41ODItOCA4LThzOCAzLjU4MiA4IDgtMy41ODIgOC04IDgtOC0zLjU4Mi04LTh6bTAgMjRjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHpNMTIgMTZjMC00LjQxOCAzLjU4Mi04IDgtOHM4IDMuNTgyIDggOC0zLjU4MiA4LTggOC04LTMuNTgyLTgtOHptMCAyNGMwLTQuNDE4IDMuNTgyLTggOC04czggMy41ODIgOCA4LTMuNTgyIDgtOCA4LTgtMy41ODItOC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        
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
  )
}
