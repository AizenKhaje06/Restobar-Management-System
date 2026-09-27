'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

const popularItems = [
  { id: 1, name: "Grilled Salmon", price: "₱850", image: "/api/placeholder/300/300" },
  { id: 2, name: "Fettuccine Pasta", price: "₱650", image: "/api/placeholder/300/300" },
  { id: 3, name: "BBQ Ribs", price: "₱950", image: "/api/placeholder/300/300" },
  { id: 4, name: "Chocolate Lava Cake", price: "₱350", image: "/api/placeholder/300/300" }
]

export function PopularItems() {
  const scrollCarousel = (direction: 'left' | 'right') => {
    const carousel = document.getElementById('popular-carousel')
    if (carousel) {
      const scrollAmount = direction === 'left' ? -280 : 280
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">
              Popular
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Our Most Popular Meals
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Handpicked favorites loved by our guests
            </p>
          </div>
          
          {/* Navigation Arrows - Desktop Only */}
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => scrollCarousel('left')}
              className="size-10 rounded-full bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-center"
              aria-label="Previous"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="size-10 rounded-full bg-white dark:bg-slate-800 border shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex items-center justify-center"
              aria-label="Next"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            id="popular-carousel"
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {popularItems.map((item) => (
              <div
                key={item.id}
                className="flex-none w-[160px] sm:w-[200px] snap-start"
              >
                <div className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group cursor-pointer">
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-amber-500 to-orange-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  
                  {/* Content */}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-amber-600 font-bold text-base">
                      {item.price}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
