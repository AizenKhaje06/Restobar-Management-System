import { getMenuPackages } from "@/app/actions/events"
import Link from "next/link"
import { Package, ChefHat, Pizza, Wine, Cake, Users, DollarSign, Check, Sparkles, Leaf, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Menu Packages - Event Catering",
  description: "Explore our delicious catering menu packages for your event",
}

const categoryIcons = {
  buffet: ChefHat,
  plated: Pizza,
  drinks: Wine,
  dessert: Cake,
}

const categoryColors = {
  buffet: "from-orange-500 to-amber-500",
  plated: "from-purple-500 to-pink-500",
  drinks: "from-blue-500 to-cyan-500",
  dessert: "from-pink-500 to-rose-500",
}

const categoryLabels = {
  buffet: "Buffet Packages",
  plated: "Plated Meal Packages",
  drinks: "Beverage Packages",
  dessert: "Dessert Packages",
}

export default async function PackagesPage() {
  const { menuPackages, error } = await getMenuPackages()

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-destructive">Failed to load menu packages. Please try again later.</p>
      </div>
    )
  }

  // Group by category
  const byCategory = menuPackages?.reduce((acc, pkg) => {
    if (!acc[pkg.category]) acc[pkg.category] = []
    acc[pkg.category].push(pkg)
    return acc
  }, {} as Record<string, NonNullable<typeof menuPackages>>) || {}

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative py-16 sm:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-sm font-medium mb-4">
            <Sparkles className="size-4" />
            <span>Made for sharing, made for memories.</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Signature Celebration Packages
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for a delicious celebration.
          </p>
        </div>
      </section>

      {/* Menu Packages by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4 space-y-16">
          {Object.entries(byCategory).map(([category, packages]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons]
            const gradient = categoryColors[category as keyof typeof categoryColors]
            const label = categoryLabels[category as keyof typeof categoryLabels]

            return (
              <div key={category} className="space-y-6">
                {/* Category Header */}
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg mb-4`}>
                    <Icon className="size-5" />
                    <span>{label}</span>
                  </div>
                </div>

                {/* Package Grid - Travel Card Style */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {(packages as any[]).map((pkg) => (
                    <Link
                      key={pkg.id}
                      href={`/events/packages/${pkg.id}`}
                      className="group relative"
                    >
                      {/* Card with stacked effect - Travel Style */}
                      <div className="relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                        {/* Main Image */}
                        <div className="aspect-[3/4] overflow-hidden bg-muted relative">
                          {pkg.photo ? (
                            <img
                              src={pkg.photo}
                              alt={pkg.name}
                              className="size-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100">
                              <Icon className="size-24 text-muted-foreground/30" />
                            </div>
                          )}
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />

                          {/* Menu Name Sidebar */}
                          <div className="absolute right-0 top-0 bottom-0 w-12 bg-black/90 backdrop-blur-sm flex items-center justify-center">
                            <p className="text-white font-bold text-sm tracking-wider transform -rotate-90 whitespace-nowrap origin-center">
                              {pkg.category.toUpperCase()}
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
                            {/* Package Name */}
                            <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                              <div className="text-white">
                                <Icon className="size-4 mb-1" />
                                <span className="text-xs font-semibold">{pkg.name}</span>
                              </div>
                            </div>

                            {/* Min Order */}
                            <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                              <div className="flex items-center gap-2 text-white">
                                <Users className="size-4" />
                                <span className="text-xs font-semibold">Min {pkg.min_order} pax</span>
                              </div>
                            </div>

                            {/* Dietary Info */}
                            {pkg.dietary_info && Object.values(pkg.dietary_info).some(v => v) && (
                              <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                                <div className="flex items-center gap-2 text-white">
                                  <Leaf className="size-4" />
                                  <span className="text-xs font-semibold">Special Diet</span>
                                </div>
                              </div>
                            )}

                            {/* Items Count */}
                            {pkg.items && pkg.items.length > 0 && (
                              <div className="px-4 py-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20">
                                <div className="flex items-center gap-2 text-white">
                                  <ChefHat className="size-4" />
                                  <span className="text-xs font-semibold">{pkg.items.length} Items</span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Overlay Content - Bottom */}
                          <div className="absolute bottom-0 left-0 right-14 p-6 text-white">
                            {/* Package Capacity Range */}
                            <div className="flex items-center gap-6 mb-4">
                              <div>
                                <div className="text-3xl font-bold">{pkg.min_order}+</div>
                                <div className="text-xs opacity-80">Minimum</div>
                              </div>
                              <div>
                                <div className="text-3xl font-bold">
                                  {pkg.capacity_max ? `${pkg.capacity_min}-${pkg.capacity_max}` : 'Flexible'}
                                </div>
                                <div className="text-xs opacity-80">Good for</div>
                              </div>
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                              <div className="text-sm opacity-80">Package Price</div>
                              <div className="text-3xl font-bold">₱{Number(pkg.price_per_person).toLocaleString()}</div>
                              <div className="text-xs opacity-80">per package</div>
                            </div>

                            {/* View Button */}
                            <button className="w-full py-3 px-6 rounded-2xl bg-amber-600/80 backdrop-blur-md hover:bg-amber-600 transition-all font-semibold text-sm flex items-center justify-center gap-2 group-hover:gap-3">
                              View Details
                              <ChevronRight className="size-4" />
                            </button>
                          </div>
                        </div>

                        {/* Best Value Badge (optional) */}
                        {pkg.items && pkg.items.length >= 8 && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold shadow-lg">
                            Best Value
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}

          {(!menuPackages || menuPackages.length === 0) && (
            <div className="text-center py-16">
              <ChefHat className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No menu packages available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-600 to-orange-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Need a Custom Menu?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            We can customize any menu to match your preferences and dietary requirements
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
