"use client"

import { Star, Quote } from "lucide-react"
import { useState } from "react"

const testimonials = [
  {
    id: 1,
    name: "Maria Santos",
    role: "Bride",
    event: "Wedding Reception",
    rating: 5,
    image: "/testimonials/maria.jpg",
    text: "Our wedding was absolutely perfect! The venue was stunning, the food was exceptional, and the staff went above and beyond. Every detail was handled with care. Highly recommend for anyone planning their special day!",
    date: "December 2023"
  },
  {
    id: 2,
    name: "John Rivera",
    role: "CEO",
    event: "Corporate Event",
    rating: 5,
    image: "/testimonials/john.jpg",
    text: "We hosted our annual company celebration here and it exceeded all expectations. Professional service, state-of-the-art facilities, and seamless execution. Our 200+ employees had an amazing time!",
    date: "November 2023"
  },
  {
    id: 3,
    name: "Lisa Chen",
    role: "Mother",
    event: "18th Birthday",
    rating: 5,
    image: "/testimonials/lisa.jpg",
    text: "My daughter's debut was magical! The ballroom was elegantly decorated, the catering was superb, and our event coordinator made everything stress-free. Worth every peso!",
    date: "October 2023"
  },
  {
    id: 4,
    name: "Carlos Mendoza",
    role: "Groom",
    event: "Wedding & Reception",
    rating: 5,
    image: "/testimonials/carlos.jpg",
    text: "From booking to the actual event, everything was flawless. The team was responsive, accommodating, and professional. Our guests are still talking about how beautiful the venue was!",
    date: "September 2023"
  },
  {
    id: 5,
    name: "Anna Reyes",
    role: "Event Organizer",
    event: "Product Launch",
    rating: 5,
    image: "/testimonials/anna.jpg",
    text: "As an event planner, I've worked with many venues. This one stands out for its flexibility, modern amenities, and attentive staff. My client was thrilled with the results!",
    date: "August 2023"
  },
  {
    id: 6,
    name: "Miguel Torres",
    role: "Father",
    event: "Christening",
    rating: 5,
    image: "/testimonials/miguel.jpg",
    text: "Perfect venue for our baby's christening. The intimate setting was just what we needed, and the staff made sure everything ran smoothly. Great food and service!",
    date: "July 2023"
  }
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="py-24 bg-gradient-to-br from-amber-50 via-orange-50/50 to-rose-50 dark:from-amber-950/10 dark:via-orange-950/5 dark:to-rose-950/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/30 px-4 py-2 mb-4">
            <Star className="size-4 text-amber-600 fill-amber-600" />
            <span className="text-sm font-medium text-amber-900 dark:text-amber-400">5.0 Rating</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            What Our <span className="text-amber-600">Clients Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from couples, families, and businesses who celebrated with us
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="text-3xl font-bold text-amber-600">500+</div>
            <div className="text-sm text-muted-foreground">Events Hosted</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="text-3xl font-bold text-amber-600">5.0</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="text-3xl font-bold text-amber-600">98%</div>
            <div className="text-sm text-muted-foreground">Would Recommend</div>
          </div>
          <div className="text-center p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="text-3xl font-bold text-amber-600">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Guests</div>
          </div>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="relative rounded-3xl bg-gradient-to-br from-white to-amber-50/50 dark:from-slate-900 dark:to-amber-950/20 p-8 md:p-12 shadow-2xl">
            <Quote className="absolute top-8 left-8 size-12 text-amber-600/20" />
            
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="size-5 text-amber-500 fill-amber-500" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-xl md:text-2xl leading-relaxed mb-8 text-foreground">
                {testimonials[activeIndex].text}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xl">
                  {testimonials[activeIndex].name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-lg">{testimonials[activeIndex].name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonials[activeIndex].role} • {testimonials[activeIndex].event}
                  </div>
                  <div className="text-xs text-muted-foreground">{testimonials[activeIndex].date}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`size-2.5 rounded-full transition-all ${
                  index === activeIndex
                    ? "bg-amber-600 w-8"
                    : "bg-amber-600/30 hover:bg-amber-600/50"
                }`}
                aria-label={`View testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Grid of Additional Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(0, 3).map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="size-4 text-amber-500 fill-amber-500" />
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                "{testimonial.text}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t">
                <div className="size-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.event}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Google Reviews Link */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground mb-4">
            Read more reviews on Google
          </p>
          <a
            href="https://g.page/r/YOUR_GOOGLE_PLACE_ID/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            View Google Reviews
          </a>
        </div>
      </div>
    </section>
  )
}
