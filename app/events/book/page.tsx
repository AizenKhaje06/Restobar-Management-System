"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { BookingStep1 } from "@/components/events/booking/booking-step-1"
import { BookingStep2 } from "@/components/events/booking/booking-step-2"
import { BookingStep3 } from "@/components/events/booking/booking-step-3"
import { BookingStep4 } from "@/components/events/booking/booking-step-4"
import { BookingStep5 } from "@/components/events/booking/booking-step-5"
import { BookingProgress } from "@/components/events/booking/booking-progress"
import type { BookingFormData } from "@/lib/types/events"
import { createClient } from "@/lib/supabase/client"

const initialFormData: BookingFormData = {
  step1: {
    event_type: "birthday",
    event_name: "",
    event_date: "",
    event_start_time: "",
    event_end_time: "",
    num_guests: 50,
  },
  step2: {
    venue_id: "",
    package_id: undefined,
    menu_package_id: undefined,
  },
  step3: {
    addon_ids: [],
    addon_quantities: {},
  },
  step4: {
    decorations_theme: undefined,
    decorations_notes: undefined,
    seating_arrangement: undefined,
    special_requests: undefined,
    dietary_restrictions: undefined,
  },
  step5: {
    full_name: "",
    email: "",
    phone: "",
    address: undefined,
  },
}

export default function BookingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<BookingFormData>(initialFormData)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    // Check authentication and pre-fill data
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Get customer profile to pre-fill Step 5
        const { data: customer } = await supabase
          .from("event_customers")
          .select("*")
          .eq("auth_id", user.id)
          .single()

        if (customer) {
          setFormData(prev => ({
            ...prev,
            step5: {
              full_name: customer.full_name,
              email: customer.email,
              phone: customer.phone,
              address: customer.address || undefined,
            },
          }))
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo(0, 0)
    }
  }

  const updateFormData = (step: keyof BookingFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data,
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin size-12 border-4 border-amber-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Book Your Event
          </h1>
          <p className="text-muted-foreground">
            Complete the form below to reserve your perfect event
          </p>
        </div>

        {/* Progress Bar */}
        <BookingProgress currentStep={currentStep} />

        {/* Form Steps */}
        <div className="mt-8 bg-card border rounded-2xl shadow-2xl p-6 sm:p-8">
          {currentStep === 1 && (
            <BookingStep1
              data={formData.step1}
              onUpdate={(data) => updateFormData("step1", data)}
              onNext={handleNext}
            />
          )}

          {currentStep === 2 && (
            <BookingStep2
              data={formData.step2}
              eventDetails={formData.step1}
              onUpdate={(data) => updateFormData("step2", data)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 3 && (
            <BookingStep3
              data={formData.step3}
              onUpdate={(data) => updateFormData("step3", data)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 4 && (
            <BookingStep4
              data={formData.step4}
              onUpdate={(data) => updateFormData("step4", data)}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}

          {currentStep === 5 && (
            <BookingStep5
              data={formData.step5}
              formData={formData}
              user={user}
              onUpdate={(data) => updateFormData("step5", data)}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  )
}
