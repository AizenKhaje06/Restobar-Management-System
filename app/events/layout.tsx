import { EventsNavbar } from "@/components/events/events-navbar"
import { EventsFooter } from "@/components/events/events-footer"

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <EventsNavbar />
      <main className="flex-1">{children}</main>
      <EventsFooter />
    </div>
  )
}
