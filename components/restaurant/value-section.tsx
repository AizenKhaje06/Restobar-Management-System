import { Award, Utensils, Home, Users } from 'lucide-react'

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
    <section className="py-16 sm:py-20 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
            Why Choose Us
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            More Than Just a Meal
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            We offer a complete dining experience, from exceptional food to warm, inviting atmosphere
          </p>
        </div>

        {/* Value Grid - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {values.map((value, index) => {
            const Icon = value.icon
            return (
              <div
                key={index}
                className="text-center space-y-3 animate-in fade-in slide-in-from-bottom-4"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationDuration: '500ms'
                }}
              >
                {/* Icon */}
                <div className="flex justify-center">
                  <div className="size-14 sm:size-16 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Icon className="size-7 sm:size-8 text-amber-600" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Text */}
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground text-xs sm:text-sm">
                    {value.description}
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
