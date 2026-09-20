"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Home, FileText, Mail, Phone, Loader2 } from "lucide-react"

function BookingSuccessContent() {
  const searchParams = useSearchParams()
  const bookingNumber = searchParams.get("booking")
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Success Card */}
        <div className="bg-card border rounded-2xl shadow-2xl p-8 text-center">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center size-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6 animate-in zoom-in duration-500">
            <CheckCircle className="size-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
            Booking Submitted Successfully!
          </h1>

          {/* Booking Number */}
          {bookingNumber && (
            <div className="mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
              <p className="text-muted-foreground mb-2">Your booking number is</p>
              <div className="inline-block px-6 py-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-600">
                <p className="text-2xl font-bold text-amber-600">{bookingNumber}</p>
              </div>
            </div>
          )}

          {/* Message */}
          <div className="mb-8 space-y-4 text-left max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
            <p className="text-muted-foreground leading-relaxed">
              Thank you for choosing us for your special event! We've received your booking request and will review it shortly.
            </p>
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>What happens next?</strong>
              </p>
              <ul className="text-sm text-blue-900 dark:text-blue-100 mt-2 space-y-1 list-disc list-inside">
                <li>We'll review your booking within 24 hours</li>
                <li>You'll receive a confirmation email with payment details</li>
                <li>A 50% deposit is required to confirm your booking</li>
                <li>Our team will contact you to finalize arrangements</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-500">
            <Link href="/events/dashboard">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                <FileText className="size-5 mr-2" />
                View My Bookings
              </Button>
            </Link>
            <Link href="/events">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Home className="size-5 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>

          {/* Contact Info */}
          <div className="pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Questions about your booking?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="tel:+639171234567"
                className="flex items-center justify-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                <Phone className="size-4" />
                <span>+63 917 123 4567</span>
              </a>
              <a
                href="mailto:events@restaurant.com"
                className="flex items-center justify-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                <Mail className="size-4" />
                <span>events@restaurant.com</span>
              </a>
            </div>
          </div>

          {/* Auto Redirect Notice */}
          {countdown > 0 && (
            <p className="text-xs text-muted-foreground mt-6">
              Redirecting to dashboard in {countdown} seconds...
            </p>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            A confirmation email has been sent to your email address with booking details.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-amber-600" />
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  )
}
