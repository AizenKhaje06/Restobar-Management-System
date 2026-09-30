'use client'

import { ScrollReveal } from '@/components/ui/scroll-reveal'

export function DigitalPartners() {
  const partners = [
    {
      name: "Foodpanda",
      logo: "/foodpanda.png",
      alt: "Foodpanda"
    },
    {
      name: "GrabFood",
      logo: "/grab.png",
      alt: "GrabFood"
    },
    {
      name: "Maya",
      logo: "/maya.png",
      alt: "Maya"
    },
    {
      name: "GCash",
      logo: "/gcash1.png",
      alt: "GCash"
    }
  ]

  return (
    <ScrollReveal>
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Animated Digital Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Glowing Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${5 + Math.random() * 10}s`
              }}
            ></div>
          ))}
        </div>

        {/* Diagonal Lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                style={{
                  top: `${i * 12.5}%`,
                  width: '150%',
                  transform: `rotate(-15deg) translateX(-25%)`,
                  animation: `shimmer ${3 + i * 0.5}s infinite`,
                  animationDelay: `${i * 0.3}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-8">
          <h2 
            className="text-3xl sm:text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 drop-shadow-lg" 
            style={{ fontFamily: 'cursive' }}
          >
            Our digital partners
          </h2>
          <p className="text-cyan-100 text-sm">
            Foodpanda and GrabFood orders are accepted from 10AM to 7PM only.
          </p>
        </div>

        {/* Partners Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 items-center justify-items-center max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <div 
              key={index}
              className="group relative flex items-center justify-center p-6 transition-all duration-300 hover:scale-110"
            >
              {/* Glowing Card Background */}
              <div className="absolute inset-0 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl group-hover:bg-white/20 group-hover:border-cyan-400/50 transition-all duration-300">
                {/* Shine Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Glow on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-cyan-500/20 group-hover:via-purple-500/20 group-hover:to-pink-500/20 blur-xl transition-all duration-300"></div>

              {/* Logo */}
              <div className="relative z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={partner.logo}
                  alt={partner.alt}
                  className="h-12 sm:h-16 w-auto object-contain filter drop-shadow-lg group-hover:drop-shadow-2xl transition-all duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'block'
                  }}
                />
                <div className="hidden text-xl font-bold text-white">
                  {partner.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Digital Wave Decoration */}
        <div className="mt-12 flex justify-center">
          <div className="flex gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full animate-wave"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15}px`,
                  animationDelay: `${i * 0.1}s`
                }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(50px);
          }
        }
        
        @keyframes shimmer {
          0% {
            opacity: 0;
            transform: rotate(-15deg) translateX(-25%) translateY(0);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: rotate(-15deg) translateX(-25%) translateY(100px);
          }
        }

        @keyframes wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-wave {
          animation: wave 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
    </ScrollReveal>
  )
}
