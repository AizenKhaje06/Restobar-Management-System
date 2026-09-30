import { Award, Utensils, Home, Users } from 'lucide-react'
import { StaggerContainer, StaggerItem, FadeUp } from '@/components/ui/scroll-animations'

const values = [
  {
    icon: Award,
    title: "Premium Quality",
    description: "Only the freshest ingredients"
  },
  {
    icon: Utensils,
    title: "Creative Menu",
    description: "Unique & inspired dishes"
  },
  {
    icon: Home,
    title: "Lovely Atmosphere",
    description: "Perfect for any occasion"
  },
  {
    icon: Users,
    title: "Friendly Staff",
    description: "Always here to serve"
  }
]

export function ValueSection() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">
      {/* Elegant Restaurant Background */}
      <div className="absolute inset-0">
        {/* Base Gradient - Warm Restaurant Colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-amber-950 dark:to-slate-900"></div>
        
        {/* Decorative Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #d97706 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}></div>
        </div>

        {/* Subtle Diagonal Lines */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #d97706 0px,
              #d97706 1px,
              transparent 1px,
              transparent 60px
            )`
          }}></div>
        </div>

        {/* Radial Glow - Top Left */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-radial from-amber-200/40 via-orange-200/20 to-transparent dark:from-amber-600/20 dark:via-orange-600/10 rounded-full blur-3xl"></div>
        
        {/* Radial Glow - Bottom Right */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-radial from-rose-200/40 via-orange-200/20 to-transparent dark:from-rose-600/20 dark:via-orange-600/10 rounded-full blur-3xl"></div>

        {/* Center Ambient Light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-radial from-amber-100/30 via-transparent to-transparent dark:from-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative z-10 mx-auto px-4 max-w-6xl">
        {/* Header */}
        <FadeUp>
        <div className="text-center mb-12">
          <p className="text-amber-600 dark:text-amber-500 text-xs font-semibold uppercase tracking-[0.2em] mb-2">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-white">
            More Than Just a Meal
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            We offer a complete dining experience, from exceptional food to warm, inviting atmosphere
          </p>
        </div>
        </FadeUp>

        {/* Value Grid - 2x2 on mobile, 4 columns on desktop */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <StaggerItem key={index} index={index}>
              <div
                className="group relative text-center space-y-3"
              >
                {/* Card Background with Glass Effect */}
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-amber-200/40 dark:border-amber-700/30 shadow-lg group-hover:shadow-xl group-hover:border-amber-300/60 dark:group-hover:border-amber-600/50 transition-all duration-300"></div>
                
                {/* Hover Glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-rose-500/5"></div>

                {/* Content */}
                <div className="relative p-6">
                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      {/* Icon Glow Ring */}
                      <div className="absolute inset-0 size-14 sm:size-16 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-md group-hover:blur-lg transition-all duration-300"></div>
                      
                      {/* Icon Container */}
                      <div className="relative size-14 sm:size-16 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center border border-amber-200/50 dark:border-amber-700/50 group-hover:scale-110 transition-transform duration-300 shadow-md">
                        <Icon className="size-7 sm:size-8 text-amber-600 dark:text-amber-500" strokeWidth={1.5} />
                      </div>
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <h3 className="font-bold text-base sm:text-lg mb-1 text-slate-900 dark:text-white">
                      {value.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm">
                      {value.description}
                    </p>
                  </div>
                </div>
              </div>
              </StaggerItem>
            )
          })}
        </StaggerContainer>
      </div>
    </section>
  )
}
