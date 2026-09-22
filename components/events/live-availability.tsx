"use client"

import { useState, useEffect } from "react"
import { Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// Simulate availability data
const generateAvailability = () => {
  const today = new Date()
  const availability = []
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    
    // Random availability (70% available, 20% limited, 10% booked)
    const rand = Math.random()
    let status: "available" | "limited" | "booked"
    
    if (rand > 0.9) status = "booked"
    else if (rand > 0.7) status = "limited"
    else status = "available"
    
    availability.push({
      date: date,
      status: status,
      slots: status === "booked" ? 0 : status === "limited" ? Math.floor(Math.random() * 2) + 1 : 3
    })
  }
  
  return availability
}

export function LiveAvailability() {
  const [availability, setAvailability] = useState<ReturnType<typeof generateAvailability>>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())

  useEffect(() => {
    setAvailability(generateAvailability())
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      setAvailability(generateAvailability())
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const statusConfig = {
    available: {
      label: "Available",
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-900"
    },
    limited: {
      label: "Limited Slots",
      color: "bg-amber-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-900"
    },
    booked: {
      label: "Fully Booked",
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-200 dark:border-red-900"
    }
  }

  const getStatusIcon = (status: keyof typeof statusConfig) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="size-4" />
      case "limited":
        return <Clock className="size-4" />
      case "booked":
        return <AlertCircle className="size-4" />
    }
  }

  const availableCount = availability.filter(a => a.status === "available").length
  const limitedCount = availability.filter(a => a.status === "limited").length

  return (
    <section className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 mb-4">
            <Calendar className="size-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-400">Live Availability</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Check <span className="text-amber-600">Available Dates</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See real-time availability for the next 30 days. Book your preferred date before it's gone!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-6 rounded-xl border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="size-5 text-green-600" />
                <span className="font-bold text-2xl text-green-600">{availableCount}</span>
              </div>
              <div className="text-sm text-muted-foreground">Dates Available</div>
            </div>

            <div className="p-6 rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="size-5 text-amber-600" />
                <span className="font-bold text-2xl text-amber-600">{limitedCount}</span>
              </div>
              <div className="text-sm text-muted-foreground">Limited Slots</div>
            </div>

            <div className="p-6 rounded-xl border bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="size-5 text-blue-600" />
                <span className="font-bold text-2xl text-blue-600">High</span>
              </div>
              <div className="text-sm text-muted-foreground">Demand Period</div>
            </div>
          </div>
        </div>

        {/* Availability Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Next 30 Days</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                <span>Updated in real-time</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
              {availability.slice(0, 15).map((day, index) => {
                const config = statusConfig[day.status]
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${config.borderColor} ${config.bgColor} hover:shadow-md transition-shadow`}
                  >
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground mb-1">
                        {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold mb-2">
                        {day.date.getDate()}
                      </div>
                      <div className={`flex items-center justify-center gap-1 text-xs ${config.textColor}`}>
                        {getStatusIcon(day.status)}
                        <span className="font-medium">
                          {day.status === "available" ? "Open" : day.status === "limited" ? `${day.slots} left` : "Full"}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 pt-6 border-t">
              <div className="text-sm font-semibold">Legend:</div>
              {Object.entries(statusConfig).map(([key, config]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`size-3 rounded-full ${config.color}`} />
                  <span className="text-sm text-muted-foreground">{config.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-sm font-medium mb-6">
            <AlertCircle className="size-4" />
            <span>Dates are filling up fast! Book now to secure your spot.</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events/book">
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                Book Available Date
              </Button>
            </Link>
            <Link href="/events/contact">
              <Button size="lg" variant="outline">
                Request Custom Date
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
