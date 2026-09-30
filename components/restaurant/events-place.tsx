'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Users, Calendar, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { SlideLeft, SlideRight } from '@/components/ui/scroll-animations'

interface EventSpace {
  id: string
  name: string
  capacity?: number
  location?: string
  description?: string
  image_url?: string
  amenities?: string[]
  features?: string[]
  is_active: boolean
}

export function EventsPlace() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [eventSpaces, setEventSpaces] = useState<EventSpace[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchVenues() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('event_venues')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setEventSpaces(data)
      }
      setLoading(false)
    }

    fetchVenues()
  }, [])

  if (loading) {
    return (
      <section className="relative py-12 sm:py-16 overflow-hidden bg-slate-900">
        <div className="container mx-auto px-4 text-center text-white">
          <p>Loading venues...</p>
        </div>
      </section>
    )
  }

  if (eventSpaces.length === 0) {
    return (
      <section className="relative py-12 sm:py-16 overflow-hidden bg-slate-900">
        <div className="container mx-auto px-4 text-center text-white">
          <p className="text-amber-400 mb-2">No venues available</p>
          <p className="text-slate-300">Please check back later</p>
        </div>
      </section>
    )
  }

  const currentSpace = eventSpaces[currentIndex]
  
  // Format capacity display
  const capacityDisplay = currentSpace.capacity 
    ? `${currentSpace.capacity} guests` 
    : 'Contact us'

  // Parse amenities and features from JSON or array
  const amenities = Array.isArray(currentSpace.amenities) 
    ? currentSpace.amenities 
    : currentSpace.amenities 
      ? JSON.parse(currentSpace.amenities as any)
      : []

  const features = currentSpace.description || 'Perfect for all types of events'

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === eventSpaces.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? eventSpaces.length - 1 : prev - 1))
  }

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden">
      {/* Blurred Background Image */}
      <div className="absolute inset-0">
        <img 
          src={currentSpace.image_url || 'https://images.unsplash.com/photo-1519167758481-83f29da8c89a?w=800&q=80'}
          alt="Background"
          className="w-full h-full object-cover blur-2xl scale-110 transition-all duration-700"
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />

      <div className="relative z-10 container mx-auto px-4 lg:px-16 max-w-[1600px]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Image Carousel with Overlay Details */}
          <SlideRight className="order-2 lg:order-1">
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              {/* Main Image */}
              <img 
                src={currentSpace.image_url || 'https://images.unsplash.com/photo-1519167758481-83f29da8c89a?w=800&q=80'}
                alt={currentSpace.name}
                className="w-full h-full object-cover transition-transform duration-700"
              />
              
              {/* Gradient Overlay - Stronger at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              {/* Capacity Badge - Top Right */}
              <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-2 z-20">
                <Users className="size-4 text-amber-600" />
                <span className="text-sm font-bold text-slate-900">{capacityDisplay}</span>
              </div>

              {/* Venue Details Overlay - Bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                {/* Featured Venue Label */}
                <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  Featured Venue
                </p>
                
                {/* Venue Name */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
                  {currentSpace.name}
                </h3>
                
                {/* Features Description */}
                <p className="text-slate-200 text-sm mb-4">
                  {features}
                </p>

                {/* Amenities List */}
                {amenities.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                      <Star className="size-4 text-amber-500" />
                      Venue Amenities
                    </h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {amenities.slice(0, 4).map((amenity: string, index: number) => (
                        <li key={index} className="flex items-center gap-2 text-xs text-slate-200">
                          <div className="size-1 rounded-full bg-amber-500" />
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors z-20"
              >
                <ChevronLeft className="size-5 text-slate-900 dark:text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors z-20"
              >
                <ChevronRight className="size-5 text-slate-900 dark:text-white" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {eventSpaces.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentIndex === index ? 'bg-amber-600 w-8' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          </SlideRight>

          {/* Right Side - About Our Venue Only */}
          <SlideLeft className="order-1 lg:order-2">
          <div className="space-y-4 text-right">
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider">
                About Our Venue
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white">
                Looking for the
                <br />
                <span className="text-amber-400 italic font-serif">Perfect Venue?</span>
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Lydia's Lechon Restaurant offers a beautiful and versatile event space, perfect for weddings, birthdays, corporate gatherings, and special celebrations.
              </p>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Our elegant venue combines comfort, style, and top-notch service to make your event truly memorable. With customizable packages and dedicated event coordination, we ensure every detail is perfect.
              </p>
              <div className="flex justify-end">
                <Link href="/events/venues">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg"
                  >
                    Explore Our Venues
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </SlideLeft>
        </div>
      </div>
    </section>
  )
}
