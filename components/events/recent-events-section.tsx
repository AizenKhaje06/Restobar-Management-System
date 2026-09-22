import { ImageIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const recentEvents = [
  {
    id: 1,
    title: "Maria & John's Wedding",
    type: "Wedding",
    image: "/gallery/wedding-1.jpg",
    guests: 250,
    date: "December 2023"
  },
  {
    id: 2,
    title: "TechCorp Annual Gala",
    type: "Corporate",
    image: "/gallery/corporate-1.jpg",
    guests: 300,
    date: "November 2023"
  },
  {
    id: 3,
    title: "Sofia's 18th Birthday",
    type: "Birthday",
    image: "/gallery/birthday-1.jpg",
    guests: 150,
    date: "October 2023"
  },
  {
    id: 4,
    title: "Rodriguez Family Reunion",
    type: "Reunion",
    image: "/gallery/reunion-1.jpg",
    guests: 120,
    date: "September 2023"
  },
  {
    id: 5,
    title: "New Product Launch",
    type: "Product Launch",
    image: "/gallery/launch-1.jpg",
    guests: 200,
    date: "August 2023"
  },
  {
    id: 6,
    title: "Baby Miguel's Christening",
    type: "Christening",
    image: "/gallery/christening-1.jpg",
    guests: 80,
    date: "July 2023"
  }
]

const eventTypeColors: Record<string, string> = {
  "Wedding": "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  "Corporate": "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  "Birthday": "bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400",
  "Reunion": "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  "Product Launch": "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
  "Christening": "bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400"
}

export function RecentEventsSection() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 dark:bg-rose-900/30 px-4 py-2 mb-4">
            <ImageIcon className="size-4 text-rose-600" />
            <span className="text-sm font-medium text-rose-900 dark:text-rose-400">Recent Events</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Events We've <span className="text-amber-600">Celebrated</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See the magic we've created for our recent clients. Your event could be next!
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {recentEvents.map((event) => (
            <div
              key={event.id}
              className="group relative overflow-hidden rounded-2xl bg-muted aspect-[4/3] hover:shadow-2xl transition-all duration-300"
            >
              {/* Placeholder Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-rose-950/30" />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity" />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className={`inline-flex self-start items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${eventTypeColors[event.type] || 'bg-gray-100 text-gray-600'}`}>
                  {event.type}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                <div className="flex items-center gap-4 text-sm text-white/90">
                  <span>{event.guests} guests</span>
                  <span>•</span>
                  <span>{event.date}</span>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 border-4 border-amber-600/0 group-hover:border-amber-600/50 rounded-2xl transition-all" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/events/gallery">
            <Button size="lg" variant="outline" className="group">
              <ImageIcon className="size-4 mr-2" />
              View Full Gallery
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            See more photos from our past events
          </p>
        </div>
      </div>
    </section>
  )
}
