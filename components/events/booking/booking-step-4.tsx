"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Palette, ChevronRight, ChevronLeft } from "lucide-react"
import type { BookingFormStep4 } from "@/lib/types/events"

interface BookingStep4Props {
  data: BookingFormStep4
  onUpdate: (data: BookingFormStep4) => void
  onNext: () => void
  onBack: () => void
}

export function BookingStep4({ data, onUpdate, onNext, onBack }: BookingStep4Props) {
  const [formData, setFormData] = useState<BookingFormStep4>(data)

  const handleChange = (field: keyof BookingFormStep4, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value || undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
    onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
          <Palette className="size-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Customize Your Event</h2>
        <p className="text-muted-foreground">
          Add personal touches to make your event unique (all fields are optional)
        </p>
      </div>

      {/* Decoration Theme */}
      <div className="space-y-2">
        <label htmlFor="decorations_theme" className="block text-sm font-medium">
          Decoration Theme
        </label>
        <input
          type="text"
          id="decorations_theme"
          value={formData.decorations_theme || ""}
          onChange={(e) => handleChange("decorations_theme", e.target.value)}
          className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
          placeholder="e.g., Rustic, Modern, Garden, Vintage, Glamorous"
        />
        <p className="text-xs text-muted-foreground">
          Tell us your preferred decoration style or theme
        </p>
      </div>

      {/* Decoration Notes */}
      <div className="space-y-2">
        <label htmlFor="decorations_notes" className="block text-sm font-medium">
          Decoration Notes
        </label>
        <textarea
          id="decorations_notes"
          value={formData.decorations_notes || ""}
          onChange={(e) => handleChange("decorations_notes", e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all resize-none"
          placeholder="Describe your decoration preferences, color schemes, or specific requests..."
        />
        <p className="text-xs text-muted-foreground">
          Any specific colors, styles, or decoration elements you'd like?
        </p>
      </div>

      {/* Seating Arrangement */}
      <div className="space-y-2">
        <label htmlFor="seating_arrangement" className="block text-sm font-medium">
          Seating Arrangement
        </label>
        <select
          id="seating_arrangement"
          value={formData.seating_arrangement || ""}
          onChange={(e) => handleChange("seating_arrangement", e.target.value)}
          className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
        >
          <option value="">Select arrangement (optional)</option>
          <option value="round_tables">Round Tables</option>
          <option value="long_tables">Long Tables</option>
          <option value="theater">Theater Style</option>
          <option value="classroom">Classroom Style</option>
          <option value="u_shape">U-Shape</option>
          <option value="banquet">Banquet Style</option>
          <option value="cocktail">Cocktail/Standing</option>
          <option value="custom">Custom Arrangement</option>
        </select>
        <p className="text-xs text-muted-foreground">
          How would you like the tables and chairs arranged?
        </p>
      </div>

      {/* Special Requests */}
      <div className="space-y-2">
        <label htmlFor="special_requests" className="block text-sm font-medium">
          Special Requests
        </label>
        <textarea
          id="special_requests"
          value={formData.special_requests || ""}
          onChange={(e) => handleChange("special_requests", e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all resize-none"
          placeholder="Any special requests for your event? e.g., accessibility needs, timing preferences, photo opportunities..."
        />
        <p className="text-xs text-muted-foreground">
          Let us know about any special accommodations or requests
        </p>
      </div>

      {/* Dietary Restrictions */}
      <div className="space-y-2">
        <label htmlFor="dietary_restrictions" className="block text-sm font-medium">
          Dietary Restrictions & Allergies
        </label>
        <textarea
          id="dietary_restrictions"
          value={formData.dietary_restrictions || ""}
          onChange={(e) => handleChange("dietary_restrictions", e.target.value)}
          rows={3}
          className="w-full px-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all resize-none"
          placeholder="e.g., Vegetarian, Halal, Gluten-free, Nut allergies, Lactose intolerant..."
        />
        <p className="text-xs text-muted-foreground">
          Please inform us of any dietary requirements or food allergies
        </p>
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> All customization requests are subject to availability and may incur additional charges. We'll confirm the details with you after reviewing your booking.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
        >
          <ChevronLeft className="size-5 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
        >
          Review Booking
          <ChevronRight className="size-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
