import { getEventPackages } from "@/app/actions/events"
import Link from "next/link"
import { Package, Users, Clock, Check, ChevronRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { EventType } from "@/lib/types/events"

export const metadata = {
  title: "Event Packages - Event Venue",
  description: "Explore our all-inclusive event packages for weddings, birthdays, corporate events, and more.",
}

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
  corporate: "Corporate",
  christening: "Christening",
  graduation: "Graduation",
  anniversary: "Anniversary",
  reunion: "Reunion",
  seminar: "Seminar",
  product_launch: "Product Launch",
  team_building: "Team Building",
  other: "Other",
}

export default async function PackagesPage() {
  const { packages, error } = await getEventPackages()

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive">Failed to load packages. Please try again later.</p>
      </div>
    )
  }

  // Group packages by event type
  const groupedPackages = packages?.reduce((acc, pkg) => {
    if (!acc[pkg.event_type]) {
      acc[pkg.event_type] = []
    }
    acc[pkg.event_type].push(pkg)
    return acc
  }, {} as Record<EventType, typeof packages>)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-sm font-medium mb-4">
            <Package className="size-4" />
            <span>Event Packages</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            All-Inclusive{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Event Packages
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for your perfect event, beautifully packaged
          </p>
        </div>
      </section>

      {/* Packages by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4 space-y-16">
          {groupedPackages && Object.entries(groupedPackages).map(([eventType, pkgs]) => {
            const type = eventType as EventType
            const colors = eventTypeColors[type] || eventTypeColors.other
            
            return (
              <div key={eventType} className="space-y-6">
                {/* Category Header */}
                <div className="flex items-center gap-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.badge} font-semibold`}>
                    <Sparkles className="size-4" />
                    <span>{eventTypeLabels[type]} Packages</span>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Package Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {pkgs.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="group relative overflow-hidden rounded-2xl border bg-card shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Featured Badge */}
                      {pkg.is_featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="px-3 py-1 rounded-full bg-amber-600 text-white text-xs font-bold shadow-lg">
                            Featured
                          </div>
                        </div>
                      )}

                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                        {pkg.featured_image ? (
                          <img
                            src={pkg.featured_image}
                            alt={pkg.name}
                            className="size-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <Package className="size-16 text-muted-foreground/30" />
                          </div>
                        )}
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
                          {pkg.name}
                        </h3>

                        {pkg.short_description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {pkg.short_description}
                          </p>
                        )}

                        {/* Stats */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 text-xs font-medium">
                            <Users className="size-3" />
                            <span>{pkg.min_guests}-{pkg.max_guests} guests</span>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 text-xs font-medium">
                            <Clock className="size-3" />
                            <span>{pkg.duration_hours} hours</span>
                          </div>
                        </div>

                        {/* Inclusions Preview */}
                        {pkg.inclusions && pkg.inclusions.length > 0 && (
                          <div className="mb-4 space-y-1.5">
                            {pkg.inclusions.slice(0, 4).map((inclusion, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <Check className="size-4 flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                                <span className="text-muted-foreground line-clamp-1">
                                  {typeof inclusion === "string" ? inclusion : inclusion.item}
                                </span>
                              </div>
                            ))}
                            {pkg.inclusions.length > 4 && (
                              <p className="text-xs text-muted-foreground pl-6">
                                +{pkg.inclusions.length - 4} more inclusions
                              </p>
                            )}
                          </div>
                        )}

                        {/* Price & CTA */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div>
                            {pkg.price_per_person ? (
                              <>
                                <p className="text-2xl font-bold text-amber-600">
                                  ₱{Number(pkg.price_per_person).toLocaleString()}
                                </p>
                                {(pkg.min_guests || pkg.max_guests) && (
                                  <p className="text-xs text-muted-foreground">
                                    For {pkg.min_guests}-{pkg.max_guests} pax
                                  </p>
                                )}
                              </>
                            ) : pkg.base_price ? (
                              <>
                                <p className="text-2xl font-bold text-amber-600">
                                  ₱{Number(pkg.base_price).toLocaleString()}
                                </p>
                                {(pkg.min_guests || pkg.max_guests) && (
                                  <p className="text-xs text-muted-foreground">
                                    For {pkg.min_guests}-{pkg.max_guests} pax
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">Contact for pricing</p>
                            )}
                          </div>
                          <Link href={`/events/packages/${pkg.slug}`}>
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 group-hover:gap-2 transition-all"
                            >
                              View Details
                              <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}

          {(!packages || packages.length === 0) && (
            <div className="text-center py-16">
              <Package className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No packages available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-600 to-orange-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Need a Custom Package?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            We can create a personalized package tailored to your specific needs and budget
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events/contact">
              <Button size="lg" variant="secondary" className="min-w-[160px]">
                Contact Us
              </Button>
            </Link>
            <Link href="/events/book">
              <Button size="lg" variant="outline" className="min-w-[160px] border-white text-white hover:bg-white/10">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
