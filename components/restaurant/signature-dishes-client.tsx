'use client'

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"

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
  
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (dishes.length - 2))
  }
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (dishes.length - 2)) % (dishes.length - 2))
  }

  return (
    <section className="py-12 sm:py-16 bg-slate-50 dark:bg-slate-900">
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
              <div className="relative flex items-center justify-center w-full">
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
                  
                  // Calculate position and styling - 5% overlap only (95% visible)
                  let cardStyles = ''
                  if (isCenter) {
                    cardStyles = 'w-[280px] sm:w-[340px] aspect-[3/4] scale-100 z-30 translate-x-0'
                  } else if (isLeftFront) {
                    cardStyles = 'w-[240px] sm:w-[280px] aspect-[3/4] scale-90 z-20 -translate-x-[215px] sm:-translate-x-[255px] opacity-80'
                  } else if (isRightFront) {
                    cardStyles = 'w-[240px] sm:w-[280px] aspect-[3/4] scale-90 z-20 translate-x-[215px] sm:translate-x-[255px] opacity-80'
                  } else if (isFarLeft) {
                    cardStyles = 'w-[200px] sm:w-[240px] aspect-[3/4] scale-75 z-10 -translate-x-[380px] sm:-translate-x-[455px] opacity-50'
                  } else if (isFarRight) {
                    cardStyles = 'w-[200px] sm:w-[240px] aspect-[3/4] scale-75 z-10 translate-x-[380px] sm:translate-x-[455px] opacity-50'
                  }
                  
                  return (
                    <Link
                      key={`${dish.id}-${dishIndex}`}
                      href={`/events/menu?category=${encodeURIComponent(dish.category)}`}
                      className={`group absolute rounded-3xl overflow-hidden bg-slate-900 shadow-2xl transition-all duration-500 hover:scale-105 ${cardStyles}`}
                    >
                      {/* Image */}
                      <img 
                        src={dish.image} 
                        alt={dish.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
                      
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
                    </Link>
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
    </section>
  )
}
