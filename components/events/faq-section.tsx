'use client'

import { useState } from 'react'
import { ChevronDown, MapPin, Clock, CreditCard, Calendar, Phone, Globe, Users, Utensils, PartyPopper, Gift } from 'lucide-react'
import { ScrollReveal } from '@/components/ui/scroll-reveal'

interface FAQItem {
  question: string
  answer: string
  icon: React.ElementType
  category: string
}

const faqs: FAQItem[] = [
  {
    question: "Where do you deliver?",
    answer: "We deliver within Metro Manila. For deliveries outside Metro Manila, please call our hotline at 8939-1221 or 8851-2987.",
    icon: MapPin,
    category: "Delivery"
  },
  {
    question: "How early should I place an order for a whole lechon?",
    answer: "Whole Lechon orders must be placed at least 1 day or 24 hours before the delivery date.",
    icon: Calendar,
    category: "Orders"
  },
  {
    question: "How do I ensure my order is confirmed?",
    answer: "Your order will be confirmed once payment is validated. For any concerns, please reach out to our hotline for assistance.",
    icon: Phone,
    category: "Orders"
  },
  {
    question: "What is the recommended payment method?",
    answer: "We recommend using online payment methods for quick and easy validation.",
    icon: CreditCard,
    category: "Payment"
  },
  {
    question: "Can I cancel or change my order?",
    answer: "Yes, changes or cancellations can be made up to 30 hours before the delivery date. Please call our hotline at 8939-1221. Cancellation is subject to review by Lydia's Lechon Management.",
    icon: Clock,
    category: "Policy"
  },
  {
    question: "How early should I place an international order?",
    answer: "For international orders, please place your order at least 3 days or 72 hours prior to the delivery date.",
    icon: Globe,
    category: "Delivery"
  },
  {
    question: "How do I book an event venue?",
    answer: "You can book our venue by filling out the booking form on our website or calling our events team at 8939-1221. We'll guide you through available dates and packages.",
    icon: PartyPopper,
    category: "Events"
  },
  {
    question: "What is the minimum guest count for events?",
    answer: "Our venue accommodates events with a minimum of 50 guests and can host up to 300 guests depending on the setup and package you choose.",
    icon: Users,
    category: "Events"
  },
  {
    question: "Do you provide catering for events?",
    answer: "Yes! We offer complete catering packages featuring our signature lechon and authentic Filipino dishes. Customizable menus are available to suit your event needs.",
    icon: Utensils,
    category: "Events"
  },
  {
    question: "Can I customize my event package?",
    answer: "Absolutely! We work with you to customize packages including venue setup, menu options, decorations, and additional services to make your event perfect.",
    icon: Gift,
    category: "Events"
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <ScrollReveal>
      <section className="py-16 sm:py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 lg:px-16 max-w-[1600px] relative z-10">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-amber-600 dark:text-amber-500 text-xs font-semibold uppercase tracking-wider mb-3">
            Got Questions?
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-slate-900 dark:text-white">Frequently Asked</span>{' '}
            <span className="text-amber-500 italic font-serif">Questions</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base max-w-2xl mx-auto">
            Everything you need to know about our delivery areas, order times, event bookings, and policies. 
            We make sure your Lydia's Lechon arrives fresh and on time!
          </p>
        </div>

        {/* FAQ Grid - 5 Columns x 2 Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
          {faqs.map((faq, index) => {
            const Icon = faq.icon
            const isOpen = openIndex === index
            
            return (
              <div
                key={index}
                className={`group bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border-2 flex flex-col ${
                  isOpen 
                    ? 'border-amber-500 shadow-amber-500/20' 
                    : 'border-transparent hover:border-amber-200 dark:hover:border-amber-900'
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-4 flex flex-col items-center text-center gap-3"
                >
                  {/* Icon Circle */}
                  <div className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen 
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30' 
                      : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20'
                  }`}>
                    <Icon className={`size-7 transition-colors ${
                      isOpen ? 'text-white' : 'text-amber-600 dark:text-amber-500'
                    }`} />
                  </div>

                  {/* Category Badge */}
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isOpen 
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {faq.category}
                  </span>

                  {/* Question Text */}
                  <h3 className={`font-semibold text-sm leading-tight transition-colors ${
                    isOpen 
                      ? 'text-amber-600 dark:text-amber-500' 
                      : 'text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500'
                  }`}>
                    {faq.question}
                  </h3>
                  
                  {/* Chevron */}
                  <ChevronDown 
                    className={`size-5 transition-all duration-300 ${
                      isOpen 
                        ? 'rotate-180 text-amber-600 dark:text-amber-500' 
                        : 'text-slate-400 group-hover:text-amber-600'
                    }`}
                  />
                </button>
                
                {/* Answer */}
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 pb-4">
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Still have questions?
          </p>
          <a 
            href="tel:89391221"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Phone className="size-5" />
            Call Us: 8939-1221
          </a>
        </div>
      </div>
    </section>
    </ScrollReveal>
  )
}
