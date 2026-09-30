'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, X } from "lucide-react"

interface Dish {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  isBestSeller: boolean
}

interface SignatureDishesProps {
  dishes: Dish[]
}

export function SignatureDishesClient({ dishes }: SignatureDishesProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (dishes.length - 2))
  }
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (dishes.length - 2)) % (dishes.length - 2))
  }

  const openModal = (dish: Dish) => {
    setSelectedDish(dish)
  }

  const closeModal = () => {
    setSelectedDish(null)
  }

  return (
    <section className="pt-12 pb-2 sm:pt-16 sm:pb-4 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto px-4 lg:px-16 max-w-[1600px]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="max-w-lg">
            <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
              Our Menu
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">
              Popular Dishes <span className="text-amber-500 italic font-serif">Must Try</span>
            </h2>
            <p className="text-muted-foreground text-sm mb-3">
              Our all-time crowd favorites and signature recipes.
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              From our signature crispy lechon to a wide variety of classic Filipino dishes, enjoy authentic flavors and generous portions—crafted to deliver top quality at prices you'll love.
            </p>
            <Link href="/events/menu">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 px-7 py-5 rounded-full shadow-lg"
              >
                View Full Menu
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Right Side - 5 Cards with Stacked Overlap Effect */}
          <div className="relative">
            {/* Card Container */}
            <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
              <div className="relative flex items-center justify-center w-full -translate-x-16 lg:-translate-x-24">
                {/* Display 5 cards with overlap effect */}
                {[0, 1, 2, 3, 4].map((offset) => {
                  const dishIndex = (currentIndex + offset) % dishes.length
                  const dish = dishes[dishIndex]
                  
                  // Position mapping: 0=far-left-back, 1=left-front, 2=center, 3=right-front, 4=far-right-back
                  const isCenter = offset === 2
                  const isLeftFront = offset === 1
                  const isRightFront = offset === 3
                  const isFarLeft = offset === 0
                  const isFarRight = offset === 4
                  
                  if (!dish) return null
                  
                  // Calculate position and styling - tighter overlap to fit within boundary
                  let cardStyles = ''
                  let imageFilter = ''
                  if (isCenter) {
                    cardStyles = 'w-[280px] sm:w-[340px] aspect-[3/4] scale-100 z-30 translate-x-0'
                    imageFilter = 'brightness-110 saturate-125 contrast-110' // Make center image vibrant
                  } else if (isLeftFront) {
                    cardStyles = 'w-[240px] sm:w-[280px] aspect-[3/4] scale-90 z-20 -translate-x-[170px] sm:-translate-x-[200px] opacity-80'
                    imageFilter = 'brightness-95 saturate-100' // Slightly dimmed
                  } else if (isRightFront) {
                    cardStyles = 'w-[240px] sm:w-[280px] aspect-[3/4] scale-90 z-20 translate-x-[170px] sm:translate-x-[200px] opacity-80'
                    imageFilter = 'brightness-95 saturate-100' // Slightly dimmed
                  } else if (isFarLeft) {
                    cardStyles = 'w-[200px] sm:w-[240px] aspect-[3/4] scale-75 z-10 -translate-x-[300px] sm:-translate-x-[360px] opacity-50'
                    imageFilter = 'brightness-90 saturate-75' // More dimmed
                  } else if (isFarRight) {
                    cardStyles = 'w-[200px] sm:w-[240px] aspect-[3/4] scale-75 z-10 translate-x-[300px] sm:translate-x-[360px] opacity-50'
                    imageFilter = 'brightness-90 saturate-75' // More dimmed
                  }
                  
                  return (
                    <button
                      key={`${dish.id}-${dishIndex}`}
                      onClick={() => isCenter ? openModal(dish) : undefined}
                      disabled={!isCenter}
                      className={`group absolute rounded-3xl overflow-hidden bg-slate-900 transition-all duration-500 ${isCenter ? 'hover:scale-105 cursor-pointer' : 'cursor-default'} ${cardStyles} ${isCenter ? 'shadow-2xl shadow-amber-500/20 ring-2 ring-amber-500/30' : 'shadow-2xl'}`}
                    >
                      {/* Image with Dynamic Filter */}
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${imageFilter}`}
                      />
                      
                      {/* Lighter Gradient Overlay - Only at bottom for text readability */}
                      <div className={`absolute inset-0 ${isCenter ? 'bg-gradient-to-t from-black/70 via-transparent to-transparent' : 'bg-gradient-to-t from-black/80 via-black/30 to-black/10'}`} />
                      
                      {/* Top Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                        {dish.category}
                      </div>
                      
                      {/* Best Seller Badge */}
                      {dish.isBestSeller && isCenter && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full">
                          Best Seller
                        </div>
                      )}
                      
                      {/* Bottom Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-white font-bold text-lg mb-2">
                          {dish.name}
                        </h3>
                        <p className="text-white/90 text-sm mb-3 line-clamp-2">
                          {dish.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-bold text-xl">₱{dish.price}</span>
                          <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
                            <span className="text-white text-lg font-bold">+</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="size-5 text-slate-900 dark:text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="size-5 text-slate-900 dark:text-white" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {dishes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentIndex === index ? 'bg-amber-600 w-6' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>


      </div>

      {/* Full View Modal */}
      {selectedDish && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-300"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="size-6 text-white" />
          </button>

          {/* Modal Content */}
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: Image */}
              <div className="relative aspect-square md:aspect-auto">
                <img
                  src={selectedDish.image}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right: Details */}
              <div className="p-8 flex flex-col justify-center">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2 mb-4">
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-500 text-xs font-semibold rounded-full">
                    {selectedDish.category}
                  </span>
                  {selectedDish.isBestSeller && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      Best Seller
                    </span>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {selectedDish.name}
                </h2>

                {/* Description */}
                <p className="text-white/80 text-base mb-6 leading-relaxed">
                  {selectedDish.description}
                </p>

                {/* Price */}
                <div className="flex items-center justify-between mb-8">
                  <span className="text-4xl font-bold text-white">
                    ₱{selectedDish.price}
                  </span>
                </div>

                {/* View Full Menu Button */}
                <Link href="/events/menu" onClick={closeModal}>
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 py-6 text-lg"
                  >
                    View Full Menu
                    <ChevronRight className="size-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
