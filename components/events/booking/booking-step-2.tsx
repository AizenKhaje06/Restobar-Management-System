"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Building2, Package, Users, ChevronRight, ChevronLeft, Check, AlertCircle } from "lucide-react"
import type { BookingFormStep1, BookingFormStep2, EventVenue, EventPackage } from "@/lib/types/events"
import { getVenues, getEventPackages, checkVenueAvailability } from "@/app/actions/events"

interface BookingStep2Props {
  data: BookingFormStep2
  eventDetails: BookingFormStep1
  onUpdate: (data: BookingFormStep2) => void
  onNext: () => void
  onBack: () => void
}

export function BookingStep2({ data, eventDetails, onUpdate, onNext, onBack }: BookingStep2Props) {
  const [formData, setFormData] = useState<BookingFormStep2>(data)
  const [venues, setVenues] = useState<EventVenue[]>([])
  const [packages, setPackages] = useState<EventPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAvailability, setCheckingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    loadData()
  }, [eventDetails.event_type])

  const loadData = async () => {
    setLoading(true)
    const [venuesResult, packagesResult] = await Promise.all([
      getVenues(),
      getEventPackages({ event_type: eventDetails.event_type }),
    ])

    if (venuesResult.venues) setVenues(venuesResult.venues)
    if (packagesResult.packages) setPackages(packagesResult.packages)
    setLoading(false)
  }

  const handleVenueSelect = async (venueId: string) => {
    setFormData(prev => ({ ...prev, venue_id: venueId }))
    setErrors(prev => ({ ...prev, venue_id: "" }))
    setAvailabilityError("")

    // Check availability
    if (eventDetails.event_date) {
      setCheckingAvailability(true)
      const result = await checkVenueAvailability(venueId, eventDetails.event_date)
      setCheckingAvailability(false)

      if (!result.available) {
        setAvailabilityError(result.reason || "Venue not available on selected date")
      }
    }
  }

  const handlePackageSelect = (packageId: string) => {
    setFormData(prev => ({
      ...prev,
      package_id: prev.package_id === packageId ? undefined : packageId,
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.venue_id) {
      newErrors.venue_id = "Please select a venue"
    }

    if (availabilityError) {
      newErrors.venue_id = availabilityError
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

  const selectedVenue = venues.find(v => v.id === formData.venue_id)
  const selectedPackage = packages.find(p => p.id === formData.package_id)

  // Filter venues by capacity
  const suitableVenues = venues.filter(
    v => v.capacity_min <= eventDetails.num_guests && v.capacity_max >= eventDetails.num_guests
  )
  const unsuitableVenues = venues.filter(
    v => v.capacity_min > eventDetails.num_guests || v.capacity_max < eventDetails.num_guests
  )

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin size-12 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Loading venues and packages...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Header */}
      <div className="text-center pb-6 border-b">
        <div className="inline-flex items-center justify-center size-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
          <Building2 className="size-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Choose Your Venue</h2>
        <p className="text-muted-foreground">
          Select a venue for {eventDetails.num_guests} guests on{" "}
          {new Date(eventDetails.event_date).toLocaleDateString()}
        </p>
      </div>

      {/* Venue Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Available Venues</h3>
          {checkingAvailability && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <div className="animate-spin size-4 border-2 border-amber-600 border-t-transparent rounded-full" />
              Checking availability...
            </span>
          )}
        </div>

        {suitableVenues.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {suitableVenues.map((venue) => (
              <button
                key={venue.id}
                type="button"
                onClick={() => handleVenueSelect(venue.id)}
                disabled={checkingAvailability}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg
                  ${
                    formData.venue_id === venue.id
                      ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20"
                      : "border-border hover:border-amber-600/50"
                  }
                  ${checkingAvailability ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {formData.venue_id === venue.id && (
                  <div className="absolute top-3 right-3">
                    <div className="flex size-6 items-center justify-center rounded-full bg-amber-600">
                      <Check className="size-4 text-white" />
                    </div>
                  </div>
                )}

                <h4 className="font-semibold mb-2 pr-8">{venue.name}</h4>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {venue.location}
                </p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Users className="size-3 inline mr-1" />
                    {venue.capacity_min}-{venue.capacity_max}
                  </span>
                  {venue.area_sqm && (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      {venue.area_sqm} sqm
                    </span>
                  )}
                </div>

                <p className="text-lg font-bold text-amber-600">
                  ₱{Number(venue.base_rate).toLocaleString()}
                  <span className="text-xs font-normal text-muted-foreground ml-1">base rate</span>
                </p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No venues available for {eventDetails.num_guests} guests
          </p>
        )}

        {/* Unsuitable Venues */}
        {unsuitableVenues.length > 0 && (
          <details className="mt-4">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              Show {unsuitableVenues.length} venue{unsuitableVenues.length !== 1 ? "s" : ""} that don't fit your guest count
            </summary>
            <div className="grid gap-4 sm:grid-cols-2 mt-4 opacity-50">
              {unsuitableVenues.map((venue) => (
                <div
                  key={venue.id}
                  className="p-4 rounded-xl border bg-muted cursor-not-allowed"
                >
                  <h4 className="font-semibold mb-2">{venue.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Capacity: {venue.capacity_min}-{venue.capacity_max} guests
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {venue.capacity_max < eventDetails.num_guests
                      ? "Too small for your group"
                      : "Minimum capacity not met"}
                  </p>
                </div>
              ))}
            </div>
          </details>
        )}

        {errors.venue_id && (
          <div className="p-4 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-start gap-3">
            <AlertCircle className="size-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">{errors.venue_id}</div>
          </div>
        )}
      </div>

      {/* Package Selection (Optional) */}
      {selectedVenue && packages.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <div>
            <h3 className="text-lg font-semibold mb-1">
              Add a Package (Optional)
            </h3>
            <p className="text-sm text-muted-foreground">
              Choose a package to enhance your event experience
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => handlePackageSelect(pkg.id)}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-lg
                  ${
                    formData.package_id === pkg.id
                      ? "border-purple-600 bg-purple-50 dark:bg-purple-900/20"
                      : "border-border hover:border-purple-600/50"
                  }
                `}
              >
                {formData.package_id === pkg.id && (
                  <div className="absolute top-3 right-3">
                    <div className="flex size-6 items-center justify-center rounded-full bg-purple-600">
                      <Check className="size-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 mb-2">
                  <Package className="size-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <h4 className="font-semibold pr-8">{pkg.name}</h4>
                </div>

                {pkg.short_description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {pkg.short_description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    {pkg.min_guests}-{pkg.max_guests} guests
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    {pkg.duration_hours}h
                  </span>
                </div>

                <p className="text-lg font-bold text-purple-600">
                  {pkg.price_per_person ? (
                    <>
                      ₱{Number(pkg.price_per_person).toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground ml-1">/person</span>
                    </>
                  ) : pkg.base_price ? (
                    <>
                      ₱{Number(pkg.base_price).toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground ml-1">base</span>
                    </>
                  ) : (
                    <span className="text-sm font-normal">Contact for pricing</span>
                  )}
                </p>
              </button>
            ))}
          </div>

          {formData.package_id && (
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-900 dark:text-purple-100">
                <strong>{selectedPackage?.name}</strong> has been added to your booking
              </p>
            </div>
          )}
        </div>
      )}

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
          disabled={checkingAvailability}
        >
          Continue to Add-ons
          <ChevronRight className="size-5 ml-2" />
        </Button>
      </div>
    </form>
  )
}
