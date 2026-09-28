'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Users, Calendar, Star, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const eventSpaces = [
  { 
    id: 1, 
    name: "Grand Ballroom", 
    capacity: "200-300 guests",
    image: "https://images.unsplash.com/photo-1519167758481-83f29da8c89a?w=800&q=80",
    features: "Perfect for weddings and large celebrations",
    amenities: ["Air Conditioned", "Stage & Sound System", "LED Screens", "Premium Lighting"]
  },
  { 
    id: 2, 
    name: "Garden Pavilion", 
    capacity: "100-150 guests",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    features: "Outdoor setting with natural ambiance",
    amenities: ["Natural Garden View", "Open Air Setup", "Garden Lights", "Tent Available"]
  },
  { 
    id: 3, 
    name: "Private Dining Room", 
    capacity: "20-50 guests",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
    features: "Intimate gatherings and corporate events",
    amenities: ["Private Entrance", "AV Equipment", "WiFi", "Catering Service"]
  },
  { 
    id: 4, 
    name: "Rooftop Terrace", 
    capacity: "80-120 guests",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    features: "Stunning city views for cocktail parties",
    amenities: ["City View", "Bar Counter", "Lounge Setup", "Ambient Music"]
  }
]

export function EventsPlace() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentSpace = eventSpaces[currentIndex]

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
          src={currentSpace.image}
          alt="Background"
          className="w-full h-full object-cover blur-2xl scale-110 transition-all duration-700"
        />
      </div>
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60 dark:bg-black/75" />

      <div className="relative z-10 container mx-auto px-4 lg:px-16 max-w-[1600px]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Image Carousel */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
              {/* Main Image */}
              <img 
                src={currentSpace.image}
                alt={currentSpace.name}
                className="w-full h-full object-cover transition-transform duration-700"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Capacity Badge */}
              <div className="absolute top-4 right-4 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full flex items-center gap-2">
                <Users className="size-4 text-amber-600" />
                <span className="text-sm font-bold text-slate-900">{currentSpace.capacity}</span>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors z-10"
              >
                <ChevronLeft className="size-6 text-slate-900 dark:text-white" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors z-10"
              >
                <ChevronRight className="size-6 text-slate-900 dark:text-white" />
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

          {/* Right Side - Text Details */}
          <div className="order-1 lg:order-2">
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Our Venues
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-white">
              {currentSpace.name}
            </h2>
            <p className="text-slate-300 text-base mb-6">
              {currentSpace.features}
            </p>

            {/* Amenities List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-white">
                <Star className="size-5 text-amber-500" />
                Venue Amenities
              </h3>
              <ul className="grid grid-cols-2 gap-3">
                {currentSpace.amenities.map((amenity, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                    <div className="size-1.5 rounded-full bg-amber-500" />
                    {amenity}
                  </li>
                ))}
              </ul>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Users className="size-5 text-amber-500 mb-2" />
                <p className="text-xs text-slate-400 mb-1">Capacity</p>
                <p className="font-bold text-sm text-white">{currentSpace.capacity}</p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <Clock className="size-5 text-amber-500 mb-2" />
                <p className="text-xs text-slate-400 mb-1">Availability</p>
                <p className="font-bold text-sm text-white">Book Anytime</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/events/inquiry" className="flex-1">
                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg"
                >
                  <Calendar className="size-4 mr-2" />
                  Book This Venue
                </Button>
              </Link>
              <Link href="/events/gallery" className="flex-1">
                <Button 
                  size="lg"
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  View Gallery
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
