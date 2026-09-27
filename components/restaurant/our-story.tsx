'use client'

import { useState } from 'react'
import { Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function OurStory() {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Left Side - Video/Image */}
          <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden group cursor-pointer"
            onClick={() => setIsVideoOpen(true)}
          >
            {/* Placeholder Image */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-600 to-orange-700" />
            <img 
              src="/LydiasBG3.png" 
              alt="Restaurant" 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="size-16 sm:size-20 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="size-8 sm:size-10 text-slate-900 fill-slate-900 ml-1" />
              </div>
            </div>

            {/* Bottom Text */}
            <div className="absolute bottom-4 left-4 right-4">
              <p className="text-lg sm:text-xl font-bold">
                Good Food
                <br />
                Brings People Together
              </p>
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="space-y-6">
            <div>
              <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                About Us
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Our Story
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
                Lumière Restaurant was born from a simple idea - to serve mouthwatering food in a welcoming atmosphere. For years, we've been committed to using only premium ingredients and supporting local farmers.
              </p>
              <p className="text-slate-400 text-sm">
                From our family to yours, we invite you to experience the warmth and joy that good food brings.
              </p>
            </div>

            {/* Stats - Compact */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">8+</div>
                <div className="text-xs text-slate-400">Years of Experience</div>
              </div>
              <div className="text-center border-x border-slate-700">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">50+</div>
                <div className="text-xs text-slate-400">Signature Menus</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-1">100K+</div>
                <div className="text-xs text-slate-400">Happy Customers</div>
              </div>
            </div>

            {/* Button */}
            <div>
              <Button 
                variant="outline"
                className="border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white text-sm"
              >
                Read More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setIsVideoOpen(false)}
        >
          <button
            onClick={() => setIsVideoOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-amber-400"
          >
            <X className="size-8" />
          </button>
          
          <div className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Restaurant Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  )
}
