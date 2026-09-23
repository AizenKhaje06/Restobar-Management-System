import { getEventPackage } from "@/app/actions/events"
import { notFound } from "next/navigation"
import Link from "next/link"
import { 
  Package, 
  Users, 
  Clock, 
  Check,
  ArrowLeft,
  Calendar,
  ChevronRight,
  Sparkles,
  DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EventType } from "@/lib/types/events"

const eventTypeColors: Record<EventType, { badge: string; gradient: string }> = {
  birthday: { badge: "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400", gradient: "from-pink-500 to-rose-500" },
  wedding: { badge: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400", gradient: "from-purple-500 to-pink-500" },
  corporate: { badge: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400", gradient: "from-blue-500 to-cyan-500" },
  christening: { badge: "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400", gradient: "from-sky-500 to-blue-500" },
  graduation: { badge: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400", gradient: "from-indigo-500 to-purple-500" },
  anniversary: { badge: "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400", gradient: "from-rose-500 to-red-500" },
  reunion: { badge: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400", gradient: "from-orange-500 to-amber-500" },
  seminar: { badge: "bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400", gradient: "from-teal-500 to-emerald-500" },
  product_launch: { badge: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400", gradient: "from-violet-500 to-purple-500" },
  team_building: { badge: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400", gradient: "from-green-500 to-teal-500" },
  other: { badge: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400", gradient: "from-amber-500 to-orange-500" },
}

const eventTypeLabels: Record<EventType, string> = {
  birthday: "Birthday",
  wedding: "Wedding",
  corporate: "Corporate Event",
  christening: "Christening",
  graduation: "Graduation",
  anniversary: "Anniversary",
  reunion: "Reunion",
  seminar: "Seminar",
  product_launch: "Product Launch",
  team_building: "Team Building",
  other: "Other Event",
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { package: pkg } = await getEventPackage(slug)
  
  if (!pkg) {
    return {
      title: "Package Not Found",
    }
  }

  return {
    title: `${pkg.name} - Event Packages`,
    description: pkg.short_description || pkg.description || `Book ${pkg.name} for your next event`,
  }
}

export default async function PackageDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { package: pkg, error } = await getEventPackage(slug)

  if (error || !pkg) {
    notFound()
  }

  const colors = eventTypeColors[pkg.event_type] || eventTypeColors.other

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/events/packages" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" />
          <span>Back to Packages</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pb-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Main Image */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted relative">
              {pkg.featured_image ? (
                <img
                  src={pkg.featured_image}
                  alt={pkg.name}
                  className="size-full object-cover"
                />
              ) : (
                <div className="size-full flex items-center justify-center">
                  <Package className="size-24 text-muted-foreground/30" />
                </div>
              )}
              {/* Featured Badge */}
              {pkg.is_featured && (
                <div className="absolute top-4 right-4">
                  <div className="px-4 py-2 rounded-full bg-amber-600 text-white text-sm font-bold shadow-lg flex items-center gap-2">
                    <Sparkles className="size-4" />
                    <span>Featured Package</span>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {pkg.gallery && pkg.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {pkg.gallery.slice(0, 4).map((photo, idx) => (
                  <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo}
                      alt={`${pkg.name} - Gallery ${idx + 1}`}
                      className="size-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Package Info */}
          <div className="space-y-6">
            {/* Event Type Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.badge} font-semibold`}>
              <Sparkles className="size-4" />
              <span>{eventTypeLabels[pkg.event_type]}</span>
            </div>

            {/* Package Name */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
                {pkg.name}
              </h1>
              {pkg.short_description && (
                <p className="text-lg text-muted-foreground">
                  {pkg.short_description}
                </p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <Users className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Guests</p>
                  <p className="font-bold text-sm">{pkg.min_guests}-{pkg.max_guests}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                  <Clock className="size-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-bold text-sm">{pkg.duration_hours}h</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <DollarSign className="size-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Starting</p>
                  <p className="font-bold text-sm">
                    {pkg.price_per_person 
                      ? `₱${Number(pkg.price_per_person).toLocaleString()}/p`
                      : pkg.base_price 
                      ? `₱${Number(pkg.base_price).toLocaleString()}`
                      : "Contact"}
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="p-6 rounded-2xl border bg-card shadow-lg">
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-1">Package Price</p>
                {pkg.price_per_person ? (
                  <>
                    <p className="text-3xl font-bold text-amber-600">
                      ₱{Number(pkg.price_per_person).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">per person</p>
                  </>
                ) : pkg.base_price ? (
                  <>
                    <p className="text-3xl font-bold text-amber-600">
                      ₱{Number(pkg.base_price).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">base price</p>
                  </>
                ) : (
                  <p className="text-lg text-muted-foreground">Contact us for pricing</p>
                )}
              </div>

              <div className="space-y-3">
                <Link href="/events/book" className="block">
                  <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                    <Calendar className="size-4 mr-2" />
                    Book This Package
                  </Button>
                </Link>
                <Link href="/events/contact" className="block">
                  <Button variant="outline" className="w-full">
                    Request Custom Quote
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {pkg.description && (
              <div>
                <h2 className="text-2xl font-bold mb-4">About This Package</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {pkg.description}
                </p>
              </div>
            )}

            {/* Package Inclusions */}
            {pkg.inclusions && pkg.inclusions.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">What's Included</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {pkg.inclusions.map((inclusion, idx) => {
                    const item = typeof inclusion === "string" ? inclusion : inclusion.item
                    const description = typeof inclusion === "object" ? inclusion.description : undefined
                    const quantity = typeof inclusion === "object" ? inclusion.quantity : undefined
                    const duration = typeof inclusion === "object" ? inclusion.duration : undefined
                    
                    return (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-xl border bg-card">
                        <div className="flex size-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 mt-0.5">
                          <Check className="size-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{item}</p>
                          {description && (
                            <p className="text-sm text-muted-foreground mt-1">{description}</p>
                          )}
                          {(quantity || duration) && (
                            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                              {quantity && <span>Qty: {quantity}</span>}
                              {duration && <span>Duration: {duration}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Available Add-ons */}
            {pkg.available_addons && pkg.available_addons.length > 0 && (
              <div className="p-6 rounded-2xl border bg-muted/30">
                <h2 className="text-xl font-bold mb-3">Customization Options</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Enhance your package with these optional add-ons
                </p>
                <div className="flex flex-wrap gap-2">
                  {pkg.available_addons.map((addon, idx) => (
                    <div key={idx} className="px-3 py-1.5 rounded-full bg-background border text-sm">
                      {addon}
                    </div>
                  ))}
                </div>
                <Link href="/events/book" className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View All Add-ons
                  </Button>
                </Link>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="p-6 rounded-2xl border bg-card">
              <h2 className="text-xl font-bold mb-4">Terms & Conditions</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>50% deposit required upon booking confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Full payment due 7 days before the event</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Cancellation 30 days prior: Full refund of deposit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Cancellation 15-29 days: 50% refund of deposit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Cancellation less than 14 days: No refund</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Guest count adjustments accepted up to 3 days before event</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Contact & CTA */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="p-6 rounded-2xl border bg-card shadow-lg sticky top-20">
              <h3 className="font-bold mb-4">Have Questions?</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Phone</p>
                  <a href="tel:+639171234567" className="font-medium hover:text-amber-600">
                    +63 917 123 4567
                  </a>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Email</p>
                  <a href="mailto:events@restaurant.com" className="font-medium hover:text-amber-600">
                    events@restaurant.com
                  </a>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Hours</p>
                  <p className="font-medium">Mon-Sun: 8 AM - 10 PM</p>
                </div>
              </div>
              <Link href="/events/contact" className="block mt-6">
                <Button variant="outline" className="w-full">
                  Send Inquiry
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* More Packages */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Explore Other Packages
          </h2>
          <p className="text-muted-foreground mb-8">
            We have more amazing packages for every occasion
          </p>
          <Link href="/events/packages">
            <Button variant="outline" size="lg">
              View All Packages
              <ChevronRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
