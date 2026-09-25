'use client'

import Link from "next/link"
import { ChevronRight, Calendar, Check } from "lucide-react"

interface Package {
  id: string
  name: string
  slug: string
  short_description?: string
  is_featured: boolean
  price_per_person?: number
  base_price?: number
  inclusions: { item: string }[]
}

interface PackagesCarouselProps {
  packages: Package[]
}

export function PackagesCarousel({ packages }: PackagesCarouselProps) {
  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('packages-carousel')
    if (carousel) {
      const scrollAmount = direction === 'left' ? -400 : 400
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative group/carousel">
      {/* Carousel Container */}
      <div 
        id="packages-carousel" 
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {packages.map((pkg) => (
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
        onClick={() => scrollCarousel('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:translate-x-0 size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover/carousel:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 transition-all z-10"
        aria-label="Previous packages"
      >
        <ChevronRight className="size-6 rotate-180 text-slate-900 dark:text-white" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scrollCarousel('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-0 size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover/carousel:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:border-rose-300 transition-all z-10"
        aria-label="Next packages"
      >
        <ChevronRight className="size-6 text-slate-900 dark:text-white" />
      </button>
    </div>
  )
}
