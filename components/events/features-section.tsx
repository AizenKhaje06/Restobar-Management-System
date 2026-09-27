import { Building2, UtensilsCrossed, Calendar, Award } from "lucide-react"

const features = [
  {
    icon: Building2,
    title: "Fresh Ingredients",
    description: "Farm-to-table, always fresh",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: UtensilsCrossed,
    title: "Expert Chefs",
    description: "World-class culinary team",
    color: "from-rose-500 to-pink-500"
  },
  {
    icon: Calendar,
    title: "Cozy Ambiance",
    description: "Perfect for every occasion",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Award,
    title: "Great Service",
    description: "Five-star hospitality, every visit",
    color: "from-purple-500 to-violet-500"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-slate-950 border-b">
      <div className="container mx-auto px-4">
        {/* Mobile: 4 columns fixed, Desktop: 4 columns - NO SCROLL */}
        <div className="grid grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group flex flex-col items-center text-center rounded-xl sm:rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '600ms'
                }}
              >
                {/* Icon with Gradient Background - Smaller on mobile */}
                <div className={`relative mb-2 sm:mb-6 p-2 sm:p-4 rounded-lg sm:rounded-2xl bg-gradient-to-br ${feature.color} shadow-md sm:shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <Icon className="size-4 sm:size-8 text-white" strokeWidth={2} />
                  
                  {/* Glow Effect on Hover */}
                  <div className={`absolute inset-0 rounded-lg sm:rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 blur-xl group-hover:opacity-50 transition-opacity duration-300`} />
                </div>

                {/* Title - Smaller on mobile */}
                <h3 className="text-[10px] sm:text-xl font-bold mb-1 sm:mb-2 text-slate-900 dark:text-white leading-tight">
                  {feature.title}
                </h3>

                {/* Description - Hidden on mobile, show on sm+ */}
                <p className="hidden sm:block text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
