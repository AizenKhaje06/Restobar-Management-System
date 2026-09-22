"use client"

import { Check, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const packages = [
  {
    name: "Basic Package",
    slug: "basic-package",
    price: 800,
    popular: false,
    features: [
      { name: "Venue for 4 hours", included: true },
      { name: "Tables & chairs", included: true },
      { name: "Basic sound system", included: true },
      { name: "Air conditioning", included: true },
      { name: "Buffet catering", included: true },
      { name: "2 menu options", included: true },
      { name: "Basic decorations", included: true },
      { name: "Event coordinator", included: false },
      { name: "Premium sound & lights", included: false },
      { name: "Photo booth", included: false },
      { name: "Extended hours", included: false },
      { name: "Valet parking", included: false },
    ]
  },
  {
    name: "Premium Package",
    slug: "premium-package",
    price: 1200,
    popular: true,
    features: [
      { name: "Venue for 6 hours", included: true },
      { name: "Tables & chairs", included: true },
      { name: "Basic sound system", included: true },
      { name: "Air conditioning", included: true },
      { name: "Buffet catering", included: true },
      { name: "4 menu options", included: true },
      { name: "Premium decorations", included: true },
      { name: "Event coordinator", included: true },
      { name: "Premium sound & lights", included: true },
      { name: "Photo booth", included: false },
      { name: "Extended hours", included: false },
      { name: "Valet parking", included: false },
    ]
  },
  {
    name: "Luxury Package",
    slug: "luxury-package",
    price: 1800,
    popular: false,
    features: [
      { name: "Venue for 8 hours", included: true },
      { name: "Tables & chairs", included: true },
      { name: "Basic sound system", included: true },
      { name: "Air conditioning", included: true },
      { name: "Buffet catering", included: true },
      { name: "Unlimited menu options", included: true },
      { name: "Luxury decorations", included: true },
      { name: "Event coordinator", included: true },
      { name: "Premium sound & lights", included: true },
      { name: "Photo booth", included: true },
      { name: "Extended hours", included: true },
      { name: "Valet parking", included: true },
    ]
  }
]

export function ComparisonTool() {
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-2 mb-4">
            <Sparkles className="size-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-400">Compare Packages</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-amber-600">Perfect Package</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare features side-by-side to find the package that matches your needs and budget
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-7xl mx-auto overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Features Column */}
              <div className="hidden md:block">
                <div className="h-32" /> {/* Spacer for header */}
                <div className="space-y-4 pt-4">
                  {packages[0].features.map((feature, index) => (
                    <div
                      key={index}
                      className="h-12 flex items-center text-sm font-medium text-muted-foreground"
                    >
                      {feature.name}
                    </div>
                  ))}
                </div>
                <div className="h-20" /> {/* Spacer for button */}
              </div>

              {/* Package Columns */}
              {packages.map((pkg, pkgIndex) => (
                <div
                  key={pkgIndex}
                  className={`relative rounded-2xl border ${
                    pkg.popular
                      ? "border-amber-600 shadow-2xl scale-105 md:scale-110 z-10"
                      : "border-border shadow-lg"
                  } bg-card overflow-hidden`}
                >
                  {/* Popular Badge */}
                  {pkg.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-center py-2 text-xs font-bold uppercase tracking-wide">
                      Most Popular
                    </div>
                  )}

                  {/* Header */}
                  <div className={`p-6 text-center ${pkg.popular ? "pt-12" : ""}`}>
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-amber-600">₱{pkg.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">/person</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {pkg.name === "Basic Package" && "Perfect for intimate gatherings"}
                      {pkg.name === "Premium Package" && "Most popular for celebrations"}
                      {pkg.name === "Luxury Package" && "Premium experience included"}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="px-6 pb-6 space-y-4">
                    {pkg.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="h-12 flex items-center gap-3"
                      >
                        {feature.included ? (
                          <>
                            <div className="size-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                              <Check className="size-3 text-green-600" />
                            </div>
                            <span className="text-sm md:hidden">{feature.name}</span>
                          </>
                        ) : (
                          <>
                            <div className="size-5 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                              <X className="size-3 text-red-600" />
                            </div>
                            <span className="text-sm md:hidden text-muted-foreground">{feature.name}</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-6">
                    <Link href={`/events/packages/${pkg.slug}`}>
                      <Button
                        size="lg"
                        className={`w-full ${
                          pkg.popular
                            ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                            : ""
                        }`}
                        variant={pkg.popular ? "default" : "outline"}
                      >
                        {pkg.popular ? "Choose Popular" : "Learn More"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Need something different? We can create a custom package just for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events/contact">
              <Button size="lg" variant="outline">
                Request Custom Package
              </Button>
            </Link>
            <Link href="/events/packages">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600">
                View All Packages
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
