import { EventsNavbar } from "@/components/events/events-navbar"
import { EventsFooter } from "@/components/events/events-footer"
import { PromoBanner } from "@/components/events/promo-banner"
import { WhatsAppButton } from "@/components/events/whatsapp-button"
import { StickyCTA } from "@/components/events/sticky-cta"
import { ExitIntentPopup } from "@/components/events/exit-intent-popup"
import "./globals.css"

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PromoBanner />
      <EventsNavbar />
      <main className="flex-1">{children}</main>
      <EventsFooter />
      <WhatsAppButton />
      <StickyCTA />
      <ExitIntentPopup />
    </div>
  )
}
