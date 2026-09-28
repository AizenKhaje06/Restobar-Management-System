import { Building2, UtensilsCrossed, Calendar, Award } from "lucide-react"

const features = [
  {
    icon: Building2,
    title: "Fresh Ingredients",
    description: "Farm-to-table, always fresh",
  },
  {
    icon: UtensilsCrossed,
    title: "Expert Chefs",
    description: "World-class culinary team",
  },
  {
    icon: Calendar,
    title: "Cozy Ambiance",
    description: "Perfect for every occasion",
  },
  {
    icon: Award,
    title: "Great Service",
    description: "Five-star hospitality, every visit",
  }
]

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950 border-b">
      <div className="container mx-auto px-4">
        {/* Mobile: 2 rows x 2 cols, Desktop: 1 row x 4 cols - Horizontal Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '600ms'
                }}
              >
                {/* Icon with Gold Background - Left Side */}
                <div className="relative flex-shrink-0 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-md sm:shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <Icon className="size-5 sm:size-8 text-white" strokeWidth={2} />
                  
                  {/* Glow Effect on Hover */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 blur-xl group-hover:opacity-50 transition-opacity duration-300" />
                </div>

                {/* Text on Right Side */}
                <div className="flex flex-col items-start">
                  <h3 className="text-xs sm:text-lg font-bold mb-0.5 sm:mb-1 text-slate-900 dark:text-white leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] sm:text-sm text-muted-foreground leading-tight">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
