import { Shield, CheckCircle2, Award, Users } from "lucide-react"

const badges = [
  {
    icon: Shield,
    title: "Secure Payments",
    description: "SSL encrypted transactions"
  },
  {
    icon: CheckCircle2,
    title: "Quality Guaranteed",
    description: "100% satisfaction or refund"
  },
  {
    icon: Award,
    title: "Award Winning",
    description: "Best Venue 2023"
  },
  {
    icon: Users,
    title: "500+ Events",
    description: "Successfully hosted"
  }
]

export function TrustBadgesSection() {
  return (
    <section className="py-12 border-y bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white">
                <badge.icon className="size-7" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base">{badge.title}</div>
                <div className="text-xs text-muted-foreground">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
