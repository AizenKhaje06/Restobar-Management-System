import { Building2, UtensilsCrossed, Calendar, Award } from "lucide-react"

const features = [
  {
    icon: Building2,
    title: "Premium Venues",
    description: "Multiple stunning locations to choose from",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: UtensilsCrossed,
    title: "World-Class Catering",
    description: "Award-winning chefs and exquisite menus",
    color: "from-rose-500 to-pink-500"
  },
  {
    icon: Calendar,
    title: "Full Event Planning",
    description: "End-to-end coordination and support",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Award,
    title: "Proven Excellence",
    description: "500+ successful events and counting",
    color: "from-purple-500 to-violet-500"
  }
]

export function FeaturesSection() {
  return (
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-950 border-b">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="group flex flex-col items-center text-center p-6 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '600ms'
                }}
              >
                {/* Icon with Gradient Background */}
                <div className={`relative mb-6 p-4 rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                  <Icon className="size-8 text-white" strokeWidth={2} />
                  
                  {/* Glow Effect on Hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 blur-xl group-hover:opacity-50 transition-opacity duration-300`} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground leading-relaxed">
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
