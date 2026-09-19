import Link from "next/link"
import { Check, ArrowRight, Sparkles } from "lucide-react"
import type { EventPackage } from "@/lib/types/events"

export function PackagePreview({ packages }: { packages: EventPackage[] }) {
  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'birthday':
        return 'from-pink-500 to-rose-500'
      case 'wedding':
        return 'from-purple-500 to-pink-500'
      case 'corporate':
        return 'from-blue-500 to-cyan-500'
      default:
        return 'from-amber-500 to-orange-500'
    }
  }

  const getEventTypeLabel = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.slice(0, 3).map((pkg) => (
          <Link 
            key={pkg.id} 
            href={`/events/packages/${pkg.slug}`}
            className="group block"
          >
            <div className="relative overflow-hidden rounded-2xl border bg-card hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col">
              {/* Featured Badge */}
              {pkg.is_featured && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="px-3 py-1.5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Sparkles className="size-3" />
                    Featured
                  </div>
                </div>
              )}

              {/* Image */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {pkg.featured_image || pkg.gallery[0] ? (
                  <img 
                    src={pkg.featured_image || pkg.gallery[0]} 
                    alt={pkg.name}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className={`flex items-center justify-center h-full bg-gradient-to-br ${getEventTypeColor(pkg.event_type)}`}>
                    <Sparkles className="size-16 text-white/50" />
                  </div>
                )}
                {/* Type Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${getEventTypeColor(pkg.event_type)} text-white text-xs font-bold shadow-lg`}>
                    {getEventTypeLabel(pkg.event_type)}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold mb-2 group-hover:text-amber-600 transition-colors">
                  {pkg.name}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                  {pkg.short_description || pkg.description}
                </p>

                {/* Inclusions */}
                {pkg.inclusions && pkg.inclusions.length > 0 && (
                  <div className="space-y-2 mb-4 flex-1">
                    {pkg.inclusions.slice(0, 4).map((inclusion, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="size-4 text-green-600 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{inclusion.item}</span>
                      </div>
                    ))}
                    {pkg.inclusions.length > 4 && (
                      <p className="text-xs text-muted-foreground pl-6">
                        +{pkg.inclusions.length - 4} more inclusions
                      </p>
                    )}
                  </div>
                )}

                <div className="pt-4 border-t mt-auto">
                  <div className="flex items-center justify-between">
                    <div>
                      {pkg.price_per_person ? (
                        <>
                          <p className="text-xs text-muted-foreground">Starting at</p>
                          <p className="text-2xl font-black text-amber-600">
                            ₱{pkg.price_per_person.toLocaleString()}
                            <span className="text-sm font-normal text-muted-foreground">/person</span>
                          </p>
                        </>
                      ) : pkg.base_price ? (
                        <>
                          <p className="text-xs text-muted-foreground">Package Price</p>
                          <p className="text-2xl font-black text-amber-600">
                            ₱{pkg.base_price.toLocaleString()}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">Custom Pricing</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {pkg.min_guests}-{pkg.max_guests} guests
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600 font-semibold text-sm">
                      View
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center">
        <Link href="/events/packages">
          <button className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:shadow-xl transition-all hover:scale-105">
            View All Packages
            <ArrowRight className="ml-2 size-5" />
          </button>
        </Link>
      </div>
    </div>
  )
}
