import { Calendar, Package, Sparkles, PartyPopper } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const steps = [
  {
    number: "01",
    icon: Calendar,
    title: "Choose Your Venue",
    description: "Browse our stunning venues and select the perfect space for your event. Each venue offers unique features and ambiance.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "02",
    icon: Package,
    title: "Select a Package",
    description: "Pick from our curated packages or create a custom one. We'll tailor everything to match your vision and budget.",
    color: "from-purple-500 to-pink-500"
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Customize & Confirm",
    description: "Work with our event coordinator to finalize details - menu, decor, timeline, and special requests. Then secure your date.",
    color: "from-amber-500 to-orange-500"
  },
  {
    number: "04",
    icon: PartyPopper,
    title: "Celebrate & Enjoy",
    description: "Relax while we handle everything on your big day. We'll ensure every detail is perfect so you can focus on making memories.",
    color: "from-rose-500 to-red-500"
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 dark:bg-purple-900/30 px-4 py-2 mb-4">
            <Sparkles className="size-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-400">Simple Process</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How It <span className="text-amber-600">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From initial inquiry to your perfect celebration - we make planning effortless
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector Line (hidden on last item, mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-amber-600/50 to-transparent z-0" />
              )}

              {/* Card */}
              <div className="relative z-10 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 h-full">
                {/* Number Badge */}
                <div className="absolute -top-4 -left-4 flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-600 to-orange-600 text-white font-bold text-lg shadow-lg">
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`mb-6 inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br ${step.color} text-white group-hover:scale-110 transition-transform`}>
                  <step.icon className="size-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Info */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-8 border">
            <h3 className="text-xl font-bold mb-4 text-center">Typical Timeline</h3>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-amber-600 mb-2">24h</div>
                <div className="text-sm text-muted-foreground">Response to inquiries</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600 mb-2">7-14</div>
                <div className="text-sm text-muted-foreground">Days to finalize details</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600 mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Stress-free experience</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/events/book">
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              Start Planning Your Event
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            ✓ No credit card required • ✓ Free consultation • ✓ Flexible cancellation
          </p>
        </div>
      </div>
    </section>
  )
}
