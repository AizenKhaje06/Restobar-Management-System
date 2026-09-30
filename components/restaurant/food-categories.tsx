'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ChevronRight, ChevronLeft, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FoodCategory {
  id: string
  name: string
  description: string
  image_url: string
  sort_order: number
  is_active: boolean
}

export function FoodCategories() {
  const [categories, setCategories] = useState<FoodCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Define the food bundle categories we want to display
  const foodBundleCategories = [
    'Lechon',
    'Quick Meals', 
    'Party Trays',
    'Lechon-In-A-Box',
    "Lydia's Family Boxes",
    'Promo Deals',
    'Bento Box'
  ]

  useEffect(() => {
    async function fetchFoodCategories() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, image_url, sort_order, is_active')
        .in('name', foodBundleCategories)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (data && !error) {
        setCategories(data)
      }
      setLoading(false)
    }

    fetchFoodCategories()
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (categories.length - 2))
  }
  
  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (categories.length - 2)) % (categories.length - 2))
  }

  if (loading) {
    return null
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <section className="py-2 pb-12 sm:py-4 sm:pb-16 bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto px-8 lg:px-20 max-w-[1600px]">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8 lg:gap-12 items-center">
          {/* Left Side - 5 Cards with Stacked Overlap Effect */}
          <div className="relative order-2 lg:order-1">
            {/* Card Container */}
            <div className="relative h-[400px] lg:h-[500px] flex items-center justify-center">
              <div className="relative flex items-center justify-center w-full">
                {/* Display 5 cards with overlap effect */}
                {[0, 1, 2, 3, 4].map((offset) => {
                  const categoryIndex = (currentIndex + offset) % categories.length
                  const category = categories[categoryIndex]
                  
                  // Position mapping: 0=far-left-back, 1=left-front, 2=center, 3=right-front, 4=far-right-back
                  const isCenter = offset === 2
                  const isLeftFront = offset === 1
                  const isRightFront = offset === 3
                  const isFarLeft = offset === 0
                  const isFarRight = offset === 4
                  
                  if (!category) return null
                  
                  // Calculate position and styling - tighter overlap to match signature dishes
                  let cardStyles = ''
                  let imageFilter = ''
                  if (isCenter) {
                    cardStyles = 'w-[280px] sm:w-[340px] aspect-[3/4] scale-100 z-30 translate-x-0'
                    imageFilter = 'brightness-110 saturate-125 contrast-110'
                  } else if (isLeftFront) {
                    cardStyles = 'w-[240px] sm:w-[280px] aspect-[3/4] scale-90 z-20 -translate-x-[170px] sm:-translate-x-[200px] opacity-80'
                    imageFilter = 'brightness-95 saturate-100'
                  } else if (isRightFront) {
                    cardStyles = 'w-[240px] sm:w-[280px] aspect-[3/4] scale-90 z-20 translate-x-[170px] sm:translate-x-[200px] opacity-80'
                    imageFilter = 'brightness-95 saturate-100'
                  } else if (isFarLeft) {
                    cardStyles = 'w-[200px] sm:w-[240px] aspect-[3/4] scale-75 z-10 -translate-x-[300px] sm:-translate-x-[360px] opacity-50'
                    imageFilter = 'brightness-90 saturate-75'
                  } else if (isFarRight) {
                    cardStyles = 'w-[200px] sm:w-[240px] aspect-[3/4] scale-75 z-10 translate-x-[300px] sm:translate-x-[360px] opacity-50'
                    imageFilter = 'brightness-90 saturate-75'
                  }
                  
                  // Check if category is popular
                  const isPopular = ['Lechon', 'Party Trays', "Lydia's Family Boxes"].includes(category.name)
                  
                  return (
                    <Link
                      key={`${category.id}-${categoryIndex}`}
                      href={`/events/menu?category=${category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      className={`group absolute rounded-3xl overflow-hidden bg-slate-900 transition-all duration-500 ${isCenter ? 'hover:scale-105 cursor-pointer' : 'cursor-default'} ${cardStyles} ${isCenter ? 'shadow-2xl shadow-amber-500/20 ring-2 ring-amber-500/30' : 'shadow-2xl'}`}
                    >
                      {/* Image with Dynamic Filter */}
                      <img 
                        src={category.image_url || '/placeholder.jpg'} 
                        alt={category.name}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${imageFilter}`}
                      />
                      
                      {/* Lighter Gradient Overlay - Only at bottom for text readability */}
                      <div className={`absolute inset-0 ${isCenter ? 'bg-gradient-to-t from-black/70 via-transparent to-transparent' : 'bg-gradient-to-t from-black/80 via-black/30 to-black/10'}`} />
                      
                      {/* Popular Badge */}
                      {isPopular && isCenter && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full">
                          Popular
                        </div>
                      )}

                      {/* Icon Badge */}
                      <div className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full">
                        <Package className="size-4 text-white" />
                      </div>
                      
                      {/* Bottom Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-white font-bold text-lg mb-2">
                          {category.name}
                        </h3>
                        <p className="text-white/90 text-sm line-clamp-2">
                          {category.description}
                        </p>
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
              {categories.map((_, index) => (
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

          {/* Right Side - Text Content */}
          <div className="order-1 lg:order-2 lg:pl-8 lg:-mr-8">
            <div className="space-y-4 text-right">
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
                Food Bundles & Meals
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">
                Perfect for <span className="text-amber-500 italic font-serif">Groups & Families</span>
              </h2>
              <p className="text-muted-foreground text-sm mb-3">
                Choose from our specially curated meal bundles designed for 2 or more persons.
              </p>
              <p className="text-muted-foreground text-sm mb-6">
                From our signature lechon to convenient bento boxes and family meal packages—enjoy authentic Filipino flavors perfect for any gathering, celebration, or family meal.
              </p>
              <div className="flex justify-end">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
