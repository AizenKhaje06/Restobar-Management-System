import { Award, Heart, Shield, Sparkles } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Sparkles,
      value: "Premium",
      label: "Quality Service",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: Shield,
      value: "Trusted",
      label: "By 500+ Clients",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Award,
      value: "Award",
      label: "Winning Venue",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Heart,
      value: "100%",
      label: "Satisfaction Rate",
      color: "from-rose-500 to-red-500"
    },
  ]

  return (
    <section className="py-16 border-b bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div 
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card hover:shadow-lg transition-all"
              >
                <div className={`flex items-center justify-center size-14 rounded-full bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}>
                  <Icon className="size-7 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-black mb-1 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
