const moments = [
  { id: 1, image: "/api/placeholder/400/400", alt: "Delicious pasta" },
  { id: 2, image: "/api/placeholder/400/400", alt: "Fine dining" },
  { id: 3, image: "/api/placeholder/400/400", alt: "Grilled steak" },
  { id: 4, image: "/api/placeholder/400/400", alt: "Restaurant ambiance" }
]

export function MomentsGallery() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header - Compact */}
        <div className="mb-10">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
            Our Gallery
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            Moments of Good Food
          </h2>
          <p className="text-muted-foreground text-sm">
            A glimpse of the delicious moments at Lumière
          </p>
        </div>

        {/* Gallery Grid - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {moments.map((moment, index) => (
            <div
              key={moment.id}
              className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer animate-in fade-in zoom-in"
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: '500ms'
              }}
            >
              {/* Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600" />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              
              {/* Zoom Effect */}
              <div className="absolute inset-0 transform group-hover:scale-110 transition-transform duration-500" />
            </div>
          ))}
        </div>

        {/* Pagination Dots - Compact */}
        <div className="flex justify-center gap-2 mt-6">
          <div className="size-2 rounded-full bg-amber-600" />
          <div className="size-2 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="size-2 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>
    </section>
  )
}
