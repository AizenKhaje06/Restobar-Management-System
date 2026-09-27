import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

const dishes = [
  {
    id: 1,
    name: "Appetizers",
    image: "/api/placeholder/400/300",
    category: "Appetizers"
  },
  {
    id: 2,
    name: "Main Course",
    image: "/api/placeholder/400/300",
    category: "Main Course"
  },
  {
    id: 3,
    name: "Burgers",
    image: "/api/placeholder/400/300",
    category: "Burgers"
  },
  {
    id: 4,
    name: "Desserts",
    image: "/api/placeholder/400/300",
    category: "Desserts"
  }
]

export function SignatureDishes() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header - Centered */}
        <div className="mb-10 text-center max-w-4xl mx-auto">
          <p className="text-amber-600 text-sm font-semibold uppercase tracking-wider mb-3">
            Crafted by Tradition. Loved for Generations.
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            60 Years of <span className="text-amber-600">Legendary Lechon</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Since 1965, Lydia's Lechon has perfected the art of authentic Filipino lechon—bringing together rich heritage, signature crispy skin, and unforgettable flavor for every celebration.
          </p>
        </div>

        {/* 1 Row on Desktop (4 cards), 2x2 on Mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {dishes.map((dish, index) => (
            <Link
              key={dish.id}
              href={`/events/menu?category=${encodeURIComponent(dish.category)}`}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[4/3] bg-slate-900 animate-in fade-in slide-in-from-bottom-4"
              style={{
                animationDelay: `${index * 100}ms`,
                animationDuration: '500ms'
              }}
            >
              {/* Image Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900" />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white font-bold text-sm sm:text-lg">
                  {dish.name}
                </h3>
              </div>

              {/* Hover Border */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/50 rounded-xl sm:rounded-2xl transition-colors duration-300" />
            </Link>
          ))}
        </div>

        {/* CTA Buttons - 2 Buttons (Left & Right) */}
        <div className="flex flex-row items-center justify-center gap-3">
          <Link href="/events/menu">
            <Button 
              size="default"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-xs sm:text-base px-4 sm:px-6"
            >
              View Full Menu
              <ChevronRight className="size-3 sm:size-4 ml-1" />
            </Button>
          </Link>
          <Link href="/events/packages">
            <Button 
              size="default"
              variant="outline"
              className="border-amber-600 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-xs sm:text-base px-4 sm:px-6"
            >
              View Full Packages
              <ChevronRight className="size-3 sm:size-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
