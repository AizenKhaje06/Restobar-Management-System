'use client'

import { useState } from 'react'
import { X, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VideoModalProps {
  videoUrl?: string
  thumbnailUrl?: string
}

export function VideoModal({ 
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ",
  thumbnailUrl 
}: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Trigger Button */}
      <Button
        size="lg"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="group border-slate-600 bg-slate-800/50 px-8 py-6 text-lg font-semibold text-white backdrop-blur-sm hover:bg-slate-700/50 hover:border-slate-500"
      >
        <Play className="size-5 mr-2 fill-white" />
        Watch Video
      </Button>

      {/* Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="relative w-full max-w-5xl mx-4 animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors"
            >
              <X className="size-8" />
            </button>

            {/* Video Container */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-2xl">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={videoUrl}
                title="Event Venue Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
