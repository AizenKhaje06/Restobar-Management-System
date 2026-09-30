import { Truck, Store, Award, ChefHat } from "lucide-react"
import { ScrollReveal } from "@/components/ui/scroll-reveal"

const features = [
  {
    icon: Truck,
    title: "METRO MANILA DELIVERY",
    description: "Fresh lechon delivered to your doorsteps.",
  },
  {
    icon: Store,
    title: "STORE PICKUP",
    description: "Convenient and easy pick up from our store.",
  },
  {
    icon: Award,
    title: "60 YEARS OF TRADITION",
    description: "Mastering lechon roasting for decades.",
  },
  {
    icon: ChefHat,
    title: "PREMIUM INGREDIENTS",
    description: "Fresh pork and quality herbs, every time.",
  }
]

export function FeaturesSection() {
  return (
    <ScrollReveal>
    <section className="w-full bg-gradient-to-r from-orange-500 to-orange-600 py-4">
      <div className="container mx-auto px-4">
        {/* Responsive Grid: 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="flex items-center gap-4"
              >
                {/* Icon - White with slight opacity */}
                <div className="flex-shrink-0">
                  <Icon className="size-10 sm:size-12 text-white" strokeWidth={1.5} />
                </div>

                {/* Text */}
                <div className="flex flex-col">
                  <h3 className="text-white font-bold text-sm sm:text-base leading-tight uppercase tracking-wide">
                    {feature.title}
                  </h3>
                  <p className="text-white/90 text-xs sm:text-sm leading-tight mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
    </ScrollReveal>
  )
}
