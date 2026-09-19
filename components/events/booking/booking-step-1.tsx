"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, Sparkles, ChevronRight } from "lucide-react"
import type { BookingFormStep1, EventType } from "@/lib/types/events"

interface BookingStep1Props {
  data: BookingFormStep1
  onUpdate: (data: BookingFormStep1) => void
  onNext: () => void
}

const eventTypes: { value: EventType; label: string; icon: string }[] = [
  { value: "birthday", label: "Birthday Party", icon: "🎂" },
  { value: "wedding", label: "Wedding", icon: "💒" },
  { value: "corporate", label: "Corporate Event", icon: "🏢" },
  { value: "christening", label: "Christening", icon: "👶" },
  { value: "graduation", label: "Graduation", icon: "🎓" },
  { value: "anniversary", label: "Anniversary", icon: "💝" },
  { value: "reunion", label: "Reunion", icon: "👨‍👩‍👧‍👦" },
  { value: "seminar", label: "Seminar/Workshop", icon: "📚" },
  { value: "product_launch", label: "Product Launch", icon: "🚀" },
  { value: "team_building", label: "Team Building", icon: "🤝" },
  { value: "other", label: "Other Event", icon: "🎉" },
]

export function BookingStep1({ data, onUpdate, onNext }: BookingStep1Props) {
  const [formData, setFormData] = useState<BookingFormStep1>(data)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (field: keyof BookingFormStep1, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.event_type) {
      newErrors.event_type = "Please select an event type"
    }
    if (!formData.event_date) {
      newErrors.event_date = "Event date is required"
    } else {
      const selectedDate = new Date(formData.event_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.event_date = "Event date must be in the future"
      }
    }
    if (!formData.event_start_time) {
      newErrors.event_start_time = "Start time is required"
    }
    if (!formData.event_end_time) {
      newErrors.event_end_time = "End time is required"
    }
    if (formData.event_start_time && formData.event_end_time) {
      if (formData.event_start_time >= formData.event_end_time) {
        newErrors.event_end_time = "End time must be after start time"
      }
    }
    if (!formData.num_guests || formData.num_guests < 1) {
      newErrors.num_guests = "Number of guests must be at least 1"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      onUpdate(formData)
      onNext()
    }
  }

  // Calculate duration
  const duration = formData.event_start_time && formData.event_end_time
    ? (() => {
        const start = new Date(`2000-01-01T${formData.event_start_time}`)
        const end = new Date(`2000-01-01T${formData.event_end_time}`)
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
        return hours > 0 ? hours : 0
      })()
    : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
          <Sparkles className="size-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Tell Us About Your Event</h2>
        <p className="text-muted-foreground">
          Let's start with the basic details of your celebration
        </p>
      </div>

      {/* Event Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium">
          Event Type *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {eventTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleChange("event_type", type.value)}
              className={`
                p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg
                ${
                  formData.event_type === type.value
                    ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                    : "border-border hover:border-amber-600/50"
                }
              `}
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="text-sm font-medium">{type.label}</div>
            </button>
          ))}
        </div>
        {errors.event_type && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.event_type}</p>
        )}
      </div>

      {/* Event Name */}
      <div className="space-y-2">
        <label htmlFor="event_name" className="block text-sm font-medium">
          Event Name (Optional)
        </label>
        <input
          type="text"
          id="event_name"
          value={formData.event_name}
          onChange={(e) => handleChange("event_name", e.target.value)}
          className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
          placeholder="e.g., Sarah's 18th Birthday"
        />
        <p className="text-xs text-muted-foreground">
          Give your event a special name (optional)
        </p>
      </div>

      {/* Date and Time */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Event Date */}
        <div className="space-y-2">
          <label htmlFor="event_date" className="block text-sm font-medium">
            Event Date *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="size-5 text-muted-foreground" />
            </div>
            <input
              type="date"
              id="event_date"
              value={formData.event_date}
              onChange={(e) => handleChange("event_date", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.event_date && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.event_date}</p>
          )}
        </div>

        {/* Number of Guests */}
        <div className="space-y-2">
          <label htmlFor="num_guests" className="block text-sm font-medium">
            Number of Guests *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Users className="size-5 text-muted-foreground" />
            </div>
            <input
              type="number"
              id="num_guests"
              value={formData.num_guests}
              onChange={(e) => handleChange("num_guests", parseInt(e.target.value) || 0)}
              min="1"
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.num_guests && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.num_guests}</p>
          )}
        </div>
      </div>

      {/* Start and End Time */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Start Time */}
        <div className="space-y-2">
          <label htmlFor="event_start_time" className="block text-sm font-medium">
            Start Time *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <input
              type="time"
              id="event_start_time"
              value={formData.event_start_time}
              onChange={(e) => handleChange("event_start_time", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.event_start_time && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.event_start_time}</p>
          )}
        </div>

        {/* End Time */}
        <div className="space-y-2">
          <label htmlFor="event_end_time" className="block text-sm font-medium">
            End Time *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Clock className="size-5 text-muted-foreground" />
            </div>
            <input
              type="time"
              id="event_end_time"
              value={formData.event_end_time}
              onChange={(e) => handleChange("event_end_time", e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
            />
          </div>
          {errors.event_end_time && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.event_end_time}</p>
          )}
        </div>
      </div>

      {/* Duration Display */}
      {duration > 0 && (
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Event Duration:</strong> {duration} hour{duration !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end pt-6 border-t">
        <Button
          type="submit"
          size="lg"
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          Continue to Venue Selection
          <ChevronRight className="size-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
