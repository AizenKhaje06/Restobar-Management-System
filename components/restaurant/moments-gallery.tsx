'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

const moments = [
  { id: 1, image: "/api/placeholder/400/400", alt: "Delicious pasta" },
  { id: 2, image: "/api/placeholder/400/400", alt: "Fine dining" },
  { id: 3, image: "/api/placeholder/400/400", alt: "Grilled steak" },
  { id: 4, image: "/api/placeholder/400/400", alt: "Restaurant ambiance" },
  { id: 5, image: "/api/placeholder/400/400", alt: "Happy customers" },
  { id: 6, image: "/api/placeholder/400/400", alt: "Fresh ingredients" },
  { id: 7, image: "/api/placeholder/400/400", alt: "Signature dishes" },
  { id: 8, image: "/api/placeholder/400/400", alt: "Cozy atmosphere" },
  { id: 9, image: "/api/placeholder/400/400", alt: "Chef's special" },
  { id: 10, image: "/api/placeholder/400/400", alt: "Dessert selection" }
]

export function MomentsGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Show 5 cards at a time
  const visibleCards = 5
  const maxIndex = moments.length - visibleCards

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  // Get the 5 visible moments
  const visibleMoments = moments.slice(currentIndex, currentIndex + visibleCards)

  return (
    <ScrollReveal>
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 max-w-[1600px]">
        {/* Header - Compact */}
        <div className="mb-10">
          <p className="text-amber-600 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider mb-2">
            Our Gallery
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            Moments of <span className="text-amber-500 italic font-serif">Good Food</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            A glimpse of the delicious moments at Lydia's Lechon
          </p>
        </div>

        {/* Gallery Container with Navigation */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="size-5 text-slate-900 dark:text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="size-5 text-slate-900 dark:text-white" />
          </button>

          {/* Gallery Grid - 5 columns in 1 row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 px-12">
            {visibleMoments.map((moment, index) => (
              <div
                key={moment.id}
                className="bg-white dark:bg-slate-800 rounded-lg p-3 pb-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:rotate-1"
              >
                <div className="relative aspect-square overflow-hidden group cursor-pointer">
                  {/* Image Placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600" />
                  
                  {/* Hover Overlay with Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
                  
                  {/* Zoom Effect */}
                  <div className="absolute inset-0 transform group-hover:scale-110 transition-transform duration-500" />
                </div>
                
                {/* Photo Caption/Label at bottom */}
                <div className="mt-3 text-center">
                  <p className="text-slate-700 dark:text-slate-300 text-xs font-handwriting italic">{moment.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots - Compact */}
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                currentIndex === index ? 'bg-amber-600 w-6' : 'bg-slate-300 dark:bg-slate-700 w-2'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
    </ScrollReveal>
  )
}
