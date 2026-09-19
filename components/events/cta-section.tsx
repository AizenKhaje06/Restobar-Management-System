import Link from "next/link"
import { CalendarDays, Phone, Mail, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 sm:py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.02]" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-amber-200/30 dark:bg-amber-800/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-rose-200/30 dark:bg-rose-800/10 rounded-full blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
            Ready to Plan Your Perfect Event?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Let's make your special day unforgettable. Our team is ready to help you create amazing memories.
          </p>

          {/* Primary CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/events/book">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-2xl hover:shadow-3xl transition-all hover:scale-105 w-full sm:w-auto"
              >
                <CalendarDays className="mr-2 size-6" />
                Book Your Event Now
              </Button>
            </Link>
            <Link href="/events/contact">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg font-semibold border-2 hover:bg-white/50 dark:hover:bg-zinc-900/50 w-full sm:w-auto"
              >
                <MessageCircle className="mr-2 size-6" />
                Contact Us
              </Button>
            </Link>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <a 
              href="tel:+639171234567"
              className="p-4 rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border hover:shadow-lg transition-all group"
            >
              <Phone className="size-6 text-amber-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold">Call Us</p>
              <p className="text-xs text-muted-foreground">+63 917 123 4567</p>
            </a>

            <a 
              href="mailto:events@restaurant.com"
              className="p-4 rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border hover:shadow-lg transition-all group"
            >
              <Mail className="size-6 text-orange-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold">Email Us</p>
              <p className="text-xs text-muted-foreground">events@restaurant.com</p>
            </a>

            <a 
              href="https://wa.me/639171234567"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border hover:shadow-lg transition-all group"
            >
              <MessageCircle className="size-6 text-green-600 mb-2 mx-auto group-hover:scale-110 transition-transform" />
              <p className="text-sm font-semibold">WhatsApp</p>
              <p className="text-xs text-muted-foreground">Chat with us</p>
            </a>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border text-sm">
            <span className="size-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium">Available now to assist you</span>
          </div>
        </div>
      </div>
    </section>
  )
}
