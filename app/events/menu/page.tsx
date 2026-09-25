import { getMenuPackages } from "@/app/actions/events"
import Link from "next/link"
import { ChefHat, Pizza, Wine, Cake, Users, DollarSign, Check, Sparkles, Leaf } from "lucide-react"
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

export default async function MenuPage() {
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
            <ChefHat className="size-4" />
            <span>Catering Menus</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Delicious{" "}
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Menu Packages
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            From buffets to plated meals, we have the perfect menu for your celebration
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

                {/* Package Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {(packages as any[]).map((pkg) => (
                    <div
                      key={pkg.id}
                      className="group relative overflow-hidden rounded-2xl border bg-card shadow-lg hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                        {pkg.photo ? (
                          <img
                            src={pkg.photo}
                            alt={pkg.name}
                            className="size-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="size-full flex items-center justify-center">
                            <Icon className="size-16 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
                          {pkg.name}
                        </h3>

                        {pkg.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {pkg.description}
                          </p>
                        )}

                        {/* Pricing */}
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                          <div>
                            <p className="text-2xl font-bold text-amber-600">
                              ₱{Number(pkg.price_per_person).toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>
                          <div>
                            <div className="flex items-center gap-1 text-sm">
                              <Users className="size-4 text-blue-600" />
                              <span className="font-medium">Min {pkg.min_order} pax</span>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items Preview */}
                        {pkg.items && pkg.items.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                              Includes
                            </p>
                            <div className="space-y-1.5">
                              {pkg.items.slice(0, 4).map((item: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <Check className="size-4 flex-shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
                                  <span className="text-muted-foreground line-clamp-1">
                                    {item.name}
                                    {item.is_signature && (
                                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600">
                                        ★
                                      </span>
                                    )}
                                  </span>
                                </div>
                              ))}
                              {pkg.items.length > 4 && (
                                <p className="text-xs text-muted-foreground pl-6">
                                  +{pkg.items.length - 4} more items
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Dietary Info */}
                        {pkg.dietary_info && Object.values(pkg.dietary_info).some(v => v) && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {Object.entries(pkg.dietary_info).map(([key, value]) => 
                              value ? (
                                <div key={key} className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-xs">
                                  <Leaf className="size-3" />
                                  <span className="capitalize">{key.replace('_', ' ')}</span>
                                </div>
                              ) : null
                            )}
                          </div>
                        )}

                        {/* CTA */}
                        <Link href="/events/book" className="block">
                          <Button className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                            Select This Menu
                          </Button>
                        </Link>
                      </div>
                    </div>
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
            <Link href="/events/packages">
              <Button size="lg" variant="outline" className="min-w-[160px] border-white text-white hover:bg-white/10">
                View Event Packages
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
