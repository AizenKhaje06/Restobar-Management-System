"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

const faqs = [
  {
    category: "Booking & Availability",
    questions: [
      {
        q: "How far in advance should I book?",
        a: "We recommend booking 3-6 months in advance for peak season (December-May) and at least 2 months ahead for other months. However, we can accommodate last-minute bookings based on availability."
      },
      {
        q: "What's your cancellation policy?",
        a: "Cancellations made 60+ days before the event receive a 90% refund. 30-59 days: 50% refund. Less than 30 days: no refund, but you can reschedule once within 12 months."
      },
      {
        q: "Can I visit the venue before booking?",
        a: "Absolutely! We offer free venue tours Monday-Friday, 10 AM - 5 PM. Weekend tours are available by appointment. Book a tour through our contact page or call us directly."
      },
      {
        q: "Do you require a deposit?",
        a: "Yes, a 30% deposit is required to secure your booking. The remaining balance is due 30 days before your event date. We accept bank transfers, credit cards, and installment plans."
      }
    ]
  },
  {
    category: "Packages & Pricing",
    questions: [
      {
        q: "What's included in your packages?",
        a: "All packages include venue rental, tables & chairs, basic sound system, air conditioning, and event coordinator. Food, beverages, and decorations vary by package. View our Packages page for detailed inclusions."
      },
      {
        q: "Can I customize a package?",
        a: "Yes! Our packages are flexible starting points. You can add or remove items, upgrade catering, or create a fully custom package. Contact us to discuss your specific needs and budget."
      },
      {
        q: "Are there hidden fees?",
        a: "No hidden fees. Your quote includes venue, selected package, service charge, and VAT. Optional add-ons (extended hours, special equipment, extra decor) are quoted separately and clearly itemized."
      },
      {
        q: "Do you offer payment plans?",
        a: "Yes, we offer flexible payment plans for events booked 4+ months in advance. Split your payment into 3-4 installments with no interest. Contact us to set up a custom payment schedule."
      }
    ]
  },
  {
    category: "Food & Beverage",
    questions: [
      {
        q: "Can we bring our own caterer?",
        a: "We have a preferred catering partner included in our packages, but you may bring an external caterer for an additional corkage fee of ₱150 per person. All external caterers must be licensed and insured."
      },
      {
        q: "Do you accommodate dietary restrictions?",
        a: "Yes! We offer vegetarian, vegan, halal, gluten-free, and allergy-friendly menu options. Inform us of any dietary needs at least 2 weeks before your event."
      },
      {
        q: "Can we bring alcohol?",
        a: "Yes, we allow outside alcohol with a corkage fee of ₱300 per bottle. Alternatively, you can purchase from our beverage menu with no corkage. We also have a bartending service available."
      },
      {
        q: "Can we have a food tasting?",
        a: "Absolutely! We offer complimentary food tastings for bookings of 100+ guests. Schedule your tasting session 4-6 weeks before your event."
      }
    ]
  },
  {
    category: "Venue & Facilities",
    questions: [
      {
        q: "How many guests can you accommodate?",
        a: "Our venues range from 50 to 500 guests. The Grand Ballroom holds 300-500, the Crystal Hall fits 150-250, and the Garden Pavilion is perfect for 50-150 guests. We'll help you choose the right space."
      },
      {
        q: "Is parking available?",
        a: "Yes, we provide free parking for up to 100 vehicles. Valet service is available for an additional fee. We're also accessible via public transport and rideshare services."
      },
      {
        q: "Do you have backup power?",
        a: "Yes, we have a commercial-grade generator that automatically activates during power outages. Your event will continue uninterrupted with full air conditioning and lighting."
      },
      {
        q: "What audio-visual equipment is included?",
        a: "All venues include a wireless microphone system, basic sound system, and projection screen. Upgraded packages include LED screens, stage lighting, and DJ equipment. Technicians are provided."
      }
    ]
  },
  {
    category: "Setup & Logistics",
    questions: [
      {
        q: "How early can we access the venue for setup?",
        a: "You can access the venue 4 hours before your event start time for setup. If you need more time, extended access is available for ₱3,000 per additional hour."
      },
      {
        q: "Do you provide decorations?",
        a: "Basic decorations (table linens, centerpieces) are included. We also partner with top decorators who can create custom themes. You're welcome to bring your own decorators or DIY decorations."
      },
      {
        q: "Can we have an outdoor ceremony and indoor reception?",
        a: "Yes! Several packages combine our Garden Pavilion for ceremonies with indoor ballrooms for receptions. We'll coordinate the transition seamlessly, and we have a rain backup plan."
      },
      {
        q: "What happens if it rains (for outdoor events)?",
        a: "All outdoor bookings include a covered backup area at no extra cost. We monitor weather and can make the call to move indoors up to 2 hours before your event. Tents are also available."
      }
    ]
  }
]

export function FaqSection() {
  const [openItems, setOpenItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setOpenItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  return (
    <section id="faq" className="py-24 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 mb-4">
            <HelpCircle className="size-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-400">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked <span className="text-amber-600">Questions</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about booking your event with us
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="max-w-5xl mx-auto space-y-12">
          {faqs.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="size-2 rounded-full bg-gradient-to-r from-amber-600 to-orange-600"></div>
                {category.category}
              </h3>
              
              <div className="space-y-3">
                {category.questions.map((faq, questionIndex) => {
                  const itemId = `${categoryIndex}-${questionIndex}`
                  const isOpen = openItems.includes(itemId)
                  
                  return (
                    <div
                      key={itemId}
                      className="rounded-xl border bg-card overflow-hidden transition-all hover:shadow-md"
                    >
                      <button
                        onClick={() => toggleItem(itemId)}
                        className="w-full flex items-center justify-between p-5 text-left font-medium hover:bg-muted/50 transition-colors"
                      >
                        <span className="text-base pr-8">{faq.q}</span>
                        <ChevronDown
                          className={`size-5 shrink-0 text-muted-foreground transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      
                      <div
                        className={`transition-all overflow-hidden ${
                          isOpen ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <div className="px-5 pb-5 pt-0 text-muted-foreground">
                          {faq.a}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 p-8 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
          <h3 className="text-2xl font-bold mb-4">Still Have Questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our event specialists are here to help. Get in touch and we'll answer all your questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/events/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:from-amber-700 hover:to-orange-700 transition-all"
            >
              Contact Us
            </a>
            <a
              href="tel:+639171234567"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-amber-600 text-amber-600 font-semibold hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-all"
            >
              Call +63 917 123 4567
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
