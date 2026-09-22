"use client"

import { useState, useEffect } from "react"
import { X, Gift, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    // Check if popup was already shown in this session
    const popupShown = sessionStorage.getItem("exitPopupShown")
    if (popupShown) return

    let hasShown = false

    const handleMouseLeave = (e: MouseEvent) => {
      // Detect when mouse leaves from top of viewport (attempting to close tab/navigate away)
      if (e.clientY <= 0 && !hasShown && !popupShown) {
        setIsVisible(true)
        hasShown = true
        sessionStorage.setItem("exitPopupShown", "true")
      }
    }

    // Add event listener after a short delay to avoid immediate triggers
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave)
    }, 3000)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    
    // In production, send email to your backend/newsletter service
    console.log("Email submitted:", email)
    
    // Close popup after 2 seconds
    setTimeout(() => {
      setIsVisible(false)
    }, 2000)
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
          aria-label="Close popup"
        >
          <X className="size-5" />
        </button>

        {/* Content */}
        <div className="p-8">
          {isSubmitted ? (
            <div className="text-center py-8">
              <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
                <Gift className="size-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Check Your Email!</h3>
              <p className="text-muted-foreground">
                We've sent your 15% discount code. Use it on your first booking!
              </p>
            </div>
          ) : (
            <>
              {/* Icon */}
              <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 mx-auto mb-6">
                <Gift className="size-8 text-white" />
              </div>

              {/* Heading */}
              <h3 className="text-3xl font-bold text-center mb-3">
                Wait! Don't Miss Out
              </h3>
              <p className="text-center text-muted-foreground mb-6">
                Get <span className="font-bold text-amber-600">15% OFF</span> your first event booking
              </p>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 text-base"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <Mail className="size-4 mr-2" />
                  Get My Discount Code
                </Button>
              </form>

              {/* Fine Print */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                Valid for new bookings only. Terms apply. We respect your privacy.
              </p>

              {/* Features */}
              <div className="mt-6 pt-6 border-t space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">Exclusive event planning tips</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">Early access to special offers</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="size-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span className="text-muted-foreground">Free event planning checklist</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Decorative Bottom Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600" />
      </div>
    </div>
  )
}
