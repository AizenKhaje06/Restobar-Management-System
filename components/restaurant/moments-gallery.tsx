'use client'

import { ScrollReveal } from '@/components/ui/scroll-reveal'

const moments = [
  { id: 1, image: "/C1.jpg", alt: "Delicious pasta" },
  { id: 2, image: "/C2.jpg", alt: "Fine dining" },
  { id: 3, image: "/C3.jpg", alt: "Grilled steak" },
  { id: 4, image: "/C4.jpg", alt: "Restaurant ambiance" },
  { id: 5, image: "/C5.jpg", alt: "Happy customers" },
  { id: 6, image: "/C6.jpg", alt: "Fresh ingredients" },
  { id: 7, image: "/C7.jpg", alt: "Signature dishes" },
  { id: 8, image: "/C8.jpg", alt: "Cozy atmosphere" },
  { id: 9, image: "/C9.jpg", alt: "Chef's special" },
  { id: 10, image: "/C10.jpg", alt: "Dessert selection" }
]

export function MomentsGallery() {
  // Duplicate array for seamless infinite loop
  const duplicatedMoments = [...moments, ...moments]

  return (
    <ScrollReveal>
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900 overflow-hidden">
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

        {/* Scrolling Gallery Container */}
        <div className="relative">
          {/* Gradient Fade - Left */}
          <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
          
          {/* Gradient Fade - Right */}
          <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-slate-50 dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>

          {/* Scrolling Track */}
          <div className="overflow-hidden py-4">
            <div className="flex animate-scroll-gallery hover:pause-scroll gap-6">
              {duplicatedMoments.map((moment, index) => {
                // Alternate between large and normal: even = large, odd = normal
                const isLarge = index % 2 === 0
                
                return (
                  <div
                    key={`${moment.id}-${index}`}
                    className={`flex-shrink-0 transition-all duration-500 ${
                      isLarge 
                        ? 'w-[280px] sm:w-[340px] scale-110' 
                        : 'w-[240px] sm:w-[280px]'
                    }`}
                  >
                    <div className="bg-white dark:bg-slate-800 rounded-lg p-3 pb-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:rotate-1">
                      <div className="relative aspect-square overflow-hidden group cursor-pointer rounded-lg">
                        {/* Actual Image */}
                        <img 
                          src={moment.image} 
                          alt={moment.alt}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        
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
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scroll-gallery {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-gallery {
          display: flex;
          animation: scroll-gallery 40s linear infinite;
          width: max-content;
        }

        .pause-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
    </ScrollReveal>
  )
}
