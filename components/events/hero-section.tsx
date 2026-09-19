"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Users, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02]" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-amber-200/30 dark:bg-amber-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-rose-200/30 dark:bg-rose-800/10 rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border shadow-sm mb-6">
          <Sparkles className="size-4 text-amber-600" />
          <span className="text-sm font-medium">Premium Event Venue</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight mb-6 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
          Make Your Event
          <br />
          Unforgettable
        </h1>

        <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Perfect venue for weddings, birthdays, and corporate events.
          <br className="hidden sm:block" />
          Create lasting memories with us.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/events/book">
            <Button
              size="lg"
              className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-xl hover:shadow-2xl transition-all"
            >
              <CalendarDays className="mr-2 size-5" />
              Book Your Event Now
            </Button>
          </Link>
          <Link href="/events/venues">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg font-semibold border-2 hover:bg-white/50 dark:hover:bg-zinc-900/50"
            >
              <Users className="mr-2 size-5" />
              Explore Venues
            </Button>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border shadow-lg">
            <div className="text-4xl font-black text-amber-600 mb-2">500+</div>
            <div className="text-sm font-medium text-muted-foreground">Successful Events</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border shadow-lg">
            <div className="text-4xl font-black text-orange-600 mb-2">150+</div>
            <div className="text-sm font-medium text-muted-foreground">Happy Clients</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border shadow-lg">
            <div className="text-4xl font-black text-rose-600 mb-2">20+</div>
            <div className="text-sm font-medium text-muted-foreground">Event Packages</div>
          </div>
        </div>
      </div>
    </section>
  )
}
