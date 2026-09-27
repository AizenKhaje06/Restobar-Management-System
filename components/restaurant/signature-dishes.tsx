import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

const dishes = [
  {
    id: 1,
    name: "Appetizers",
    image: "/api/placeholder/400/300",
    category: "appetizers"
  },
  {
    id: 2,
    name: "Main Course",
    image: "/api/placeholder/400/300",
    category: "mains"
  },
  {
    id: 3,
    name: "Burgers",
    image: "/api/placeholder/400/300",
    category: "burgers"
  },
  {
    id: 4,
    name: "Desserts",
    image: "/api/placeholder/400/300",
    category: "desserts"
  }
]

export function SignatureDishes() {
  return (
    <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header - Compact */}
        <div className="mb-10">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-2">
            Our Menu
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-3">
            Discover Our
            <br />
            <span className="text-amber-600">Signature Dishes</span>
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
            From classic favorites to bold new creations, our menu is crafted to satisfy every craving
          </p>
        </div>

        {/* 2x2 Grid - Mobile First */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
          {dishes.map((dish, index) => (
            <Link
              key={dish.id}
              href={`/menu#${dish.category}`}
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

        {/* View Full Menu Button - Compact */}
        <div className="text-center">
          <Link href="/menu">
            <Button 
              size="default"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm sm:text-base px-6"
            >
              View Full Menu
              <ChevronRight className="size-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
