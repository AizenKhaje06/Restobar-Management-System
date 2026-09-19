import { requireAuth } from "@/lib/auth/customer-auth"
import { getCustomerBookings } from "@/app/actions/events"
import Link from "next/link"
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Filter,
  Search,
  FileText
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "My Bookings - Event Venue",
  description: "View and manage your event bookings",
}

const statusColors = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  completed: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
}

const paymentStatusColors = {
  pending: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
  partial: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  refunded: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
}

export default async function MyBookingsPage() {
  const customer = await requireAuth()
  const { bookings, error } = await getCustomerBookings()

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/events/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Sort bookings by date (newest first)
  const sortedBookings = bookings?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || []

  // Group by status
  const upcomingBookings = sortedBookings.filter(
    b => (b.status === "confirmed" || b.status === "paid") && 
    new Date(b.event_date) >= new Date()
  )
  const pastBookings = sortedBookings.filter(
    b => b.status === "completed" || new Date(b.event_date) < new Date()
  )
  const pendingBookings = sortedBookings.filter(b => b.status === "pending")
  const cancelledBookings = sortedBookings.filter(b => b.status === "cancelled")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-8 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-rose-950/20 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                My Bookings
              </h1>
              <p className="text-muted-foreground">
                View and manage all your event bookings
              </p>
            </div>
            <Link href="/events/book">
              <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                <Calendar className="size-4 mr-2" />
                New Booking
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
              <p className="text-2xl font-bold">{sortedBookings.length}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Pending</p>
              <p className="text-2xl font-bold text-amber-600">{pendingBookings.length}</p>
            </div>
            <div className="p-4 rounded-lg border bg-card">
              <p className="text-sm text-muted-foreground mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{pastBookings.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bookings List */}
      <section className="py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="size-5 text-blue-600" />
                Upcoming Events ({upcomingBookings.length})
              </h2>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/events/dashboard/bookings/${booking.id}`}
                    className="block p-6 rounded-xl border bg-card hover:shadow-lg hover:border-amber-600 transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Title */}
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold">
                            {booking.event_name || `${booking.event_type} Event`}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                            {booking.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentStatusColors[booking.payment_status as keyof typeof paymentStatusColors]}`}>
                            {booking.payment_status}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 flex-shrink-0" />
                            <span>{new Date(booking.event_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="size-4 flex-shrink-0" />
                            <span>{booking.event_start_time} - {booking.event_end_time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="size-4 flex-shrink-0" />
                            <span className="line-clamp-1">{booking.venue_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="size-4 flex-shrink-0" />
                            <span>{booking.num_guests} guests</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="size-4 flex-shrink-0" />
                            <span className="font-mono text-xs">{booking.booking_number}</span>
                          </div>
                        </div>

                        {/* Payment Progress */}
                        {booking.payment_status !== "paid" && (
                          <div className="pt-2">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>Payment Progress</span>
                              <span>
                                ₱{Number(booking.total_paid).toLocaleString()} / ₱{Number(booking.total_amount).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-600 to-orange-600 transition-all"
                                style={{
                                  width: `${(Number(booking.total_paid) / Number(booking.total_amount)) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Amount & Action */}
                      <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Amount</p>
                          <p className="text-xl font-bold text-amber-600">
                            ₱{Number(booking.total_amount).toLocaleString()}
                          </p>
                        </div>
                        <ChevronRight className="size-5 text-muted-foreground lg:mt-2" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Pending Bookings */}
          {pendingBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="size-5 text-amber-600" />
                Pending Approval ({pendingBookings.length})
              </h2>
              <div className="space-y-4">
                {pendingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/events/dashboard/bookings/${booking.id}`}
                    className="block p-6 rounded-xl border bg-card hover:shadow-lg hover:border-amber-600 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {booking.event_name || `${booking.event_type} Event`}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.pending}`}>
                            Pending Review
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>📅 {new Date(booking.event_date).toLocaleDateString()}</span>
                          <span>🏢 {booking.venue_name}</span>
                          <span>👥 {booking.num_guests} guests</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-600">
                          ₱{Number(booking.total_amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.booking_number}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Past Bookings */}
          {pastBookings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FileText className="size-5 text-green-600" />
                Past Events ({pastBookings.length})
              </h2>
              <div className="space-y-4">
                {pastBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/events/dashboard/bookings/${booking.id}`}
                    className="block p-6 rounded-xl border bg-card hover:shadow-lg hover:border-amber-600 transition-all opacity-80 hover:opacity-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {booking.event_name || `${booking.event_type} Event`}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status as keyof typeof statusColors]}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>📅 {new Date(booking.event_date).toLocaleDateString()}</span>
                          <span>🏢 {booking.venue_name}</span>
                          <span>👥 {booking.num_guests} guests</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          ₱{Number(booking.total_amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">{booking.booking_number}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled Bookings */}
          {cancelledBookings.length > 0 && (
            <details className="space-y-4">
              <summary className="cursor-pointer text-lg font-bold flex items-center gap-2 hover:text-amber-600">
                Cancelled Bookings ({cancelledBookings.length})
              </summary>
              <div className="space-y-4 mt-4">
                {cancelledBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/events/dashboard/bookings/${booking.id}`}
                    className="block p-6 rounded-xl border bg-card hover:shadow-lg transition-all opacity-60 hover:opacity-100"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">
                            {booking.event_name || `${booking.event_type} Event`}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.cancelled}`}>
                            Cancelled
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span>📅 {new Date(booking.event_date).toLocaleDateString()}</span>
                          <span>🏢 {booking.venue_name}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.booking_number}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </details>
          )}

          {/* Empty State */}
          {sortedBookings.length === 0 && (
            <div className="text-center py-16 border rounded-2xl bg-muted/30">
              <Calendar className="size-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">
                Start by creating your first event booking
              </p>
              <Link href="/events/book">
                <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
                  <Calendar className="size-4 mr-2" />
                  Book Your First Event
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
