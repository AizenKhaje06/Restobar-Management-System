import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function ChefSection() {
  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Content */}
          <div className="space-y-6">
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                About Our Venue
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Perfect Space for
                <br />
                Every Celebration
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                Lydia's Lechon Restaurant offers a beautiful and versatile event space, perfect for weddings, birthdays, corporate gatherings, and special celebrations.
              </p>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Our elegant venue combines comfort, style, and top-notch service to make your event truly memorable. With customizable packages and dedicated event coordination, we ensure every detail is perfect.
              </p>
            </div>

            {/* Button */}
            <div>
              <Link href="/events/venues">
                <Button 
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm sm:text-base"
                >
                  Explore Our Venues
                  <ChevronRight className="size-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Side - Venue Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden">
              {/* Placeholder for venue image */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-amber-700" />
              <img 
                src="/LydiasBG3.png" 
                alt="Lydia's Event Venue" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            {/* Floating Badge */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
              <div className="size-20 sm:size-24 rounded-full bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center p-3">
                <div className="text-center">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                    Your
                    <br />
                    Perfect
                    <br />
                    Venue
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
