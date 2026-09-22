"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar } from "lucide-react"

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show CTA after scrolling past hero section (e.g., 600px)
      setIsVisible(window.scrollY > 600)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-2xl transition-all duration-300 ${
        isVisible ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="font-bold text-sm sm:text-base">Ready to book your perfect event?</div>
            <div className="text-xs sm:text-sm opacity-90 hidden sm:block">Limited dates available - secure yours today!</div>
          </div>
          <Link
            href="/events/book"
            className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white text-amber-600 rounded-full font-bold text-sm sm:text-base hover:bg-amber-50 transition-colors whitespace-nowrap shadow-lg"
          >
            <Calendar className="size-4" />
            <span>Check Availability</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
