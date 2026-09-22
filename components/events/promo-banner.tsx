"use client"

import { useState, useEffect } from "react"
import { X, Gift } from "lucide-react"

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Check if banner was dismissed in this session
    const dismissed = sessionStorage.getItem("promoBannerDismissed")
    if (!dismissed) {
      setIsVisible(true)
    }

    // Set target date (e.g., end of month)
    const targetDate = new Date()
    targetDate.setMonth(targetDate.getMonth() + 1, 0) // Last day of current month
    targetDate.setHours(23, 59, 59)

    const updateTimer = () => {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now

      if (distance < 0) {
        setIsVisible(false)
        return
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem("promoBannerDismissed", "true")
  }

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white py-3 px-4 animate-in slide-in-from-top duration-500">
      <div className="container mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon & Message */}
          <div className="flex items-center gap-3 flex-1">
            <Gift className="size-5 shrink-0 animate-bounce" />
            <div className="text-sm sm:text-base font-medium">
              <span className="hidden sm:inline">🎉 Limited Time Offer: </span>
              <span className="font-bold">20% OFF</span> on all December bookings!
            </div>
          </div>

          {/* Center: Timer */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide opacity-90">Ends in:</span>
            <div className="flex gap-1">
              <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 min-w-[40px] text-center">
                <div className="text-sm font-bold">{timeLeft.days}</div>
                <div className="text-[10px] opacity-75">days</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 min-w-[40px] text-center">
                <div className="text-sm font-bold">{timeLeft.hours}</div>
                <div className="text-[10px] opacity-75">hrs</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded px-2 py-1 min-w-[40px] text-center">
                <div className="text-sm font-bold">{timeLeft.minutes}</div>
                <div className="text-[10px] opacity-75">min</div>
              </div>
            </div>
          </div>

          {/* Right: CTA & Close */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/events/book"
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-amber-600 text-xs sm:text-sm font-bold rounded-full hover:bg-amber-50 transition-colors whitespace-nowrap"
            >
              Book Now
            </a>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
