"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  FileText,
  ChevronLeft,
  Send,
  Check,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  Building2,
  Package,
  Plus,
  Palette,
} from "lucide-react"
import type { BookingFormData, BookingFormStep5, PricingCalculation } from "@/lib/types/events"
import { calculateBookingPrice, createEventBooking, getVenues, getEventPackages, getEventAddons } from "@/app/actions/events"

interface BookingStep5Props {
  data: BookingFormStep5
  formData: BookingFormData
  user: any
  onUpdate: (data: BookingFormStep5) => void
  onBack: () => void
}

export function BookingStep5({ data, formData, user, onUpdate, onBack }: BookingStep5Props) {
  const router = useRouter()
  const [contactData, setContactData] = useState<BookingFormStep5>(data)
  const [pricing, setPricing] = useState<PricingCalculation | null>(null)
  const [venue, setVenue] = useState<any>(null)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [addons, setAddons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadDataAndCalculate()
  }, [])

  const loadDataAndCalculate = async () => {
    setLoading(true)

    // Load venue
    const venuesResult = await getVenues()
    const foundVenue = venuesResult.venues?.find(v => v.id === formData.step2.venue_id)
    setVenue(foundVenue)

    // Load package if selected
    if (formData.step2.package_id) {
      const packagesResult = await getEventPackages()
      const foundPackage = packagesResult.packages?.find(p => p.id === formData.step2.package_id)
      setSelectedPackage(foundPackage)
    }

    // Load addons if selected
    if (formData.step3.addon_ids.length > 0) {
      const addonsResult = await getEventAddons()
      const selectedAddons = addonsResult.addons?.filter(a => 
        formData.step3.addon_ids.includes(a.id)
      ) || []
      setAddons(selectedAddons)
    }

    // Calculate pricing
    const start = new Date(`2000-01-01T${formData.step1.event_start_time}`)
    const end = new Date(`2000-01-01T${formData.step1.event_end_time}`)
    const duration_hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    const pricingResult = await calculateBookingPrice({
      venue_id: formData.step2.venue_id,
      package_id: formData.step2.package_id,
      menu_package_id: formData.step2.menu_package_id,
      num_guests: formData.step1.num_guests,
      addon_ids: formData.step3.addon_ids,
      addon_quantities: formData.step3.addon_quantities,
      duration_hours,
    })

    if (pricingResult.pricing) {
      setPricing(pricingResult.pricing)
    }

    setLoading(false)
  }

  const handleChange = (field: keyof BookingFormStep5, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!contactData.full_name.trim()) {
      newErrors.full_name = "Full name is required"
    }
    if (!contactData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.email)) {
      newErrors.email = "Invalid email format"
    }
    if (!contactData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const result = await createEventBooking({
        // Event details
        event_type: formData.step1.event_type,
        event_name: formData.step1.event_name || undefined,
        event_date: formData.step1.event_date,
        event_start_time: formData.step1.event_start_time,
        event_end_time: formData.step1.event_end_time,
        num_guests: formData.step1.num_guests,
        
        // Selections
        venue_id: formData.step2.venue_id,
        package_id: formData.step2.package_id,
        menu_package_id: formData.step2.menu_package_id,
        addon_ids: formData.step3.addon_ids,
        addon_quantities: formData.step3.addon_quantities,
        
        // Customization
        decorations_theme: formData.step4.decorations_theme,
        decorations_notes: formData.step4.decorations_notes,
        seating_arrangement: formData.step4.seating_arrangement,
        special_requests: formData.step4.special_requests,
        dietary_restrictions: formData.step4.dietary_restrictions,
        
        // Contact (if not logged in)
        customer_name: user ? undefined : contactData.full_name,
        customer_email: user ? undefined : contactData.email,
        customer_phone: user ? undefined : contactData.phone,
      })

      if (result.error) {
        setError(result.error)
      } else if (result.booking) {
        // Success! Redirect to success page
        router.push(`/events/book/success?booking=${result.booking.booking_number}`)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const eventTypeLabels: Record<string, string> = {
    birthday: "Birthday Party",
    wedding: "Wedding",
    corporate: "Corporate Event",
    christening: "Christening",
    graduation: "Graduation",
    anniversary: "Anniversary",
    reunion: "Reunion",
    seminar: "Seminar/Workshop",
    product_launch: "Product Launch",
    team_building: "Team Building",
    other: "Other Event",
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin size-12 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Calculating pricing...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
          <FileText className="size-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Review Your Booking</h2>
        <p className="text-muted-foreground">
          Please review the details before submitting your booking
        </p>
      </div>

      {/* Event Summary */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="size-5" />
          Event Details
        </h3>
        <div className="p-4 rounded-xl border bg-card space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Event Type:</span>
            <span className="font-medium text-right">{eventTypeLabels[formData.step1.event_type]}</span>
          </div>
          {formData.step1.event_name && (
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground">Event Name:</span>
              <span className="font-medium text-right">{formData.step1.event_name}</span>
            </div>
          )}
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Date:</span>
            <span className="font-medium">{new Date(formData.step1.event_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Time:</span>
            <span className="font-medium">{formData.step1.event_start_time} - {formData.step1.event_end_time}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Guests:</span>
            <span className="font-medium">{formData.step1.num_guests} people</span>
          </div>
        </div>
      </div>

      {/* Venue & Package */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="size-5" />
          Venue & Package
        </h3>
        <div className="p-4 rounded-xl border bg-card space-y-3">
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Venue:</span>
            <span className="font-medium text-right">{venue?.name}</span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-sm text-muted-foreground">Venue Cost:</span>
            <span className="font-medium">₱{pricing?.venue_cost.toLocaleString()}</span>
          </div>
          {selectedPackage && (
            <>
              <div className="border-t pt-2" />
              <div className="flex items-start justify-between">
                <span className="text-sm text-muted-foreground">Package:</span>
                <span className="font-medium text-right">{selectedPackage.name}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add-ons */}
      {addons.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="size-5" />
            Add-ons ({addons.length})
          </h3>
          <div className="p-4 rounded-xl border bg-card space-y-2">
            {addons.map((addon) => {
              const quantity = formData.step3.addon_quantities[addon.id] || 1
              const subtotal = Number(addon.price) * quantity
              return (
                <div key={addon.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <span className="text-sm font-medium">{addon.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      (₱{Number(addon.price).toLocaleString()} × {quantity})
                    </span>
                  </div>
                  <span className="font-medium">₱{subtotal.toLocaleString()}</span>
                </div>
              )
            })}
            <div className="border-t pt-2 mt-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Add-ons Total:</span>
              <span className="font-bold">₱{pricing?.addons_cost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Summary */}
      {pricing && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800">
          <h3 className="text-lg font-semibold mb-4">Price Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Venue Cost:</span>
              <span className="font-medium">₱{pricing.venue_cost.toLocaleString()}</span>
            </div>
            {pricing.food_cost > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Food Cost:</span>
                <span className="font-medium">₱{pricing.food_cost.toLocaleString()}</span>
              </div>
            )}
            {pricing.addons_cost > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Add-ons Cost:</span>
                <span className="font-medium">₱{pricing.addons_cost.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal:</span>
              <span className="font-medium">₱{pricing.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Service Charge (10%):</span>
              <span className="font-medium">₱{pricing.service_charge.toLocaleString()}</span>
            </div>
            <div className="border-t-2 border-amber-600 pt-3" />
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">Total Amount:</span>
              <span className="text-2xl font-bold text-amber-600">
                ₱{pricing.total.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Deposit Required (50%):</span>
                <span className="font-bold text-green-600">
                  ₱{pricing.deposit_required.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Balance Due:</span>
                <span className="font-medium">₱{pricing.balance_due.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      {!user && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="size-5" />
            Contact Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="full_name" className="block text-sm font-medium">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  id="full_name"
                  value={contactData.full_name}
                  onChange={(e) => handleChange("full_name", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
                  placeholder="Juan Dela Cruz"
                />
              </div>
              {errors.full_name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.full_name}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="size-5 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={contactData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
                    placeholder="juan@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium">
                  Phone *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="size-5 text-muted-foreground" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={contactData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent outline-none transition-all"
                    placeholder="+63 917 123 4567"
                  />
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-start gap-3">
          <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">{error}</div>
        </div>
      )}

      {/* Terms */}
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100 mb-3">
          <strong>Important Information:</strong>
        </p>
        <ul className="text-sm text-blue-900 dark:text-blue-100 space-y-1 list-disc list-inside">
          <li>Your booking will be marked as "Pending" until confirmed by our team</li>
          <li>A 50% deposit (₱{pricing?.deposit_required.toLocaleString()}) is required to confirm</li>
          <li>Full payment is due 7 days before the event</li>
          <li>Cancellations 30+ days prior: Full refund of deposit</li>
          <li>Cancellations 15-29 days: 50% refund of deposit</li>
          <li>Cancellations less than 14 days: No refund</li>
        </ul>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={submitting}
        >
          <ChevronLeft className="size-5 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={submitting}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          {submitting ? (
            <>
              <div className="animate-spin size-5 border-2 border-white border-t-transparent rounded-full mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="size-5 mr-2" />
              Submit Booking
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
