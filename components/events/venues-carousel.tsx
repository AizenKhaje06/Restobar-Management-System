'use client'

import Link from "next/link"
import { ChevronRight, Users } from "lucide-react"

interface Venue {
  id: string
  name: string
  capacity_min: number
  capacity_max: number
  base_rate: number
  photos: string[]
}

interface VenuesCarouselProps {
  venues: Venue[]
}

export function VenuesCarousel({ venues }: VenuesCarouselProps) {
  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('venues-carousel')
    if (carousel) {
      const scrollAmount = direction === 'left' ? -400 : 400
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative group/carousel">
      {/* Carousel Container */}
      <div 
        id="venues-carousel" 
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {venues.map((venue) => (
          <Link
            key={venue.id}
            href={`/events/venues/${venue.id}`}
            className="flex-none w-[calc(100%-2rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1rem)] snap-start group relative overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 transition-all hover:shadow-2xl hover:scale-[1.02]"
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

      {/* Left Arrow */}
      <button
        onClick={() => scrollCarousel('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:translate-x-0 size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover/carousel:opacity-100 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 transition-all z-10"
        aria-label="Previous venues"
      >
        <ChevronRight className="size-6 rotate-180 text-slate-900 dark:text-white" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={() => scrollCarousel('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-0 size-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 opacity-0 group-hover/carousel:opacity-100 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-300 transition-all z-10"
        aria-label="Next venues"
      >
        <ChevronRight className="size-6 text-slate-900 dark:text-white" />
      </button>
    </div>
  )
}
