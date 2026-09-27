import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, Calendar, Heart, Briefcase, Cake } from "lucide-react"

interface Package {
  id: string
  name: string
  slug: string
  event_type?: string
  short_description?: string
}

interface PackagesGridProps {
  packages: Package[]
}

const categoryIcons = {
  wedding: Heart,
  corporate: Briefcase,
  birthday: Cake,
  default: Calendar
}

const categoryColors = {
  wedding: "from-rose-600 to-pink-600",
  corporate: "from-blue-600 to-cyan-600", 
  birthday: "from-purple-600 to-violet-600",
  default: "from-amber-600 to-orange-600"
}

export function PackagesGrid({ packages }: PackagesGridProps) {
  // Get first 4 packages
  const displayPackages = packages.slice(0, 4)

  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12">
          <p className="text-amber-600 dark:text-amber-400 text-sm font-semibold uppercase tracking-wider mb-3">
            Our Packages
          </p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Discover Our
            <br />
            <span className="text-amber-600">Signature Packages</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl text-lg">
            From intimate gatherings to grand celebrations, we've crafted packages that exceed expectations
          </p>
        </div>

        {/* 2x2 Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
          {displayPackages.map((pkg, index) => {
            const eventType = pkg.event_type || 'default'
            const Icon = categoryIcons[eventType as keyof typeof categoryIcons] || categoryIcons.default
            const gradient = categoryColors[eventType as keyof typeof categoryColors] || categoryColors.default

            return (
              <Link
                key={pkg.id}
                href={`/events/packages/${pkg.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-slate-900 animate-in fade-in slide-in-from-bottom-8"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '600ms'
                }}
              >
                {/* Dark Background with Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />

                {/* Content */}
                <div className="relative h-full p-8 flex flex-col justify-between">
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br ${gradient} text-white mb-4`}>
                    <Icon className="size-6" />
                  </div>

                  {/* Bottom Content */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                      {pkg.name}
                    </h3>
                    {pkg.short_description && (
                      <p className="text-slate-300 text-sm line-clamp-2 mb-4">
                        {pkg.short_description}
                      </p>
                    )}

                    {/* View Details Link */}
                    <div className="flex items-center gap-2 text-amber-400 font-medium text-sm">
                      View Details
                      <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/50 rounded-2xl transition-colors duration-300" />
              </Link>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/events/packages">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-8"
            >
              View All Packages
              <ChevronRight className="size-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
