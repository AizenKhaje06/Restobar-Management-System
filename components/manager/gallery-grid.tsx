'use client'

import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface GalleryImage {
  id: string
  image_url: string
  title?: string
  category?: string
  is_active: boolean
}

interface GalleryGridProps {
  images: GalleryImage[]
}

export function GalleryGrid({ images }: GalleryGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden border">
          <Image
            src={image.image_url}
            alt={image.title || "Gallery image"}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-white text-sm font-medium truncate">
                {image.title || "Untitled"}
              </p>
              {image.category && (
                <Badge variant="secondary" className="mt-2">
                  {image.category}
                </Badge>
              )}
            </div>
          </div>
          {!image.is_active && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              Inactive
            </Badge>
          )}
        </div>
      ))}
    </div>
  )
}
