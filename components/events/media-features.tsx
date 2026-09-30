'use client'

export function MediaFeatures() {
  const mediaLogos = [
    { name: "Esquire", logo: "/esquire.png" },
    { name: "PhilStar", logo: "/philstar.png" },
    { name: "Rappler", logo: "/rappler.png" },
    { name: "Spot.ph", logo: "/spot.png" },
    { name: "Sunstar", logo: "/sunstar.png" },
    { name: "Tatler", logo: "/tatler.png" },
  ]

  // Duplicate array for seamless loop
  const duplicatedLogos = [...mediaLogos, ...mediaLogos]

  return (
    <section className="relative py-12 sm:py-16 bg-slate-900 overflow-hidden">
      {/* Subtle Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Media & Recognition
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            As Featured In
          </h2>
          <p className="text-slate-400 text-sm">
            Recognized by leading publications and media outlets
          </p>
        </div>

        {/* Scrolling Logos Container */}
        <div className="relative">
          {/* Gradient Fade - Left */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
          
          {/* Gradient Fade - Right */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>

          {/* Scrolling Track */}
          <div className="overflow-hidden">
            <div className="flex animate-scroll hover:pause-scroll">
              {duplicatedLogos.map((media, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 mx-8 sm:mx-12 flex items-center justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={media.logo}
                    alt={media.name}
                    className="h-8 sm:h-12 w-auto object-contain grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300 filter brightness-200"
                    onError={(e) => {
                      // Fallback to text if image doesn't load
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'block'
                    }}
                  />
                  <div className="hidden text-lg font-bold text-white/60">
                    {media.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-xs">
            ⭐ Trusted by food enthusiasts and critics nationwide
          </p>
        </div>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          display: flex;
          animation: scroll 30s linear infinite;
          width: max-content;
        }

        .pause-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}
