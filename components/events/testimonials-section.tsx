"use client"

import { Star, Quote } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    name: "Maria Santos",
    event: "Wedding Reception",
    rating: 5,
    text: "Absolutely perfect venue for our wedding! The staff was amazing, the food was delicious, and our guests couldn't stop complimenting the beautiful setup. Highly recommend!",
    avatar: "MS"
  },
  {
    name: "Juan dela Cruz",
    event: "Corporate Event",
    rating: 5,
    text: "Hosted our company's anniversary here and it was a huge success. Professional service, great amenities, and the venue exceeded our expectations. Will definitely book again!",
    avatar: "JC"
  },
  {
    name: "Anna Reyes",
    event: "18th Birthday",
    rating: 5,
    text: "My daughter's debut was magical! The team handled everything perfectly. From decorations to catering, everything was top-notch. Thank you for making it memorable!",
    avatar: "AR"
  },
  {
    name: "Roberto Lim",
    event: "Team Building",
    rating: 5,
    text: "Great venue for our team building event. Spacious, well-maintained, and the staff was very accommodating. The outdoor area was perfect for our activities.",
    avatar: "RL"
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-sm font-semibold mb-4">
            <Star className="size-4 fill-current" />
            Client Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            What Our Clients Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from our happy clients
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl border bg-card hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  {/* Avatar */}
                  <div className="flex items-center justify-center size-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold shrink-0">
                    {testimonial.avatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground truncate">{testimonial.event}</p>
                    {/* Rating */}
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="size-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>

                  {/* Quote Icon */}
                  <Quote className="size-8 text-muted-foreground/20" />
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>

          {/* Overall Rating */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl border bg-card shadow-lg">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-6 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <div className="text-left">
                <div className="text-3xl font-black">5.0</div>
                <div className="text-xs text-muted-foreground">Based on 150+ reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
