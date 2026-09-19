"use client"

import { useState, useEffect } from "react"
import { checkVenueAvailability } from "@/app/actions/events"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VenueCalendarProps {
  venueId: string
}

export function VenueCalendar({ venueId }: VenueCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  useEffect(() => {
    const checkAvailability = async () => {
      setLoading(true)
      const days = daysInMonth(currentMonth)
      const newBookedDates = new Set<string>()

      // Check availability for all days in current month
      for (let day = 1; day <= days; day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
        const dateStr = date.toISOString().split("T")[0]
        
        const result = await checkVenueAvailability(venueId, dateStr)
        if (!result.available) {
          newBookedDates.add(dateStr)
        }
      }

      setBookedDates(newBookedDates)
      setLoading(false)
    }

    checkAvailability()
  }, [venueId, currentMonth])

  const renderCalendar = () => {
    const days = daysInMonth(currentMonth)
    const firstDay = firstDayOfMonth(currentMonth)
    const calendarDays = []

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="aspect-square" />
      )
    }

    // Days of the month
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let day = 1; day <= days; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const dateStr = date.toISOString().split("T")[0]
      const isBooked = bookedDates.has(dateStr)
      const isPast = date < today
      const isToday = date.getTime() === today.getTime()

      calendarDays.push(
        <div
          key={day}
          className={`
            aspect-square flex items-center justify-center text-sm rounded-lg
            ${isPast ? "text-muted-foreground/30" : ""}
            ${isToday ? "ring-2 ring-amber-600 font-bold" : ""}
            ${isBooked && !isPast ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" : ""}
            ${!isBooked && !isPast ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : ""}
          `}
        >
          {day}
        </div>
      )
    }

    return calendarDays
  }

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={previousMonth}
          className="size-8"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="size-8"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-2">
        {/* Day Labels */}
        <div className="grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground text-center">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1 opacity-50">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs pt-2 border-t">
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded bg-green-100 dark:bg-green-900/30" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="size-3 rounded bg-red-100 dark:bg-red-900/30" />
          <span className="text-muted-foreground">Booked</span>
        </div>
      </div>
    </div>
  )
}
