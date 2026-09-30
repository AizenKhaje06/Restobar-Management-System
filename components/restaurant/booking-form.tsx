'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

export function BookingForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    time: '',
    guests: '2',
    serviceTime: 'lunch'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement booking submission
    console.log('Booking submitted:', formData)
  }

  return (
    <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Ambiance Image */}
          <div className="relative h-[400px] lg:h-[500px] rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-700" />
            <img 
              src="/LydiasBG3.png" 
              alt="Restaurant ambiance" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Overlay Text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
              <div className="p-6 sm:p-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Reserve Your
                  <br />
                  Perfect Table
                </h3>
                <p className="text-slate-200 text-sm">
                  Experience unforgettable dining moments
                </p>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div>
            <div className="mb-6">
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
                Book Now
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Book Your Table
              </h2>
              <p className="text-muted-foreground text-sm">
                Fill out the form to reserve your spot
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                  Your Name
                </label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1.5">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+63 XXX XXX XXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              {/* Time & Guests - Two Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="time" className="block text-sm font-medium mb-1.5">
                    Time
                  </label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>

                <div>
                  <label htmlFor="guests" className="block text-sm font-medium mb-1.5">
                    Guests
                  </label>
                  <Input
                    id="guests"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: e.target.value })}
                    required
                    className="h-11"
                  />
                </div>
              </div>

              {/* Service Time */}
              <div>
                <label htmlFor="serviceTime" className="block text-sm font-medium mb-1.5">
                  Service Time
                </label>
                <select
                  id="serviceTime"
                  value={formData.serviceTime}
                  onChange={(e) => setFormData({ ...formData, serviceTime: e.target.value })}
                  className="w-full h-11 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  required
                >
                  <option value="breakfast">Breakfast (7:00 AM - 10:00 AM)</option>
                  <option value="lunch">Lunch (11:00 AM - 3:00 PM)</option>
                  <option value="dinner">Dinner (5:00 PM - 10:00 PM)</option>
                </select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-base font-semibold h-12"
              >
                Reserve Now
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We'll confirm your reservation within 15 minutes
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  )
}
