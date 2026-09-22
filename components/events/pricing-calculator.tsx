"use client"

import { useState } from "react"
import { Calculator, Users, Calendar, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const eventTypes = [
  { value: "wedding", label: "Wedding", multiplier: 1.2 },
  { value: "birthday", label: "Birthday", multiplier: 1.0 },
  { value: "corporate", label: "Corporate Event", multiplier: 1.3 },
  { value: "christening", label: "Christening", multiplier: 0.9 },
  { value: "other", label: "Other", multiplier: 1.0 },
]

const venues = [
  { value: "grand", label: "Grand Ballroom", basePrice: 50000 },
  { value: "crystal", label: "Crystal Hall", basePrice: 35000 },
  { value: "garden", label: "Garden Pavilion", basePrice: 25000 },
]

const packages = [
  { value: "basic", label: "Basic Package", pricePerPerson: 800 },
  { value: "premium", label: "Premium Package", pricePerPerson: 1200 },
  { value: "luxury", label: "Luxury Package", pricePerPerson: 1800 },
]

export function PricingCalculator() {
  const [eventType, setEventType] = useState("")
  const [guestCount, setGuestCount] = useState<number>(100)
  const [venue, setVenue] = useState("")
  const [packageType, setPackageType] = useState("")
  const [showEstimate, setShowEstimate] = useState(false)

  const calculateEstimate = () => {
    if (!eventType || !venue || !packageType) return 0

    const selectedEventType = eventTypes.find(e => e.value === eventType)
    const selectedVenue = venues.find(v => v.value === venue)
    const selectedPackage = packages.find(p => p.value === packageType)

    if (!selectedEventType || !selectedVenue || !selectedPackage) return 0

    const venuePrice = selectedVenue.basePrice
    const packagePrice = selectedPackage.pricePerPerson * guestCount
    const total = (venuePrice + packagePrice) * selectedEventType.multiplier

    return total
  }

  const handleCalculate = () => {
    if (eventType && venue && packageType && guestCount > 0) {
      setShowEstimate(true)
    }
  }

  const estimate = calculateEstimate()
  const estimateMin = estimate * 0.85
  const estimateMax = estimate * 1.15

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/30 dark:from-slate-950 dark:via-amber-950/10 dark:to-orange-950/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-900/30 px-4 py-2 mb-4">
            <Calculator className="size-4 text-green-600" />
            <span className="text-sm font-medium text-green-900 dark:text-green-400">Price Estimator</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Calculate Your <span className="text-amber-600">Event Cost</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get an instant estimate for your event. Customize every detail to fit your budget.
          </p>
        </div>

        {/* Calculator Card */}
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border bg-card shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column - Inputs */}
                <div className="space-y-6">
                  {/* Event Type */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <Calendar className="size-4 text-amber-600" />
                      Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => {
                        setEventType(e.target.value)
                        setShowEstimate(false)
                      }}
                      className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Guest Count */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <Users className="size-4 text-amber-600" />
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      value={guestCount}
                      onChange={(e) => {
                        setGuestCount(Number(e.target.value))
                        setShowEstimate(false)
                      }}
                      min="50"
                      max="500"
                      className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    />
                    <input
                      type="range"
                      value={guestCount}
                      onChange={(e) => {
                        setGuestCount(Number(e.target.value))
                        setShowEstimate(false)
                      }}
                      min="50"
                      max="500"
                      step="10"
                      className="w-full mt-2"
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <MapPin className="size-4 text-amber-600" />
                      Venue
                    </label>
                    <select
                      value={venue}
                      onChange={(e) => {
                        setVenue(e.target.value)
                        setShowEstimate(false)
                      }}
                      className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    >
                      <option value="">Select venue</option>
                      {venues.map(v => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Package */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <Calculator className="size-4 text-amber-600" />
                      Package
                    </label>
                    <select
                      value={packageType}
                      onChange={(e) => {
                        setPackageType(e.target.value)
                        setShowEstimate(false)
                      }}
                      className="w-full h-12 px-4 rounded-lg border bg-background focus:ring-2 focus:ring-amber-600 focus:border-transparent"
                    >
                      <option value="">Select package</option>
                      {packages.map(pkg => (
                        <option key={pkg.value} value={pkg.value}>
                          {pkg.label} (₱{pkg.pricePerPerson.toLocaleString()}/person)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column - Result */}
                <div className="flex flex-col justify-between">
                  {showEstimate && estimate > 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
                      <div className="mb-4">
                        <div className="text-sm font-medium text-muted-foreground mb-2">Estimated Cost</div>
                        <div className="text-5xl font-bold text-amber-600 mb-2">
                          ₱{estimate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Range: ₱{estimateMin.toLocaleString(undefined, { maximumFractionDigits: 0 })} - ₱{estimateMax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-left w-full mb-6">
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Guests:</span>
                          <span className="font-semibold">{guestCount}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Venue:</span>
                          <span className="font-semibold">{venues.find(v => v.value === venue)?.label}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-muted-foreground">Package:</span>
                          <span className="font-semibold">{packages.find(p => p.value === packageType)?.label}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Event:</span>
                          <span className="font-semibold">{eventTypes.find(e => e.value === eventType)?.label}</span>
                        </div>
                      </div>

                      <Link href="/events/book" className="w-full">
                        <Button size="lg" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                          Book This Event
                          <ArrowRight className="size-4 ml-2" />
                        </Button>
                      </Link>

                      <p className="text-xs text-muted-foreground mt-4">
                        Final price may vary based on customizations
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <div className="size-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6">
                        <Calculator className="size-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Get Your Estimate</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Fill in the details to see an instant price estimate
                      </p>
                      <Button
                        size="lg"
                        onClick={handleCalculate}
                        disabled={!eventType || !venue || !packageType || guestCount < 50}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                      >
                        Calculate Price
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Info Bar */}
            <div className="bg-muted px-8 py-4 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500" />
                <span>Transparent pricing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500" />
                <span>No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500" />
                <span>Flexible payment plans</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Need a custom quote? Our team can create a personalized package for your specific needs.
            </p>
            <Link href="/events/contact">
              <Button variant="outline" size="lg">
                Contact for Custom Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
