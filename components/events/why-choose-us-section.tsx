import { 
  Shield, 
  Users, 
  UtensilsCrossed, 
  Car, 
  Zap, 
  Award,
  HeadphonesIcon,
  CalendarCheck,
  Sparkles
} from "lucide-react"

const features = [
  {
    icon: Shield,
    title: "Flexible Cancellation",
    description: "Life happens. Get up to 90% refund with our fair cancellation policy.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Coordinator",
    description: "Your personal event coordinator from planning to execution.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: UtensilsCrossed,
    title: "Award-Winning Catering",
    description: "500+ menu items from our in-house culinary team. Dietary needs accommodated.",
    color: "from-amber-500 to-orange-500"
  },
  {
    icon: Car,
    title: "Free Parking",
    description: "Complimentary parking for 100+ vehicles with valet service available.",
    color: "from-green-500 to-emerald-500"
  },
  {
    icon: Zap,
    title: "Backup Power",
    description: "Commercial-grade generator ensures uninterrupted events, rain or shine.",
    color: "from-rose-500 to-red-500"
  },
  {
    icon: Award,
    title: "Premium AV Equipment",
    description: "State-of-the-art sound system, LED screens, and lighting included.",
    color: "from-indigo-500 to-purple-500"
  },
  {
    icon: CalendarCheck,
    title: "Flexible Payment Plans",
    description: "Split payments into 3-4 installments with no interest. Budget-friendly.",
    color: "from-teal-500 to-cyan-500"
  },
  {
    icon: Users,
    title: "Experienced Team",
    description: "500+ events executed flawlessly. We've seen it all and we've got you.",
    color: "from-orange-500 to-amber-500"
  }
]

export function WhyChooseUsSection() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 mb-4">
            <Sparkles className="size-4 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-400">Why Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-amber-600">Lumière Events</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We go beyond just providing a venue - we deliver complete peace of mind
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-2xl transition-all duration-300"
            >
              {/* Gradient Background on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity`} />

              {/* Icon */}
              <div className={`relative mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white`}>
                <feature.icon className="size-6" />
              </div>

              {/* Content */}
              <h3 className="relative text-lg font-bold mb-2">{feature.title}</h3>
              <p className="relative text-sm text-muted-foreground">
                {feature.description}
              </p>

              {/* Hover Indicator */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Additional Trust Signals */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
            <div className="text-4xl font-bold text-amber-600 mb-2">15+</div>
            <div className="text-sm font-medium mb-1">Years Experience</div>
            <div className="text-xs text-muted-foreground">Serving Manila since 2008</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
            <div className="text-4xl font-bold text-rose-600 mb-2">98%</div>
            <div className="text-sm font-medium mb-1">Client Satisfaction</div>
            <div className="text-xs text-muted-foreground">Would recommend to friends</div>
          </div>
          
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
            <div className="text-sm font-medium mb-1">Support Available</div>
            <div className="text-xs text-muted-foreground">Before, during & after event</div>
          </div>
        </div>

        {/* Certifications & Awards */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-6">Certified & Awarded</p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="px-6 py-3 border rounded-lg text-sm font-semibold">DOH Certified</div>
            <div className="px-6 py-3 border rounded-lg text-sm font-semibold">ISO 9001</div>
            <div className="px-6 py-3 border rounded-lg text-sm font-semibold">Best Venue 2023</div>
            <div className="px-6 py-3 border rounded-lg text-sm font-semibold">BIR Registered</div>
          </div>
        </div>
      </div>
    </section>
  )
}
