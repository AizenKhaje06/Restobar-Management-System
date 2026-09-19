import { getAllBookings, getBookingStats, getAllVenues } from "@/app/actions/admin-events"
import Link from "next/link"
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  FileText,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Event Bookings - Admin",
  description: "Manage all event bookings",
}

const statusColors = {
  pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-300",
  confirmed: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-300",
  completed: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-300",
  cancelled: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-300",
}

const paymentStatusColors = {
  pending: "bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400",
  partial: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
  paid: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  refunded: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
}

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; venue?: string; search?: string }
}) {
  const [bookingsResult, statsResult, venuesResult] = await Promise.all([
    getAllBookings({
      status: searchParams.status,
      venue_id: searchParams.venue,
      search: searchParams.search,
    }),
    getBookingStats(),
    getAllVenues(),
  ])

  if (bookingsResult.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{bookingsResult.error}</p>
        </div>
      </div>
    )
  }

  const bookings = bookingsResult.bookings || []
  const stats = statsResult.stats
  const venues = venuesResult.venues || []

  // Group bookings
  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "paid") &&
      new Date(b.event_date) >= new Date()
  )
  const recentBookings = bookings.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Event Bookings</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all event bookings
          </p>
        </div>
        <Link href="/events/book">
          <Button className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
            <Calendar className="size-4 mr-2" />
            New Booking
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 rounded-xl border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
                <p className="text-3xl font-bold">{stats.total_bookings}</p>
              </div>
              <Calendar className="size-8 text-muted-foreground/30" />
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Pending Approval
                </p>
                <p className="text-3xl font-bold text-amber-600">
                  {stats.pending_bookings}
                </p>
              </div>
              <AlertCircle className="size-8 text-amber-600/30" />
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ₱{stats.total_revenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="size-8 text-green-600/30" />
            </div>
          </div>

          <div className="p-6 rounded-xl border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Pending Revenue
                </p>
                <p className="text-3xl font-bold text-orange-600">
                  ₱{stats.pending_revenue.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="size-8 text-orange-600/30" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-lg border bg-muted/30">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/admin/events/bookings">
            <Button
              variant={!searchParams.status ? "default" : "outline"}
              size="sm"
            >
              All ({stats?.total_bookings || 0})
            </Button>
          </Link>
          <Link href="/admin/events/bookings?status=pending">
            <Button
              variant={searchParams.status === "pending" ? "default" : "outline"}
              size="sm"
            >
              Pending ({stats?.pending_bookings || 0})
            </Button>
          </Link>
          <Link href="/admin/events/bookings?status=confirmed">
            <Button
              variant={
                searchParams.status === "confirmed" ? "default" : "outline"
              }
              size="sm"
            >
              Confirmed ({stats?.confirmed_bookings || 0})
            </Button>
          </Link>
          <Link href="/admin/events/bookings?status=paid">
            <Button
              variant={searchParams.status === "paid" ? "default" : "outline"}
              size="sm"
            >
              Paid ({stats?.paid_bookings || 0})
            </Button>
          </Link>
          <Link href="/admin/events/bookings?status=completed">
            <Button
              variant={
                searchParams.status === "completed" ? "default" : "outline"
              }
              size="sm"
            >
              Completed ({stats?.completed_bookings || 0})
            </Button>
          </Link>
        </div>
      </div>

      {/* Priority: Pending Approval */}
      {pendingBookings.length > 0 && !searchParams.status && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-5 text-amber-600" />
            <h2 className="text-xl font-bold">
              Requires Approval ({pendingBookings.length})
            </h2>
          </div>

          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/events/bookings/${booking.id}`}
                className="block p-5 rounded-xl border-2 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 hover:shadow-lg hover:border-amber-400 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold">
                        {booking.event_name || `${booking.event_type} Event`}
                      </h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-200 dark:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-300">
                        NEEDS REVIEW
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 flex-shrink-0" />
                        <span>
                          {new Date(booking.event_date).toLocaleDateString()}
                        </span>
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
                        <span className="font-mono text-xs">
                          {booking.booking_number}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="text-muted-foreground">
                        Customer: <span className="font-medium text-foreground">{booking.customer_name}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Contact: <span className="font-medium text-foreground">{booking.customer_phone}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-2xl font-bold text-amber-600">
                        ₱{Number(booking.total_amount).toLocaleString()}
                      </p>
                    </div>
                    <ChevronRight className="size-5 text-amber-600" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Bookings List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">
          {searchParams.status
            ? `${searchParams.status.charAt(0).toUpperCase() + searchParams.status.slice(1)} Bookings`
            : "Recent Bookings"}
        </h2>

        {recentBookings.length === 0 ? (
          <div className="text-center py-16 border rounded-2xl bg-muted/30">
            <Calendar className="size-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No bookings found</h3>
            <p className="text-muted-foreground">
              {searchParams.status || searchParams.search
                ? "Try adjusting your filters"
                : "Bookings will appear here once customers make reservations"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/events/bookings/${booking.id}`}
                className="block p-5 rounded-xl border bg-card hover:shadow-lg hover:border-amber-600 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
                        {booking.event_name || `${booking.event_type} Event`}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                          statusColors[
                            booking.status as keyof typeof statusColors
                          ]
                        }`}
                      >
                        {booking.status}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          paymentStatusColors[
                            booking.payment_status as keyof typeof paymentStatusColors
                          ]
                        }`}
                      >
                        {booking.payment_status}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 flex-shrink-0" />
                        <span>
                          {new Date(booking.event_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 flex-shrink-0" />
                        <span>
                          {booking.event_start_time} - {booking.event_end_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 flex-shrink-0" />
                        <span className="line-clamp-1">{booking.venue_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="size-4 flex-shrink-0" />
                        <span>{booking.num_guests} guests</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="font-mono text-xs text-muted-foreground">
                        {booking.booking_number}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {booking.customer_name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:flex-col lg:items-end">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Total Amount
                      </p>
                      <p className="text-xl font-bold text-amber-600">
                        ₱{Number(booking.total_amount).toLocaleString()}
                      </p>
                      {booking.payment_status !== "paid" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Paid: ₱{Number(booking.total_paid).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
